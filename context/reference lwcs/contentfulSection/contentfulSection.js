import { LightningElement, api } from "lwc";

/**
 * contentfulSection — content-type → LWC dispatcher.
 *
 * Given one section descriptor from a CMS page layout ({ type, pageType }),
 * renders the matching section component. This is the single mapping point
 * between a Contentful content type and the LWC that presents it: to support a
 * new section type, add a content type to the `page.sections` validation in the
 * Contentful model and a branch here.
 *
 * Each section component still loads its own brand-scoped content from the
 * shared (single-callout) brand bundle, so this layer only decides *which*
 * components render and *in what order* — the composition the CMS now controls.
 *
 * Navigation page API names are forwarded to every rendered component; each
 * uses only the ones it needs.
 */
export default class ContentfulSection extends LightningElement {
  /** @type {{id:string,type:string,pageType:?string}} */
  @api section;
  /** Current page route — used to vary placement-specific component props. */
  @api route;

  // Experience Cloud page API names (forwarded to rendered components).
  @api homePageName = "Home";
  @api aboutPageName = "about";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  @api catalogPageName = "catalog";
  @api applyPageName = "apply";

  get _type() {
    return (this.section && this.section.type) || "";
  }

  // ── Which component to render ──────────────────────────────────────────────
  get isHero() {
    return this._type === "heroSection";
  }
  get isPageHero() {
    return this._type === "pageHeroVariant";
  }
  get isStat() {
    return this._type === "statSection";
  }
  get isFinance() {
    return this._type === "financeSection";
  }
  get isProcess() {
    return this._type === "processSection";
  }
  get isFeature() {
    return this._type === "featureSection";
  }
  get isCta() {
    return this._type === "ctaSection";
  }
  get isAbout() {
    return this._type === "aboutSection";
  }
  get isFaq() {
    return this._type === "faqSection";
  }
  get isContact() {
    return this._type === "contactSection";
  }
  get isCatalog() {
    return this._type === "catalogSection";
  }
  get isApply() {
    return this._type === "applyForm";
  }

  // ── Placement-specific props ───────────────────────────────────────────────

  /** Interior-page hero variant (about/faq/contact/apply/catalog). */
  get pageHeroType() {
    return (this.section && this.section.pageType) || "about";
  }

  /**
   * The home CTA band routes its secondary button to Contact; on interior
   * pages it routes to the FAQ. This mirrors the pre-refactor page templates.
   */
  get ctaSecondaryMode() {
    return this.route === "home" ? "contact" : "faq";
  }
}