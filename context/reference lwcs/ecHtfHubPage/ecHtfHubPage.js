import { LightningElement, track } from "lwc";
import BASE_PATH from "@salesforce/community/basePath";
import {
  applyBrandTokens,
  getIconSvg,
  applyHead,
  SLALOM_THEME,
  SLALOM_HUB_HOST
} from "c/ecHtfBrandData";
import { getHubContent, isPreviewMode } from "c/ecHtfContentService";

// Abstract hub-and-spoke illustration: a composable framework (Salesforce +
// Contentful logos side by side) at the center, with spokes radiating to many
// generic site nodes. Deliberately brand-agnostic — no demo-brand specifics.
const SITE_NODE = `<rect width="58" height="42" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(91,155,255,0.45)" stroke-width="1.3"/><circle cx="9" cy="9" r="2" fill="#5B9BFF" opacity="0.7"/><circle cx="16" cy="9" r="2" fill="#5B9BFF" opacity="0.7"/><circle cx="23" cy="9" r="2" fill="#5B9BFF" opacity="0.7"/><rect x="8" y="20" width="42" height="4" rx="2" fill="rgba(255,255,255,0.18)"/><rect x="8" y="28" width="26" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>`;
const HERO_ART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 448" fill="none" style="width:100%;height:auto;display:block;max-width:440px" role="img" aria-label="A composable framework powered by Salesforce and Contentful at the center, feeding many sites in a hub-and-spoke structure">
  <ellipse cx="220" cy="220" rx="214" ry="218" fill="#0C62FB" fill-opacity="0.05"/>

  <!-- Spokes (drawn first; the framework box paints over their centers) -->
  <g stroke="#5B9BFF" stroke-width="1.5" opacity="0.4">
    <line x1="220" y1="220" x2="137" y2="77"/>
    <line x1="220" y1="220" x2="303" y2="77"/>
    <line x1="220" y1="220" x2="385" y2="220"/>
    <line x1="220" y1="220" x2="303" y2="363"/>
    <line x1="220" y1="220" x2="137" y2="363"/>
    <line x1="220" y1="220" x2="55" y2="220"/>
  </g>
  <g fill="#5B9BFF" opacity="0.55">
    <circle cx="137" cy="77" r="2.5"/>
    <circle cx="303" cy="77" r="2.5"/>
    <circle cx="385" cy="220" r="2.5"/>
    <circle cx="303" cy="363" r="2.5"/>
    <circle cx="137" cy="363" r="2.5"/>
    <circle cx="55" cy="220" r="2.5"/>
  </g>

  <!-- Generic site nodes (browser-window glyphs) -->
  <g transform="translate(108,56)">${SITE_NODE}</g>
  <g transform="translate(274,56)">${SITE_NODE}</g>
  <g transform="translate(356,199)">${SITE_NODE}</g>
  <g transform="translate(274,342)">${SITE_NODE}</g>
  <g transform="translate(108,342)">${SITE_NODE}</g>
  <g transform="translate(26,199)">${SITE_NODE}</g>

  <!-- Central framework box -->
  <rect x="116" y="168" width="208" height="104" rx="18" fill="rgba(12,98,251,0.12)" stroke="rgba(91,155,255,0.55)" stroke-width="1.5"/>

  <!-- Salesforce official cloud logo (no container) -->
  <g transform="translate(136,184) scale(0.2205)">
    <path fill="#00A1E0" d="M113.258 21.277c8.777-9.144 20.998-14.818 34.513-14.818 17.965 0 33.641 10.018 41.986 24.892a58 58 0 0 1 23.733-5.046c32.404 0 58.674 26.499 58.674 59.189s-26.27 59.19-58.674 59.19c-3.957 0-7.821-.398-11.559-1.152-7.349 13.109-21.359 21.968-37.435 21.968a42.668 42.668 0 0 1-18.765-4.319C138.281 178.71 120.917 191 100.686 191c-21.073 0-39.033-13.332-45.922-32.03a45.117 45.117 0 0 1-9.338.972C20.337 159.942 0 139.392 0 114.043c0-16.99 9.136-31.823 22.715-39.758a52.55 52.55 0 0 1-4.349-20.994C18.366 24.136 42.033.5 71.227.5c17.14 0 32.373 8.148 42.031 20.777"/>
  </g>

  <!-- divider between logos -->
  <text x="223" y="212" text-anchor="middle" font-size="18" font-weight="400" fill="rgba(255,255,255,0.5)" font-family="system-ui,sans-serif">+</text>

  <!-- Contentful official mark (no container) -->
  <g transform="translate(251,184) scale(0.28)">
    <circle cx="75" cy="75" r="75" fill="#fff"/>
    <path fill="#ffd75f" d="M60.18,92.14h0a24.44,24.44,0,0,1,0-34.64h0A9.63,9.63,0,0,0,46.55,43.86a43.72,43.72,0,0,0,0,61.9A9.63,9.63,0,0,0,60.18,92.14Z"/>
    <path fill="#4fb5e1" d="M60.18,57.48h0a24.52,24.52,0,0,1,34.69,0h0a9.63,9.63,0,1,0,13.63-13.62,43.85,43.85,0,0,0-62,0A9.63,9.63,0,1,0,60.18,57.48Z"/>
    <path fill="#f05751" d="M94.89,92.14h0a24.52,24.52,0,0,1-34.69,0h0a9.63,9.63,0,1,0-13.63,13.62,43.85,43.85,0,0,0,62,0A9.63,9.63,0,0,0,94.89,92.14Z"/>
    <path fill="#0681b6" d="M60.18,57.48a9.63,9.63,0,1,1,0-13.62A9.64,9.64,0,0,1,60.18,57.48Z"/>
    <path fill="#cd4739" d="M60.18,105.76a9.63,9.63,0,1,1,0-13.62A9.64,9.64,0,0,1,60.18,105.76Z"/>
    <path fill="#ffda00" d="M60,91.81a24.49,24.49,0,0,1,.13-34.58A9.61,9.61,0,1,0,46.6,43.61a43.66,43.66,0,0,0-.19,61.76A9.61,9.61,0,1,0,60,91.81Z"/>
    <path fill="#67b3ff" d="M60.16,57.23a24.48,24.48,0,0,1,34.58.12,9.61,9.61,0,1,0,13.62-13.56,43.53,43.53,0,0,0-61.7-.24,9.61,9.61,0,0,0,13.5,13.68Z"/>
    <path fill="#eb5a68" d="M94.68,91.94A24.41,24.41,0,0,1,77.36,99,24.12,24.12,0,0,1,60.1,91.81a9.61,9.61,0,1,0-13.63,13.56,43.6,43.6,0,0,0,61.77.25A9.63,9.63,0,0,0,94.68,91.94Z"/>
    <path fill="#47a1ff" d="M60.16,57.23a9.61,9.61,0,1,1,.06-13.56A9.64,9.64,0,0,1,60.16,57.23Z"/>
    <path fill="#d5465f" d="M60,105.37A9.61,9.61,0,1,1,60,91.81,9.63,9.63,0,0,1,60,105.37Z"/>
  </g>

  <!-- logo labels -->
  <text x="166" y="258" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(255,255,255,0.62)" font-family="system-ui,sans-serif">Salesforce</text>
  <text x="272" y="258" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(255,255,255,0.62)" font-family="system-ui,sans-serif">Contentful</text>

  <!-- bottom caption -->
  <text x="220" y="432" text-anchor="middle" font-size="9.5" font-weight="700" fill="rgba(255,255,255,0.3)" font-family="system-ui,sans-serif" letter-spacing="0.1em">ONE FRAMEWORK · MANY SITES</text>
</svg>`;

/**
 * ecHtfHubPage — the Slalom demo landing / overview experience.
 *
 * The hub themes itself with Slalom tokens and reads all of its copy from the
 * Contentful `hubPage` entry (brandId "slalom") via getHubContent(). Its header
 * and footer are the shared site chrome (ecHtfSiteHeader / ecHtfSiteFooter),
 * which render their Slalom variants on this domain — the hub no longer carries
 * its own. The hub also enforces the canonical contentful.slalomdxp.com host.
 */
export default class EcHtfHubPage extends LightningElement {
  // ── Content blocks (from Contentful) ─────────────────────────────────────
  @track hero = {};
  @track howItWorks = {};
  @track capabilities = {};
  @track technical = {};
  @track diagram = {};
  @track comparison = {};
  @track stack = {};

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  connectedCallback() {
    applyBrandTokens(this.template.host, SLALOM_THEME);
    this._enforceDomain();
    this._load();
  }

  async _load() {
    const c = await getHubContent();
    if (!c) return;
    this.hero = c.hero || {};
    // Title/favicon are re-asserted by applyHead so Safari reflects them.
    applyHead({
      title: this.hero.eyebrow || "Composable Experience Platform | Slalom",
      description: this.hero.lede || undefined
    });
    this.howItWorks = c.howItWorks || {};
    this.capabilities = c.capabilities || {};
    this.technical = c.technical || {};
    this.diagram = c.diagram || {};
    this.comparison = c.comparison || {};
    this.stack = c.stack || {};
  }

  renderedCallback() {
    this._injectIcons();
    this._injectHeroArt();
  }

  // ── Domain enforcement ──────────────────────────────────────────────────
  // The hub's canonical home is contentful.slalomdxp.com. If reached from any
  // other deployed host, redirect to the canonical one (preserving path +
  // query). Guarded so it never fires in Experience Builder, live preview, or
  // local development.
  _enforceDomain() {
    try {
      if (typeof window === "undefined") return;
      const m = (document.URL || "").match(/^https?:\/\/([^/?#]+)(.*)$/i);
      if (!m) return;
      const host = m[1].toLowerCase();
      const rest = m[2] || "";
      const nonProd =
        /builder\.salesforce|sitepreview|live-?preview|\.builder\.|localhost|127\.0\.0\.1/.test(
          host
        );
      if (nonProd || host === SLALOM_HUB_HOST) return;
      window.location.replace(`https://${SLALOM_HUB_HOST}${rest}`);
    } catch (_e) {
      /* LWS or navigation restriction — leave the page on its current host. */
    }
  }

  // ── Hero art injection ───────────────────────────────────────────────────
  _injectHeroArt() {
    const el = this.template.querySelector("[data-hero-art]");
    if (!el || el.innerHTML) return;
    el.innerHTML = HERO_ART_SVG;
  }

  // ── Icon injection ───────────────────────────────────────────────────────
  // Any element with data-icon gets the named icon. Only fills empty nodes, so
  // it is safe to run on every render as content streams in.
  _injectIcons() {
    this.template.querySelectorAll("[data-icon]").forEach((el) => {
      if (el.innerHTML) return;
      const size = parseInt(el.dataset.size, 10) || 22;
      el.innerHTML = getIconSvg(el.dataset.icon, size);
    });
  }

  // ── Hero getters ──────────────────────────────────────────────────────────

  get heroPrimaryHref() {
    // Primary CTA now links to the dedicated Demo Sites page rather than an
    // anchor on this page — the brand showcase section has moved there.
    // Preserve ?preview across the cross-page navigation so editors stay in
    // preview mode (this is a plain link, not a NavigationMixin call).
    const base = (BASE_PATH || "/").replace(/\/?$/, "/");
    return `${base}demo-sites${isPreviewMode() ? "?preview" : ""}`;
  }
  get heroSecondaryHref() {
    return `#${this.hero.secondaryCtaAnchor || "how"}`;
  }

  // ── How it works (business audiences) ──────────────────────────────────────

  get hasHowItWorks() {
    return (
      Array.isArray(this.howItWorks.groups) && this.howItWorks.groups.length > 0
    );
  }
  get howGroups() {
    return (this.howItWorks.groups || []).map((g, i) => ({
      key: `how-${i}`,
      icon: g.icon || "spark",
      title: g.title,
      body: g.body,
      points: (Array.isArray(g.points) ? g.points : []).map((t, j) => ({
        key: `how-${i}-${j}`,
        text: t
      }))
    }));
  }

  // ── Capabilities ────────────────────────────────────────────────────────────

  get hasCapabilities() {
    return (
      Array.isArray(this.capabilities.cards) &&
      this.capabilities.cards.length > 0
    );
  }
  get capCards() {
    return (this.capabilities.cards || []).map((c, i) => ({
      key: `cap-${i}`,
      icon: c.icon || "spark",
      title: c.title,
      body: c.body,
      bullets: (Array.isArray(c.bullets) ? c.bullets : []).map((t, j) => ({
        key: `cap-${i}-${j}`,
        text: t
      }))
    }));
  }

  // ── Technical pillars ───────────────────────────────────────────────────────

  get hasTechnical() {
    return (
      Array.isArray(this.technical.pillars) && this.technical.pillars.length > 0
    );
  }
  get techPillars() {
    return (this.technical.pillars || []).map((p, i) => ({
      key: `tech-${i}`,
      icon: p.icon || "spark",
      title: p.title,
      body: p.body
    }));
  }
  // 3-up when the count is a multiple of 3, 4-up when a multiple of 4.
  get techGridClass() {
    const n = (this.technical.pillars || []).length;
    if (n > 0 && n % 3 === 0) return "arch-grid arch-grid--3";
    if (n > 0 && n % 4 === 0) return "arch-grid arch-grid--4";
    return "arch-grid";
  }

  // ── Architecture diagram ─────────────────────────────────────────────────────

  get hasDiagram() {
    return !!(this.diagram && this.diagram.title);
  }
  get diagramCmsItems() {
    return this._diagramItems(this.diagram.cms, "dgc");
  }
  get diagramIntegrationItems() {
    return this._diagramItems(this.diagram.integration, "dgi");
  }
  get diagramSiteItems() {
    return this._diagramItems(this.diagram.site, "dgs");
  }
  get diagramCmsLabel() {
    return (this.diagram.cms && this.diagram.cms.label) || "Contentful";
  }
  get diagramIntegrationLabel() {
    return (
      (this.diagram.integration && this.diagram.integration.label) ||
      "Salesforce Integration Layer"
    );
  }
  get diagramSiteLabel() {
    return (
      (this.diagram.site && this.diagram.site.label) || "Experience Cloud Site"
    );
  }
  get diagramBrands() {
    return (Array.isArray(this.diagram.brands) ? this.diagram.brands : []).map(
      (b, i) => ({ key: `dgb-${i}`, name: b.name, domain: b.domain })
    );
  }
  _diagramItems(block, prefix) {
    const items = block && Array.isArray(block.items) ? block.items : [];
    return items.map((t, i) => ({ key: `${prefix}-${i}`, text: t }));
  }

  // ── Comparison ───────────────────────────────────────────────────────────────

  get hasComparison() {
    return !!(
      this.comparison &&
      (this.comparison.traditional || this.comparison.modern)
    );
  }
  get compareTraditional() {
    return (this.comparison.traditional || []).map((t, i) => ({
      key: `ct-${i}`,
      text: t
    }));
  }
  get compareModern() {
    return (this.comparison.modern || []).map((t, i) => ({
      key: `cm-${i}`,
      text: t
    }));
  }

  // ── Tech stack ─────────────────────────────────────────────────────────────

  get hasStack() {
    return Array.isArray(this.stack.items) && this.stack.items.length > 0;
  }
  get stackItems() {
    return (this.stack.items || []).map((s, i) => ({
      key: `st-${i}`,
      layer: s.layer,
      tech: s.tech,
      note: s.note
    }));
  }
}