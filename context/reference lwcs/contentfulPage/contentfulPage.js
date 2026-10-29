import { LightningElement, api, wire, track } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { detectBrandId, BRAND_ORDER, applyHead } from "c/ecHtfBrandData";
import { getPage, getBrandIdentity } from "c/ecHtfContentService";

/**
 * contentfulPage — renders a brand's page from its CMS-defined layout.
 *
 * One generic component backs every route. It resolves the active brand (from
 * the domain, or the ?brand= switcher state) and the `route` it was given, asks
 * Contentful for that page's ordered section list, and renders a
 * c-contentful-section dispatcher for each. Which sections appear, and in what
 * order, is owned by the `page` entry in Contentful — so layout changes (adding,
 * reordering, removing or reusing a section) need no deployment.
 *
 * The thin ecHtf*Page wrappers each render this with a fixed `route`, which
 * keeps Experience Builder routing and SEO unchanged.
 *
 * Content itself is still loaded by each section component from the shared
 * single-callout brand bundle, so a page render makes one Contentful request.
 */
export default class ContentfulPage extends LightningElement {
  /** Route to render: home, about, faq, contact, catalog, apply. */
  @api route = "home";

  // Experience Cloud page API names — forwarded to section components.
  @api homePageName = "Home";
  @api aboutPageName = "about";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  @api catalogPageName = "catalog";
  @api applyPageName = "apply";

  @track _sections = [];
  @track _loaded = false;

  _brandId = "htf";

  connectedCallback() {
    this._brandId = detectBrandId();
    this._load();
  }

  @wire(CurrentPageReference)
  wiredPageRef(pageRef) {
    if (!pageRef) return;
    const brandParam = (
      (pageRef.state && pageRef.state.brand) ||
      ""
    ).toLowerCase();
    const resolved = BRAND_ORDER.includes(brandParam)
      ? brandParam
      : detectBrandId();
    if (resolved !== this._brandId) {
      this._brandId = resolved;
      this._load();
    }
  }

  async _load() {
    const brandId = this._brandId;
    const [layout, identity] = await Promise.all([
      getPage(this.route, brandId),
      getBrandIdentity(brandId)
    ]);
    // Guard against a brand switch that landed while awaiting.
    if (brandId !== this._brandId) return;
    const sections =
      layout && Array.isArray(layout.sections) ? layout.sections : [];
    // Keys must be unique even if an entry is listed twice on a page.
    this._sections = sections.map((s, i) => ({ ...s, key: `${s.id}-${i}` }));
    this._loaded = true;
    this._applySeo(layout, identity);
  }

  // ── SEO (document head) ─────────────────────────────────────────────────
  // Per-page, per-brand title + meta description, driven by Contentful. The
  // title is the page's `seoTitle` override when set, otherwise the composed
  // "{page title} | {brand name}" (e.g. "Home | Hudson Bank").
  _applySeo(layout, identity) {
    const brandName = (identity && identity.name) || "";
    const pageTitle = (layout && layout.title) || "";
    const seoTitle = layout && layout.seoTitle;
    const title = seoTitle
      ? seoTitle
      : [pageTitle, brandName].filter(Boolean).join(" | ");
    // applyHead() sets + re-asserts the title/description so Safari (which
    // ignores late document.title changes) reflects them.
    applyHead({
      title: title || undefined,
      description: (layout && layout.seoDescription) || undefined
    });
  }

  get sections() {
    return this._sections;
  }

  get hasSections() {
    return this._loaded && this._sections.length > 0;
  }
}