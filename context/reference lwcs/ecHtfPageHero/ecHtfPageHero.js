import { LightningElement, wire, api, track } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import { detectBrandId, applyBrandTokens, BRAND_ORDER } from "c/ecHtfBrandData";
import {
  getSection,
  getBrandTheme,
  isPreviewMode
} from "c/ecHtfContentService";
import BASE_PATH from "@salesforce/community/basePath";

export default class EcHtfPageHero extends NavigationMixin(LightningElement) {
  @api pageType = "about";
  @api homePageName = "Home";

  @track _content = {};

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
    const [theme, content] = await Promise.all([
      getBrandTheme(brandId),
      getSection("pageHero", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
  }

  get homeBreadcrumbHref() {
    const base = (BASE_PATH || "/").replace(/\/?$/, "/");
    return base;
  }

  handleHomeClick(e) {
    e.preventDefault();
    // comm__namedPage('Home') generates /home which 404s — the LWR home page
    // is at the community base path. Navigate there directly via standard__webPage.
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: this.homeBreadcrumbHref + (isPreviewMode() ? "?preview" : "")
      }
    });
  }

  get brandId() {
    return this._brandId;
  }

  get _pageData() {
    const key = this.pageType || "about";
    return this._content && this._content[key] ? this._content[key] : {};
  }

  get pageEyebrow() {
    return this._pageData.eyebrow || "";
  }
  get pageTitle() {
    return this._pageData.title || "";
  }
  get pageLede() {
    return this._pageData.lede || "";
  }

  get breadcrumbLabel() {
    const labels = {
      about: "About Us",
      faq: "FAQ",
      contact: "Contact",
      apply: "Apply",
      catalog: "Catalog"
    };
    return labels[this.pageType] || this.pageType || "Page";
  }
}