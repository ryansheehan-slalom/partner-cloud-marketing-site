import basePath from "@salesforce/community/basePath";

/**
 * Partner Cloud navigation helpers.
 *
 * LWR sites live under a URL prefix (e.g. /partnercloud), so internal links are
 * built from the community base path. In-page anchors (#connect, #solution…)
 * live inside separate shadow roots, so native fragment navigation can't reach
 * them; section components register their <section> here instead and links
 * scroll to it directly.
 */
export const ROUTES = Object.freeze({
  home: "/",
  approach: "/approach",
  insights: "/insights",
  article: "/insight-detail"
});

const EXTERNAL_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const anchors = new Map();
// URL whose #hash we've already scrolled to, so client-side page changes are still honored.
let handledHashUrl = null;

export function getBasePath() {
  return (basePath || "").replace(/\/+$/, "");
}

export function buildHref(path = ROUTES.home) {
  if (!path) {
    return `${getBasePath()}/`;
  }
  if (EXTERNAL_PATTERN.test(path) || path.startsWith("#")) {
    return path;
  }
  return `${getBasePath()}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Href for a home-page section. Works without JS by landing on home with a hash. */
export function anchorHref(anchorId, route = ROUTES.home) {
  return `${buildHref(route)}#${anchorId}`;
}

/**
 * Href for a section on the current page. Avoids bare "#id" hrefs, which LWC
 * treats as id references and rewrites under synthetic shadow.
 */
export function currentPageAnchorHref(anchorId) {
  return `${window.location.pathname}${window.location.search}#${anchorId}`;
}

export function articleHref(slug) {
  return `${buildHref(ROUTES.article)}?article=${encodeURIComponent(slug)}`;
}

function currentHash() {
  try {
    return decodeURIComponent((window.location.hash || "").slice(1));
  } catch {
    return "";
  }
}

function prefersReducedMotion() {
  return Boolean(
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function scrollToAnchor(anchorId) {
  const element = anchors.get(anchorId);
  if (!element || typeof element.scrollIntoView !== "function") {
    return false;
  }
  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start"
  });
  // Move keyboard/screen-reader focus to the section, like native fragment navigation.
  if (typeof element.focus === "function") {
    element.focus({ preventScroll: true });
  }
  return true;
}

export function registerAnchor(anchorId, element) {
  if (!anchorId || !element) {
    return;
  }
  anchors.set(anchorId, element);
  const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (currentHash() === anchorId && handledHashUrl !== url) {
    handledHashUrl = url;
    // Defer so the rest of the page has laid out before we scroll.
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    window.requestAnimationFrame(() => scrollToAnchor(anchorId));
  }
}

export function unregisterAnchor(anchorId, element) {
  if (anchors.get(anchorId) === element) {
    anchors.delete(anchorId);
  }
}

/**
 * Click handler helper for links whose `data-anchor` targets a registered
 * section. Scrolls in place when the section is on the current page; otherwise
 * lets the browser follow the link's href (e.g. /partnercloud/#connect).
 */
export function navigateToAnchor(event) {
  const anchorId = event?.currentTarget?.dataset?.anchor;
  if (!anchorId || !scrollToAnchor(anchorId)) {
    return false;
  }
  event.preventDefault();
  try {
    window.history.replaceState(window.history.state, "", `#${anchorId}`);
  } catch {
    // History API can be restricted in some containers; scrolling already happened.
  }
  return true;
}
