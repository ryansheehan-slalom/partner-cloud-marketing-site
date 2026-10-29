/**
 * contentfulService — client-side data layer for Contentful.
 *
 * This is the single integration point LWCs use to read Contentful content.
 * It wraps the ContentfulService Apex class and adds:
 *   - Preview detection: ?preview (or ?preview=true) anywhere in the page URL
 *     switches every request to the Content Preview API so drafts are visible
 *     site-wide. Without it, the Content Delivery API serves published content.
 *   - Client caching: published responses are cached for a short TTL to avoid
 *     repeat callouts. Preview requests are never cached so editors see live
 *     draft changes.
 *   - Link resolution: Contentful returns referenced entries/assets in an
 *     `includes` block; normalizeResponse() inlines them into each entry so
 *     consumers get plain, ready-to-render objects.
 *
 * Detection uses document.URL — the LWS-safe alternative to window.location on
 * LWR Experience Cloud sites.
 *
 * Usage:
 *   import { getEntries, getEntry, isPreviewMode } from 'c/contentfulService';
 *   const [hero] = await getEntries('heroSection', { brandId: 'htf', limit: 1 });
 */

import getPublishedEntries from "@salesforce/apex/ContentfulService.getPublishedEntries";
import getDraftEntries from "@salesforce/apex/ContentfulService.getDraftEntries";
import getPublishedBrandEntries from "@salesforce/apex/ContentfulService.getPublishedBrandEntries";
import getDraftBrandEntries from "@salesforce/apex/ContentfulService.getDraftBrandEntries";

// ── Client cache ──────────────────────────────────────────────────────────────
// In-memory only: this Map lives on the loaded JS module instance, so it is
// cleared on every full page reload. That is intentional — a browser refresh
// always pulls fresh content from Contentful (the Apex layer is not cacheable),
// while the TTL still de-dupes repeat callouts within a single page render.
const _cache = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes; matches the default CMS Config TTL.

function _key(contentType, params) {
  return `${contentType || ""}::${JSON.stringify(params || {})}`;
}

function _read(contentType, params) {
  const hit = _cache.get(_key(contentType, params));
  if (!hit || Date.now() - hit.ts > TTL_MS) return null;
  return hit.data;
}

function _write(contentType, params, data) {
  _cache.set(_key(contentType, params), { data, ts: Date.now() });
}

// In-flight request de-duplication: when many components mount at once they
// often ask for the same content (e.g. every section requests its brand's
// theme). This Map holds the pending promise for an identical query so the
// concurrent callers share a single Apex callout instead of each firing one.
const _inflight = new Map();

// Brand-level batch cache: one Contentful API call fetches ALL entries for a
// brand. Subsequent getEntries({brandId}) calls are served from this map
// without any additional callouts, preventing the burst of parallel requests
// that triggered Contentful 429 rate-limit errors.
//
// Keyed by `${brandId}:${preview}` → Map<contentType, NormalizedEntry[]>
const _brandMap = new Map();
const _brandInflight = new Map();

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Detect whether the current page is in Contentful preview mode.
 * Returns true for ?preview, ?preview=true and ?preview=1; false for
 * ?preview=false / 0 / no, and when the param is absent.
 */
export function isPreviewMode() {
  const match = document.URL.match(/[?&]preview(?:=([^&#]*))?/i);
  if (!match) return false;
  const value = (match[1] || "").toLowerCase();
  return value !== "false" && value !== "0" && value !== "no";
}

/**
 * Clear cached published content.
 * Call after a Contentful publish webhook fires, or when switching content.
 *   invalidateContent()              — clears everything
 *   invalidateContent('heroSection') — clears all entries of that content type
 */
export function invalidateContent(contentType) {
  if (!contentType) {
    _cache.clear();
    _brandMap.clear();
    return;
  }
  for (const key of _cache.keys()) {
    if (key.startsWith(contentType + "::")) _cache.delete(key);
  }
  // Brand map entries index by content type, so invalidating any content type
  // means the whole brand bundle needs to be re-fetched.
  _brandMap.clear();
}

/**
 * Fetch and normalize entries of a content type.
 *
 * @param {string} contentType Contentful content type id (e.g. heroSection).
 * @param {object} [options]
 * @param {string} [options.brandId]  Filter on fields.brandId.
 * @param {number} [options.limit]    Max entries to return.
 * @param {number} [options.include]  Link resolution depth (default 2).
 * @param {string} [options.order]    Contentful order expression.
 * @param {object} [options.params]   Any additional raw query parameters.
 * @param {boolean} [options.preview] Force preview/published; defaults to URL.
 * @returns {Promise<Array<object>>} Normalized entries (links inlined).
 */
export async function getEntries(contentType, options = {}) {
  const preview =
    options.preview === undefined ? isPreviewMode() : !!options.preview;

  // Fast path: when a brandId is present, use the brand-level batch cache.
  // A single Contentful call fetches every content type for the brand at once;
  // subsequent calls for the same brand are served from the in-memory index
  // without any additional Apex or Contentful callouts.
  if (options.brandId) {
    const byType = await _getBrandEntries(options.brandId, preview);
    const items = byType.get(contentType) || [];
    const limit =
      options.limit !== undefined ? Number(options.limit) : items.length;
    return items.slice(0, limit);
  }

  // Fallback: individual fetch for calls without a brandId.
  const params = { ...(options.params || {}) };
  if (options.limit !== undefined) params.limit = String(options.limit);
  params.include = String(options.include === undefined ? 2 : options.include);
  if (options.order) params.order = options.order;

  if (!preview) {
    const cached = _read(contentType, params);
    if (cached) return cached;
  }

  const inflightKey = preview ? null : _key(contentType, params);
  if (inflightKey && _inflight.has(inflightKey)) {
    return _inflight.get(inflightKey);
  }

  const fetchPromise = (async () => {
    const raw = preview
      ? await getDraftEntries({ contentType, params })
      : await getPublishedEntries({ contentType, params });

    const normalized = normalizeResponse(JSON.parse(raw));
    if (!preview) _write(contentType, params, normalized);
    return normalized;
  })();

  if (inflightKey) {
    _inflight.set(inflightKey, fetchPromise);
    try {
      return await fetchPromise;
    } finally {
      _inflight.delete(inflightKey);
    }
  }

  return fetchPromise;
}

/**
 * Fetches all entries for a brand in one Contentful callout and indexes the
 * result by content type. Concurrent callers for the same brand share a single
 * in-flight promise; the result is cached for the page lifetime (published) or
 * not at all (preview).
 */
async function _getBrandEntries(brandId, preview) {
  const cacheKey = `${brandId}:${preview}`;

  if (!preview && _brandMap.has(cacheKey)) {
    return _brandMap.get(cacheKey);
  }
  if (_brandInflight.has(cacheKey)) {
    return _brandInflight.get(cacheKey);
  }

  const promise = (async () => {
    const raw = preview
      ? await getDraftBrandEntries({ brandId })
      : await getPublishedBrandEntries({ brandId });

    const entries = normalizeResponse(JSON.parse(raw));
    const byType = new Map();
    entries.forEach((entry) => {
      const type = entry._contentType;
      if (!type) return;
      // The bundle spans every brand (Contentful can't field-filter without a
      // content_type), so scope to this brand here. Brand-scoped section
      // entries carry a brandId field; entries without one are shared/global
      // and kept for every brand.
      if (entry.brandId !== undefined && entry.brandId !== brandId) return;
      if (!byType.has(type)) byType.set(type, []);
      byType.get(type).push(entry);
    });

    if (!preview) _brandMap.set(cacheKey, byType);
    return byType;
  })();

  _brandInflight.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    _brandInflight.delete(cacheKey);
  }
}

/**
 * Convenience helper returning the first matching entry, or null.
 * @param {string} contentType Contentful content type id.
 * @param {object} [options]   Same options as getEntries.
 * @returns {Promise<object|null>}
 */
export async function getEntry(contentType, options = {}) {
  const items = await getEntries(contentType, { ...options, limit: 1 });
  return items.length ? items[0] : null;
}

/**
 * Resolve the CMS-defined layout for a brand's page.
 *
 * Reads the `page` entry matching the brand + route from the shared brand
 * bundle (no extra callout) and returns the ordered list of sections to
 * render. Each descriptor carries the section's content type — which maps to
 * an LWC in the dispatcher — and, for interior page heroes, the page type.
 *
 * Composition (which sections, in what order) lives entirely in Contentful, so
 * editors can reorder, add, remove or reuse sections per brand without a deploy.
 *
 * @param {string} route            Page route (home, about, faq, …).
 * @param {object} [options]
 * @param {string} options.brandId  Brand to resolve the page for (required).
 * @param {boolean} [options.preview] Force preview/published; defaults to URL.
 * @returns {Promise<{route:string,title:string,seoTitle:string,seoDescription:string,sections:Array<{id:string,type:string,pageType:?string}>}|null>}
 */
export async function getPageLayout(route, options = {}) {
  if (!route || !options.brandId) return null;

  const pages = await getEntries("page", {
    brandId: options.brandId,
    preview: options.preview
  });

  const target = String(route).toLowerCase();
  const page = pages.find(
    (p) => String(p.route || "").toLowerCase() === target
  );
  if (!page) return null;

  const rawSections = Array.isArray(page.sections) ? page.sections : [];
  const sections = rawSections
    .filter((s) => s && !s._unresolved && s._contentType)
    .map((s) => ({
      id: s._id,
      type: s._contentType,
      // pageHeroVariant entries carry the interior page type the hero renders.
      pageType: s.pageType || null
    }));

  return {
    route: page.route,
    title: page.title || "",
    seoTitle: page.seoTitle || "",
    seoDescription: page.seoDescription || "",
    sections
  };
}

// ── Response normalization ────────────────────────────────────────────────────

/**
 * Inline linked entries/assets from a Contentful collection response so each
 * item is a flat object of resolved fields plus an `_id`/`_contentType` meta.
 *
 * @param {object} response Raw Contentful "/entries" collection response.
 * @returns {Array<object>} Normalized entries.
 */
export function normalizeResponse(response) {
  if (!response || !Array.isArray(response.items)) return [];

  const byId = new Map();
  const register = (resource) => {
    if (resource && resource.sys && resource.sys.id) {
      byId.set(resource.sys.id, resource);
    }
  };
  response.items.forEach(register);
  const includes = response.includes || {};
  (includes.Entry || []).forEach(register);
  (includes.Asset || []).forEach(register);

  return response.items.map((item) => resolveResource(item, byId, new Set()));
}

/**
 * Resolve a single entry/asset into a plain object, following links via the
 * id map. A `seen` set guards against circular references.
 */
function resolveResource(resource, byId, seen) {
  if (!resource || !resource.sys) return resource;

  if (resource.sys.type === "Asset") {
    return resolveAsset(resource);
  }

  const id = resource.sys.id;
  if (seen.has(id)) return { _id: id, _circular: true };
  // Backtracking guard: mark this id while resolving its own subtree, then
  // unmark on the way out. This blocks cycles along the current path without
  // cloning the set at every node (the old `new Set(seen)` was O(nodes × depth)
  // allocations — costly on the full-space bundle) while still letting an entry
  // legitimately appear under multiple sibling references.
  seen.add(id);

  const out = {
    _id: id,
    _contentType:
      resource.sys.contentType && resource.sys.contentType.sys
        ? resource.sys.contentType.sys.id
        : undefined,
    _updatedAt: resource.sys.updatedAt
  };

  const fields = resource.fields || {};
  Object.keys(fields).forEach((key) => {
    out[key] = resolveValue(fields[key], byId, seen);
  });
  seen.delete(id);
  return out;
}

/** Resolve a field value, following links and arrays of links. */
function resolveValue(value, byId, seen) {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveValue(entry, byId, seen));
  }
  if (value && value.sys && value.sys.type === "Link") {
    const target = byId.get(value.sys.id);
    if (!target) {
      // Unresolved link (e.g. unpublished reference or beyond include depth).
      return {
        _id: value.sys.id,
        _unresolved: true,
        _linkType: value.sys.linkType
      };
    }
    return resolveResource(target, byId, seen);
  }
  return value;
}

/** Flatten a Contentful asset into a simple { url, title, ... } object. */
function resolveAsset(asset) {
  const fields = asset.fields || {};
  const file = fields.file || {};
  let url = file.url || "";
  if (url.startsWith("//")) url = "https:" + url; // Contentful returns protocol-relative URLs.
  return {
    _id: asset.sys.id,
    _contentType: "asset",
    url,
    title: fields.title || "",
    description: fields.description || "",
    contentType: file.contentType || "",
    details: file.details || {}
  };
}