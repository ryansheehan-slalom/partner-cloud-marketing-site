import LOGOS_URL from "@salesforce/resourceUrl/ecHtfLogos";
import LOGO_HUDSON from "@salesforce/resourceUrl/ecHtfLogoHudson";
import BASE_PATH from "@salesforce/community/basePath";

/**
 * ecHtfBrandData — utility module (no LWC template).
 * Contains all per-brand content, FAQ data, catalog products,
 * brand detection (document.URL — LWS-safe on LWR sites),
 * and a helper to apply CSS custom property tokens to a host element.
 */

// ---------------------------------------------------------------------------
// Brand detection — each brand runs on its own domain
// ---------------------------------------------------------------------------

/** Production host per brand. Each brand program is served from a distinct
 *  domain; the active brand is derived from the hostname (no URL params). */
export const BRAND_HOSTS = {
  htf: "htfprograms.slalomdxp.com",
  subway: "subway.htfprograms.slalomdxp.com",
  dunkin: "dunkin.htfprograms.slalomdxp.com"
};

/** Detect which brand this site is serving from the current hostname.
 *  Uses document.URL because LWS restricts window.location on LWR sites.
 *  The subway/dunkin programs live on their own subdomains; everything
 *  else (including the bare apex domain) resolves to Hudson Bank. */
export function detectBrandId() {
  const host = (
    (document.URL.match(/^https?:\/\/([^/?#]+)/i) || [])[1] || ""
  ).toLowerCase();
  const label = host.split(".")[0];
  if (label === "subway") return "subway";
  if (label === "dunkin") return "dunkin";
  return "htf";
}

/** Absolute home URL for a brand's domain — used by the brand switcher to
 *  move between program sites. */
export function getBrandUrl(brandId) {
  const hostName = BRAND_HOSTS[brandId] || BRAND_HOSTS.htf;
  return `https://${hostName}/`;
}

// ---------------------------------------------------------------------------
// Color token application
// ---------------------------------------------------------------------------

/**
 * Apply brand CSS custom properties to an element (typically a component host).
 * @param {Element} element The host element to receive the CSS variables.
 * @param {object}  colors  Brand color token map (sourced from Contentful via
 *                          ecHtfContentService.getBrandTheme). Keys: brand,
 *                          brandDeep, brand2, brand2Deep, brandTint, brandTint2,
 *                          brandOn, ink, heroInk, dark, dark2.
 */
export function applyBrandTokens(element, colors) {
  const c = colors || {};
  const vars = [
    ["--brand", c.brand],
    ["--brand-deep", c.brandDeep],
    ["--brand-2", c.brand2],
    ["--brand-2-deep", c.brand2Deep],
    ["--brand-tint", c.brandTint],
    ["--brand-tint-2", c.brandTint2],
    ["--brand-on", c.brandOn],
    ["--ink", c.ink],
    ["--hero-ink", c.heroInk],
    ["--dark", c.dark],
    ["--dark-2", c.dark2]
  ];
  vars.forEach(([prop, val]) => {
    if (val) element.style.setProperty(prop, val);
  });
}

// ---------------------------------------------------------------------------
// Icon paths (24×24 stroke)
// ---------------------------------------------------------------------------

const ICON_PATHS = {
  shield:
    '<path d="M12 3l7 2.7v5.1c0 4.6-3 7.7-7 9.2-4-1.5-7-4.6-7-9.2V5.7L12 3z"/>',
  chart: '<path d="M4 20V4M4 20h16M8 20v-6M12 20V9M16 20v-9"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4"/>',
  server:
    '<rect x="4" y="4" width="16" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="16" height="6.5" rx="1.5"/><path d="M7.5 7.2h.01M7.5 16.8h.01"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  bolt: '<path d="M13 3 4 14h6l-1 7 9-11h-6l1-7z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  layers:
    '<path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 13l9 5 9-5M3 16.5l9 5 9-5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  oven: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M8 6h.01M12 6h.01M7 13h10v5H7z"/>',
  fridge:
    '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12M9.5 6v2M9.5 13v3"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  sign: '<path d="M12 3v18M5 6h11l3 3-3 3H5z"/>',
  truck:
    '<path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  checkc: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-5.5"/>',
  dollar:
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M14.5 9.3c-.6-.8-1.6-1.1-2.5-1.1-1.4 0-2.5.8-2.5 2s1.1 1.7 2.5 1.9 2.6.6 2.6 1.9-1.2 2-2.6 2c-1 0-2-.4-2.6-1.2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  phone:
    '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  pin: '<path d="M12 21c5-5 7-8 7-11a7 7 0 1 0-14 0c0 3 2 6 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  building:
    '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
  spark:
    '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  headset:
    '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a4 4 0 0 1-4 3h-2"/>',
  users:
    '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 6M17.5 19a5.5 5.5 0 0 0-3-4.9"/>',
  star: '<path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 16.9 7.4 18l.9-5.1-3.8-3.7 5.2-.8z"/>',
  handshake:
    '<path d="M3 12l3-3 4 3 2-2 2 2 4-3 3 3M7 9v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.6 6 3.6 9s-1.1 6.4-3.6 9c-2.5-2.6-3.6-6-3.6-9S9.5 5.6 12 3z"/>',
  palette:
    '<path d="M12 3a9 9 0 0 0 0 18c1.6 0 1.9-1.2 1.1-2.1-.8-.9-.4-2.4 1.1-2.4H17a4 4 0 0 0 4-4c0-4.6-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r=".6"/><circle cx="12" cy="7.5" r=".6"/><circle cx="16.3" cy="11" r=".6"/>',
  layout:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  package:
    '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.6l8 4.5 8-4.5M12 12.1V21"/>',
  edit: '<path d="M4 20h4L18 10l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  reorder:
    '<path d="M8 4v16M8 4L5 7.2M8 4l3 3.2M16 20V4M16 20l-3-3.2M16 20l3-3.2"/>',
  storefront:
    '<path d="M4 9l1.3-4.3A1 1 0 0 1 6.2 4h11.6a1 1 0 0 1 .9.7L20 9M4 9h16M5 11v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0M9.5 20v-5h5v5"/>',
  megaphone:
    '<path d="M4 11v2a1 1 0 0 0 1 1h2l8 4.5V6.5L7 11H5a1 1 0 0 0-1 1z"/><path d="M18 9.2a4 4 0 0 1 0 5.6"/>',
  browser:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M6.2 6.3h.01M8.6 6.3h.01"/>',
  code: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
  cloud:
    '<path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.4A3.5 3.5 0 0 1 17 18H7z"/>',
  link: '<path d="M9 15l6-6M10.5 6.6l1-1a4 4 0 0 1 5.9 5.9l-1 1M13.5 17.4l-1 1a4 4 0 0 1-5.9-5.9l1-1"/>',
  external:
    '<path d="M14 4h6v6"/><path d="M20 4l-8.5 8.5"/><path d="M18 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H11"/>',
  database:
    '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  sync: '<path d="M20 11a8 8 0 0 0-14-4M4 7v4h4M4 13a8 8 0 0 0 14 4M20 17v-4h-4"/>'
};

export function getIconSvg(name, size = 22) {
  const inner = ICON_PATHS[name] || ICON_PATHS.spark;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// ---------------------------------------------------------------------------
// Slalom branding — the hub/landing experience is Slalom's own, not a program
// brand. Color tokens + the official wordmark live here so the hub can theme
// itself without a Contentful brand entry. Source: slalom.com brand library.
// ---------------------------------------------------------------------------

/** Slalom color token map (same shape applyBrandTokens expects). */
export const SLALOM_THEME = {
  brand: "#0C62FB", // Slalom Blue (logo fill)
  brandDeep: "#002FAF", // deep blue
  brand2: "#0C62FB",
  brand2Deep: "#002FAF",
  brandTint: "#E7EEFF",
  brandTint2: "#F4F7FF",
  brandOn: "#FFFFFF",
  ink: "#0A1633",
  heroInk: "#FFFFFF",
  dark: "#000A25", // near-black navy
  dark2: "#061233"
};

/** Canonical Slalom domain for the hub/landing experience. */
export const SLALOM_HUB_HOST = "contentful.slalomdxp.com";
export const SLALOM_ABOUT_URL = "https://www.slalom.com";

/** Header/footer attribution text shown on the Slalom hub. */
export const SLALOM_HUB_ATTRIBUTION =
  "Contentful + Salesforce Experience Cloud composable architecture demo site";

/**
 * Path-prefix segment that identifies the Slalom hub site. The hub's Experience
 * Cloud site is configured with urlPathPrefix "contentful"; the brand program
 * sites have no prefix. This is what makes the hub detectable.
 */
const SLALOM_HUB_PATH_KEY = "contentful";

/**
 * True when the current page is the Slalom hub/landing experience rather than a
 * program brand site. The hub is Slalom-branded chrome, not one of the
 * htf/subway/dunkin program brands.
 *
 * Detection prefers the site's base path (`@salesforce/community/basePath`),
 * which is derived from the site's urlPathPrefix and is therefore stable across
 * environments AND inside Experience Builder — where the hostname is the builder
 * domain, not the production custom domain, so a hostname-only check fails. The
 * hostname check remains as a fallback for any context where basePath is empty
 * (e.g. a custom domain that strips the prefix).
 */
export function isSlalomHub() {
  const segments = (BASE_PATH || "").toLowerCase().split("/").filter(Boolean);
  if (segments.includes(SLALOM_HUB_PATH_KEY)) return true;
  const host = (
    (document.URL.match(/^https?:\/\/([^/?#]+)/i) || [])[1] || ""
  ).toLowerCase();
  return host === SLALOM_HUB_HOST || host.split(".")[0] === "contentful";
}

// Official Slalom wordmark path data (viewBox 0 0 216 56.1).
const SLALOM_LOGO_PATHS =
  '<path d="M39.2,50.7c0,2.4,1.9,4.3,4.3,4.3h6.3V0H39.2V50.7z"/>' +
  '<path d="M82.4,19.9c-2.6-3.2-6.4-5.4-11.8-5.4c-10.9,0-19.1,8.9-19.1,20.8s8.2,20.8,19.1,20.8c5.4,0,9.2-2.2,11.8-5.4v0.1c0,2.4,1.9,4.3,4.3,4.3h6.1V15.6H82.4V19.9z M72.6,46.2c-6.2,0-10.2-4.8-10.2-10.9c0-6,4-10.9,10.2-10.9c6.1,0,10.2,4.6,10.2,10.9C82.8,41.5,78.7,46.2,72.6,46.2z"/>' +
  '<path d="M95.6,50.7c0,2.4,1.9,4.3,4.3,4.3h6.3V0H95.6V50.7z"/>' +
  '<path d="M129.2,14.5c-12.3,0-21.3,8.9-21.3,20.8s9,20.8,21.3,20.8s21.4-8.9,21.4-20.8C150.6,23.4,141.5,14.5,129.2,14.5z M129.2,46.2c-6,0-10.5-4.5-10.5-10.9s4.5-10.9,10.5-10.9s10.5,4.5,10.5,10.9S135.2,46.2,129.2,46.2z"/>' +
  '<path d="M200.4,14.5c-5.2,0-10.3,1.8-13.4,6.8c-2.6-4.2-7.3-6.8-13-6.8c-4.5,0-8.8,1.5-11.6,5.7v-4.6h-10.3v35.2c0,2.4,1.9,4.3,4.3,4.3h6.3V33.4c0-5.9,3.8-8.9,8.4-8.9c4.8,0,7.7,3.1,7.7,8.8v17.4c0,2.4,1.9,4.3,4.3,4.3h6.3V33.4c0-5.9,3.8-8.9,8.4-8.9c4.8,0,7.7,3.1,7.7,8.8v17.4c0,2.4,1.9,4.3,4.3,4.3h6.3V29.9C216,20.7,209.7,14.5,200.4,14.5z"/>' +
  '<path d="M22.7,31l-4.8-0.6c-3.6-0.6-5.9-1.2-5.8-3.5c0-2.2,1.9-3.6,5.9-3.5c3.9,0.1,7.9,1.2,11,2.4c2.1,0.8,4.6-0.1,5.5-2.2l2-4.3c-5.2-2.7-11.2-4.5-18.3-4.6c-9.3-0.3-17,4-17.2,12.2c-0.1,6.4,2.8,10.8,14.3,12.6l2.3,0.3c5.1,0.7,8.9,0.9,8.9,3.7c-0.1,2.9-3.1,3.9-9,3.8c-6-0.1-11.4-2.9-13.9-4.3L0,51.2c5.5,3.3,12.1,4.9,17.5,5c13.3,0.2,20-4.4,20.1-12.7C37.7,36.1,31.3,32,22.7,31z"/>';

/**
 * Inline Slalom wordmark as an SVG string.
 * @param {object} opts { color = Slalom Blue, height = 28 }
 */
export function getSlalomLogoSvg(opts = {}) {
  const color = opts.color || "#0C62FB";
  const height = opts.height || 28;
  const width = Math.round((height * 216) / 56.1);
  return `<svg width="${width}" height="${height}" viewBox="0 0 216 56.1" fill="${color}" role="img" aria-label="Slalom" xmlns="http://www.w3.org/2000/svg">${SLALOM_LOGO_PATHS}</svg>`;
}

// Just the "S" glyph from the wordmark, for a square favicon / app mark.
const SLALOM_S_PATH =
  "M22.7,31l-4.8-0.6c-3.6-0.6-5.9-1.2-5.8-3.5c0-2.2,1.9-3.6,5.9-3.5c3.9,0.1,7.9,1.2,11,2.4c2.1,0.8,4.6-0.1,5.5-2.2l2-4.3c-5.2-2.7-11.2-4.5-18.3-4.6c-9.3-0.3-17,4-17.2,12.2c-0.1,6.4,2.8,10.8,14.3,12.6l2.3,0.3c5.1,0.7,8.9,0.9,8.9,3.7c-0.1,2.9-3.1,3.9-9,3.8c-6-0.1-11.4-2.9-13.9-4.3L0,51.2c5.5,3.3,12.1,4.9,17.5,5c13.3,0.2,20-4.4,20.1-12.7C37.7,36.1,31.3,32,22.7,31z";

/** A square Slalom "S" app-mark as an SVG data URI, for use as a favicon. */
export function getSlalomFaviconDataUri() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect width="56" height="56" rx="12" fill="#0C62FB"/><g transform="translate(9,-8)" fill="#FFFFFF"><path d="${SLALOM_S_PATH}"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// Document <head> control (favicon + title + meta description)
// ---------------------------------------------------------------------------
// Why this is centralized + re-asserted: Safari/WebKit reads the favicon and
// title from the page at load time and (unlike Chrome) largely ignores later
// JS mutations to <link rel="icon"> and document.title. Our values are applied
// asynchronously after the brand + Contentful resolve, so on Safari they land
// "too late" and are dropped. The fix is to keep the desired head state in a
// module-level record and re-assert it on the events Safari does honor —
// window load, pageshow (incl. back/forward cache), visibilitychange — plus a
// couple of delayed ticks after first load.

let _headState = {}; // { favicon, title, description }
let _headWired = false;

function _applyHeadNow() {
  if (typeof document === "undefined") return;
  try {
    if (_headState.title && document.title !== _headState.title) {
      document.title = _headState.title;
    }
    if (_headState.description) {
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      if (meta.getAttribute("content") !== _headState.description) {
        meta.setAttribute("content", _headState.description);
      }
    }
    if (_headState.favicon) {
      const existing = document.querySelectorAll(
        "link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
      );
      // Idempotent: only rebuild the links when they are missing or pointing at
      // a different href. Tearing down and re-adding the favicon on EVERY
      // re-assertion is destructive in Safari — during a visibilitychange (which
      // fires constantly in preview, as the editor flips between Contentful and
      // the preview tab) Safari fails to re-fetch the just-removed icon and
      // falls back to the default. Leaving correct links untouched avoids that.
      const alreadyCorrect =
        existing.length > 0 &&
        Array.from(existing).every(
          (l) => l.getAttribute("href") === _headState.favicon
        );
      if (!alreadyCorrect) {
        existing.forEach((l) => l.remove());
        ["icon", "shortcut icon", "apple-touch-icon"].forEach((rel) => {
          const link = document.createElement("link");
          link.rel = rel;
          link.href = _headState.favicon;
          document.head.appendChild(link);
        });
      }
    }
  } catch (_e) {
    /* LWS may restrict document/head access */
  }
}

/**
 * Set (and durably re-assert) document head properties — favicon, title, and
 * meta description. Callers pass only what they own; values are merged, so the
 * header can set the favicon while a page component sets the title.
 *
 * @param {{favicon?:string,title?:string,description?:string}} opts
 */
export function applyHead(opts = {}) {
  if (typeof document === "undefined") return;
  _headState = { ..._headState, ...opts };
  _applyHeadNow();
  if (_headWired || typeof window === "undefined") return;
  _headWired = true;
  try {
    const reassert = () => _applyHeadNow();
    window.addEventListener("load", reassert);
    window.addEventListener("pageshow", reassert);
    document.addEventListener("visibilitychange", reassert);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(reassert, 350);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(reassert, 1500);
  } catch (_e) {
    /* environment without window/listeners */
  }
}

// ---------------------------------------------------------------------------
// Brand logo assets (static resources — kept in code, not Contentful)
// ---------------------------------------------------------------------------

/** Per-brand logo image + CSS class. Logo binaries live in static resources,
 *  so this mapping stays in code; all editorial content comes from Contentful. */
const BRAND_ASSETS = {
  htf: { logoPath: LOGO_HUDSON, logoClass: "brand-logo--htf" },
  subway: {
    logoPath: `${LOGOS_URL}/subway.png`,
    logoClass: "brand-logo--subway"
  },
  dunkin: {
    logoPath: `${LOGOS_URL}/dunkin.png`,
    logoClass: "brand-logo--dunkin"
  }
};

/** Return the logo asset (logoPath + logoClass) for a brand. */
export function getBrandAssets(brandId) {
  return BRAND_ASSETS[brandId] || BRAND_ASSETS.htf;
}

export const BRAND_ORDER = ["htf", "subway", "dunkin"];

// ---------------------------------------------------------------------------
// Application form configuration per brand
// ---------------------------------------------------------------------------

export const APP_CONFIG = {
  htf: {
    title: "Start your application.",
    lede: "One short application covers your project. Our team will structure an operating or capital lease around your refresh cycle.",
    assetsQuestion: "What are you looking to finance?",
    amountLabel: "Estimated amount to finance",
    terms: [
      "24 months",
      "36 months",
      "48 months",
      "60 months",
      "72 months",
      "Not sure yet"
    ],
    projects: ["New deployment", "Refresh / upgrade", "Expansion"],
    finTypes: ["Lease", "Loan / EFA", "Not sure — advise me"]
  },
  subway: {
    title: "Apply to lease your ovens.",
    lede: "Complete one credit application to lease your pre-selected ovens. There are no fees or added costs — just a transparent monthly lease payment with shipping included.",
    assetsQuestion: "Which ovens are you leasing?",
    amountLabel: "Estimated equipment cost",
    terms: [
      "24 months",
      "36 months",
      "48 months",
      "60 months",
      "72 months",
      "Not sure yet"
    ],
    projects: ["New restaurant", "Equipment refresh", "Oven replacement"],
    finTypes: ["Lease"]
  },
  dunkin: {
    title: "Apply to lease your DMB solution.",
    lede: "Submit your lease application for your Coates digital menu board solution. No payment is due upfront — Coates ships and installs first, then you pay monthly over a 5-year term.",
    assetsQuestion: "What are you leasing?",
    amountLabel: "Estimated DMB cost (from your Coates quote)",
    terms: ["60 months (standard 5-year term)"],
    projects: ["New build", "Remodel / next-gen", "DMB upgrade"],
    finTypes: ["Lease"]
  }
};