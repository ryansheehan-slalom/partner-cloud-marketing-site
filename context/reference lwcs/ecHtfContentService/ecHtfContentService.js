/**
 * ecHtfContentService — Content abstraction layer for the ecHtf multi-brand platform.
 *
 * ARCHITECTURE:
 * This module is the single integration point for all page content. Every
 * section, theme and brand-identity value is sourced from Contentful through
 * c/contentfulService. There is no local content fallback — Contentful is the
 * sole source of truth for editorial copy, brand identity and color tokens.
 *
 * The only things that remain in code are mechanics, not content:
 *   - APP_CONFIG (apply-form field/step definitions) from c/ecHtfBrandData
 *   - inline SVG icon paths + brand routing helpers (also in c/ecHtfBrandData)
 *
 * RESPONSIBILITIES:
 *   getSection(contentType, brandId)  → async, returns the mapped fields object
 *                                       a component template expects.
 *   getBrandTheme(brandId)            → async, returns the brand color token map
 *                                       for applyBrandTokens().
 *   getBrandIdentity(brandId)         → async, returns brand identity fields
 *                                       (names, attribution, switcher labels…).
 *
 * PREVIEW MODE:
 * Add ?preview to any Experience Cloud page URL to read Contentful drafts.
 * Detection + draft/published routing is handled inside c/contentfulService.
 *
 * CACHING:
 * Handled by c/contentfulService (short-TTL in-memory cache + in-flight
 * de-duplication). This module is a thin, stateless mapping layer on top.
 */

import {
  getEntry,
  getPageLayout as _cfGetPageLayout,
  isPreviewMode as _cfIsPreviewMode,
  invalidateContent as _cfInvalidate
} from "c/contentfulService";
import { APP_CONFIG } from "c/ecHtfBrandData";

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Resolve the CMS-defined page layout for a brand + route.
 * Returns { route, title, sections: [{ id, type, pageType }] } in render order,
 * or null when no matching page entry exists. The section `type` is a Contentful
 * content type id that the contentfulSection dispatcher maps to an LWC.
 *
 * @param {string} route   Page route (home, about, faq, contact, catalog, apply).
 * @param {string} brandId Brand to resolve (htf, subway, dunkin).
 * @returns {Promise<object|null>}
 */
export async function getPage(route, brandId) {
  return _cfGetPageLayout(route, { brandId });
}

/**
 * Resolve the Slalom hub/landing page content from Contentful.
 *
 * The hub is the Slalom-branded overview experience (contentful.slalomdxp.com).
 * Its content lives in a single `hubPage` entry (brandId "slalom"). As of
 * migration 07 the hub is a fully typed, referenced content model: section
 * headers are plain fields on `hubPage`, and every repeating list is its own
 * content type linked by reference (hubBrandCard, hubAudienceGroup,
 * hubCapability, hubTechPillar, hubStackItem, hubDiagramNode, hubBrandPage).
 *
 * This function maps that normalized entry back into the block shape the
 * ecHtfHubPage component renders, with safe empty defaults so it can paint
 * progressively. Returns null only when no hub entry exists at all.
 *
 * Output block shapes:
 *   hero          { eyebrow, titleLead, titleAccent, lede, primaryCtaLabel,
 *                   primaryCtaAnchor, secondaryCtaLabel, secondaryCtaAnchor }
 *   brandShowcase { eyebrow, title, body, brands:[{id,tag,name,domain,enterUrl,
 *                   description,pages:[{label,exclusive}]}] }
 *   howItWorks    { eyebrow, title, body, groups:[{icon,title,body,points:[]}] }
 *   capabilities  { eyebrow, title, body, cards:[{icon,title,body,bullets:[]}] }
 *   technical     { eyebrow, title, body, pillars:[{icon,title,body}] }
 *   diagram       { eyebrow, title, caption, editorNote, webhookNote, cms,
 *                   integration, site, brands:[{name,domain}] }
 *   comparison    { title, traditionalLabel, traditional:[], newLabel, modern:[] }
 *   stack         { eyebrow, title, items:[{layer,tech,note}] }
 *
 * @returns {Promise<object|null>}
 */
export async function getHubContent() {
  const e = await getEntry("hubPage", { brandId: "slalom" });
  if (!e) return null;

  const resolved = (arr) =>
    (Array.isArray(arr) ? arr : []).filter((x) => x && !x._unresolved);

  const brands = resolved(e.brandCards).map((b) => ({
    id: b.brandKey || "",
    tag: b.tag || "",
    name: b.name || "",
    domain: b.domain || "",
    enterUrl: b.enterUrl || "#",
    description: b.description || "",
    pages: resolved(b.pages).map((p) => ({
      label: p.label || "",
      exclusive: p.exclusiveBadge || null
    }))
  }));

  // Diagram nodes are keyed by position (cms/integration/site).
  const nodes = resolved(e.diagramNodes);
  const nodeByKey = (key) => {
    const n = nodes.find((x) => x.nodeKey === key);
    return n
      ? { label: n.label || "", items: Array.isArray(n.items) ? n.items : [] }
      : { label: "", items: [] };
  };

  return {
    hero: {
      eyebrow: e.heroEyebrow || "",
      titleLead: e.heroTitleLead || "",
      titleAccent: e.heroTitleAccent || "",
      lede: e.heroLede || "",
      primaryCtaLabel: e.heroPrimaryCtaLabel || "",
      primaryCtaAnchor: e.heroPrimaryCtaAnchor || "",
      secondaryCtaLabel: e.heroSecondaryCtaLabel || "",
      secondaryCtaAnchor: e.heroSecondaryCtaAnchor || ""
    },
    brandShowcase: {
      eyebrow: e.brandShowcaseEyebrow || "",
      title: e.brandShowcaseTitle || "",
      body: e.brandShowcaseBody || "",
      brands
    },
    howItWorks: {
      eyebrow: e.howEyebrow || "",
      title: e.howTitle || "",
      body: e.howBody || "",
      groups: resolved(e.audienceGroups).map((g) => ({
        icon: g.icon || "spark",
        title: g.title || "",
        body: g.body || "",
        points: Array.isArray(g.points) ? g.points : []
      }))
    },
    capabilities: {
      eyebrow: e.capabilitiesEyebrow || "",
      title: e.capabilitiesTitle || "",
      body: e.capabilitiesBody || "",
      cards: resolved(e.capabilityCards).map((c) => ({
        icon: c.icon || "spark",
        title: c.title || "",
        body: c.body || "",
        bullets: Array.isArray(c.bullets) ? c.bullets : []
      }))
    },
    technical: {
      eyebrow: e.technicalEyebrow || "",
      title: e.technicalTitle || "",
      body: e.technicalBody || "",
      pillars: resolved(e.techPillars).map((p) => ({
        icon: p.icon || "spark",
        title: p.title || "",
        body: p.body || ""
      }))
    },
    diagram: {
      eyebrow: e.diagramEyebrow || "",
      title: e.diagramTitle || "",
      caption: e.diagramCaption || "",
      editorNote: e.diagramEditorNote || "",
      webhookNote: e.diagramWebhookNote || "",
      cms: nodeByKey("cms"),
      integration: nodeByKey("integration"),
      site: nodeByKey("site"),
      brands: brands.map((b) => ({ name: b.name, domain: b.domain }))
    },
    comparison: {
      title: e.comparisonTitle || "",
      traditionalLabel: e.comparisonTraditionalLabel || "",
      traditional: Array.isArray(e.comparisonTraditional)
        ? e.comparisonTraditional
        : [],
      newLabel: e.comparisonNewLabel || "",
      modern: Array.isArray(e.comparisonModern) ? e.comparisonModern : []
    },
    stack: {
      eyebrow: e.stackEyebrow || "",
      title: e.stackTitle || "",
      items: resolved(e.stackItems).map((s) => ({
        layer: s.layer || "",
        tech: s.tech || "",
        note: s.note || ""
      }))
    }
  };
}

/**
 * Detect whether the current page is in Contentful preview mode.
 * Delegates to c/contentfulService so detection is consistent site-wide.
 */
export function isPreviewMode() {
  return _cfIsPreviewMode();
}

/**
 * Invalidate cached content. Delegates to c/contentfulService.
 *   invalidateContent()              — clears everything
 *   invalidateContent('heroSection') — clears all entries of that content type
 */
export function invalidateContent(contentType) {
  return _cfInvalidate(contentType);
}

/**
 * Primary content accessor — async.
 * Fetches the Contentful entry for the given content type + brand and maps it
 * to the exact shape the consuming component template expects.
 *
 * Content types:
 *   heroSection       — Home page hero panel
 *   statSection       — Stats band
 *   financeSection    — "What we finance" asset grid
 *   processSection    — "How it works" steps
 *   featureSection    — Feature split panel
 *   ctaSection        — CTA band (home / about)
 *   pageHero          — Interior page hero config (object keyed by pageType)
 *   aboutSection      — About page story + values + stat line
 *   faqSection        — FAQ items + categories
 *   contactSection    — Contact form options + info
 *   catalogSection    — Catalog products (returns null when the brand has none)
 *   applicationConfig — Apply page form config (sourced from code, not Contentful)
 *
 * @param {string} contentType
 * @param {string} brandId
 * @returns {Promise<object|null>}
 */
export async function getSection(contentType, brandId) {
  if (contentType === "applicationConfig") {
    return _applyFields(brandId);
  }

  const entry = await getEntry(contentType, { brandId });

  switch (contentType) {
    case "heroSection":
      return _heroFields(entry, brandId);
    case "statSection":
      return _statFields(entry);
    case "financeSection":
      return _financeFields(entry);
    case "processSection":
      return _processFields(entry);
    case "featureSection":
      return _featureFields(entry);
    case "ctaSection":
      return _ctaFields(entry);
    case "pageHero":
      return _pageHeroFields(entry);
    case "aboutSection":
      return _aboutFields(entry);
    case "faqSection":
      return _faqFields(entry);
    case "contactSection":
      return _contactFields(entry);
    case "catalogSection":
      return _catalogFields(entry);
    default:
      return entry || {};
  }
}

/**
 * Return the brand color token map (the object applyBrandTokens expects).
 * brand.colorScheme is a resolved colorScheme entry — its fields map 1:1 to
 * CSS custom property keys used by applyBrandTokens.
 * @param {string} brandId
 * @returns {Promise<object>}
 */
export async function getBrandTheme(brandId) {
  const brand = await getEntry("brand", { brandId });
  if (!brand) return {};
  const scheme = brand.colorScheme;
  if (!scheme || scheme._unresolved) return {};
  // Strip Contentful meta fields; return only color token keys.
  const {
    _id,
    _contentType,
    _updatedAt,
    internalName: _internalName,
    ...colors
  } = scheme;
  return colors;
}

/**
 * Return brand identity fields used by chrome components (header, footer, CTA).
 * @param {string} brandId
 * @returns {Promise<object>}
 */
export async function getBrandIdentity(brandId) {
  const brand = await getEntry("brand", { brandId });
  if (!brand) return { id: brandId };
  // attributionLinks is now an array of resolved attributionLink entries.
  const rawLinks = Array.isArray(brand.attributionLinks)
    ? brand.attributionLinks
    : [];
  const attributionLinks = rawLinks
    .filter((l) => l && !l._unresolved)
    .map((l) => ({
      label: l.label || "",
      href: l.href || "",
      external: !!l.openInNewTab
    }));
  return {
    id: brandId,
    name: brand.name || "",
    programName: brand.programName || "",
    legalName: brand.legalName || "",
    shortLabel: brand.shortLabel || brand.programName || brand.name || "",
    domain: brand.domain || "",
    initials: brand.initials || "",
    switchTag: brand.switchTag || "",
    attribution: brand.attribution || "",
    attributionLinks,
    hasCatalog: !!brand.hasCatalog,
    solutionsLabel: brand.solutionsLabel || "What We Finance"
  };
}

// ── Content builders (map a normalized Contentful entry → template shape) ─────

function _heroFields(entry, brandId) {
  const h = entry || {};

  // titleAccent is now a plain Symbol field; reconstruct titleParts for the
  // component which renders [{text, accent}] spans.
  const title = h.title || "";
  const accent = h.titleAccent || "";
  let titleParts;
  if (accent && title.includes(accent)) {
    const idx = title.lastIndexOf(accent);
    titleParts = [
      { text: title.substring(0, idx), accent: false },
      { text: accent, accent: true }
    ];
  } else {
    titleParts = [{ text: title || "Asset financing.", accent: false }];
  }

  // assurances are now resolved assurance entries.
  const rawAssurances = Array.isArray(h.assurances) ? h.assurances : [];
  const assurances = rawAssurances
    .filter((a) => a && !a._unresolved)
    .map((a, i) => ({
      id: a._id || `a-${i}`,
      icon: a.icon || "",
      text: a.text || ""
    }));

  return {
    eyebrow: h.eyebrow || "Equipment Financing",
    titleParts,
    lede: h.lede || "",
    ctaPrimaryLabel: h.ctaPrimaryLabel || "Get started",
    ctaSecondaryLabel: h.ctaSecondaryLabel || "Learn more",
    ctaSecondaryAnchor: h.ctaSecondaryAnchor || "finance",
    ctaSecondaryCatalog: !!h.ctaSecondaryCatalog,
    assurances,
    floatcardIcon: h.floatcardIcon || "server",
    floatcardTitle: h.floatcardTitle || "Fast approvals",
    floatcardSub: h.floatcardSub || "24–48 hr decisions",
    artType: h.artType || brandId || "htf"
  };
}

function _statFields(entry) {
  // stats is now an array of resolved statItem entries.
  const rawStats = entry && Array.isArray(entry.stats) ? entry.stats : [];
  return {
    stats: rawStats
      .filter((s) => s && !s._unresolved)
      .map((s) => ({
        id: s._id || s.internalName || "",
        num: s.num || "",
        unit: s.unit || "",
        label: s.label || "",
        hasUnit: !!(s.unit && String(s.unit).length > 0)
      }))
  };
}

function _financeFields(entry) {
  const f = entry || {};
  // assetCategories is now an array of resolved assetCategory entries.
  const raw = Array.isArray(f.assetCategories) ? f.assetCategories : [];
  return {
    eyebrow: f.eyebrow || "Asset Categories",
    title: f.title || "What we finance",
    body: f.body || "",
    assets: raw
      .filter((a) => a && !a._unresolved)
      .map((a, i) => ({
        id: a._id || `asset-${i}`,
        icon: a.icon || "server",
        title: a.title || "",
        body: a.body || "",
        chipsArr: Array.isArray(a.chips)
          ? a.chips.map((c, j) => ({ id: `c${i}-${j}`, label: c }))
          : []
      }))
  };
}

function _processFields(entry) {
  // steps is now an array of resolved processStep entries.
  const raw = entry && Array.isArray(entry.steps) ? entry.steps : [];
  const filtered = raw.filter((s) => s && !s._unresolved);
  return {
    steps: filtered.map((s, i) => ({
      id: s._id || `step-${i}`,
      title: s.title || "",
      body: s.body || "",
      stepNum: String(i + 1),
      isLast: i === filtered.length - 1
    }))
  };
}

function _featureFields(entry) {
  const f = entry || {};
  // featurePoints is now an array of resolved featurePoint entries.
  const raw = Array.isArray(f.featurePoints) ? f.featurePoints : [];
  return {
    eyebrow: f.eyebrow || "Why Hudson Bank",
    title: f.title || "Financing designed around your business",
    body: f.body || "",
    note: f.note || "Subject to credit approval.",
    list: raw
      .filter((item) => item && !item._unresolved)
      .map((item, i) => ({
        id: item._id || `feat-${i}`,
        icon: item.icon || "check",
        title: item.title || "",
        sub: item.body || "" // Contentful field is "body"; component expects "sub"
      }))
  };
}

function _ctaFields(entry) {
  const c = entry || {};
  return {
    title: c.title || "Ready to get started?",
    body: c.body || "Tell us about your equipment needs."
  };
}

function _pageHeroFields(entry) {
  // variants is now an array of resolved pageHeroVariant entries.
  // Convert to an object keyed by pageType so the component can do content[pageType].
  const raw = entry && Array.isArray(entry.variants) ? entry.variants : [];
  const result = {};
  raw
    .filter((v) => v && !v._unresolved && v.pageType)
    .forEach((v) => {
      result[v.pageType] = {
        eyebrow: v.eyebrow || "",
        title: v.title || "",
        lede: v.lede || ""
      };
    });
  return result;
}

function _aboutFields(entry) {
  const a = entry || {};
  const story =
    typeof a.story === "string"
      ? a.story
          .split(/\n\s*\n/)
          .map((t) => t.trim())
          .filter((t) => t.length)
      : Array.isArray(a.story)
        ? a.story
        : [];

  // values is now an array of resolved brandValue entries.
  const rawValues = Array.isArray(a.values) ? a.values : [];
  const values = rawValues
    .filter((v) => v && !v._unresolved)
    .map((v, i) => ({
      id: v._id || `val-${i}`,
      icon: v.icon || "check",
      title: v.title || "",
      body: v.body || ""
    }));

  // statline is now an array of resolved statItem entries.
  const rawStatline = Array.isArray(a.statline) ? a.statline : [];
  const statline = rawStatline
    .filter((s) => s && !s._unresolved)
    .map((s, i) => ({
      id: s._id || `sl-${i}`,
      num: s.num || "",
      label: s.label || ""
    }));

  return {
    lede: a.lede || "",
    story,
    values,
    statline,
    relationship: {
      eyebrow: a.relationshipEyebrow || "",
      title: a.relationshipTitle || "",
      body: a.relationshipBody || ""
    }
  };
}

function _faqFields(entry) {
  const e = entry || {};
  // `items` is an array of resolved faqItem entries (linked references).
  // Each resolved item has: _id, question, answer, category.
  const rawItems = Array.isArray(e.items) ? e.items : [];
  return {
    heroLede:
      e.heroLede ||
      "Find answers to the most common questions about the program.",
    contactBlurb: e.contactBlurb || "Our team is here to help.",
    items: rawItems
      .filter((item) => item && !item._unresolved)
      .map((item) => ({
        id: item._id,
        cat: item.category || "",
        q: item.question || "",
        a: item.answer || ""
      }))
  };
}

function _contactFields(entry) {
  const c = entry || {};
  return {
    heroLede: c.heroLede || c.blurb || "",
    phone: c.phone || "",
    email: c.email || "",
    hours: c.hours || "",
    address: c.address || "",
    blurb: c.blurb || "",
    topicOptions: Array.isArray(c.topicOptions) ? c.topicOptions : []
  };
}

function _catalogFields(entry) {
  // products is now an array of resolved catalogProduct entries.
  if (!entry || !Array.isArray(entry.products)) return null;
  const raw = entry.products.filter((p) => p && !p._unresolved);
  if (!raw.length) return null;
  const products = raw.map((p) => ({
    id: p._id || "",
    name: p.name || "",
    cat: p.category || "",
    icon: p.icon || "server",
    desc: p.description || "",
    price: p.monthlyPrice != null ? p.monthlyPrice : 0,
    tag: p.manufacturer || ""
  }));
  return {
    heroLede:
      entry.heroLede ||
      "Browse and select the pre-approved ovens for your franchise location.",
    categories: [...new Set(products.map((p) => p.cat))],
    products
  };
}

function _applyFields(brandId) {
  return { ...(APP_CONFIG[brandId] || APP_CONFIG.htf) };
}