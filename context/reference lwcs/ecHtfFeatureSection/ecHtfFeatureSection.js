import { LightningElement, wire, api, track } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import BASE_PATH from "@salesforce/community/basePath";

import {
  detectBrandId,
  applyBrandTokens,
  getIconSvg,
  BRAND_ORDER
} from "c/ecHtfBrandData";
import {
  getSection,
  getBrandTheme,
  getBrandIdentity,
  isPreviewMode
} from "c/ecHtfContentService";

export default class EcHtfFeatureSection extends NavigationMixin(
  LightningElement
) {
  @api applyPageName = "apply";
  @api faqPageName = "faq";
  @api catalogPageName = "catalog";
  @api aboutPageName = "about"; // kept for Experience Builder back-compat

  @track _content = {};
  @track _hasCatalog = false;

  _brandId = "htf";
  _iconsReady = false;

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
    const [theme, content, identity] = await Promise.all([
      getBrandTheme(brandId),
      getSection("featureSection", brandId),
      getBrandIdentity(brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
    this._hasCatalog = !!(identity && identity.hasCatalog);
    this._iconsReady = false;
  }

  renderedCallback() {
    if (this._iconsReady) return;
    this._iconsReady = true;
    this._injectIcons();
  }

  _injectIcons() {
    this.template.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = getIconSvg(
        el.dataset.icon,
        parseInt(el.dataset.size || "20", 10)
      );
    });
  }

  handleApplyClick(e) {
    e.preventDefault();
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url:
          (BASE_PATH || "/").replace(/\/?$/, "/") +
          this.applyPageName +
          (isPreviewMode() ? "?preview" : "")
      }
    });
  }

  handleSecondaryClick(e) {
    e.preventDefault();
    // HTF secondary is the "About Teagan®" PDF (rendered as a real anchor, handled below).
    const page = this.hasCatalog ? this.catalogPageName : this.faqPageName;
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url:
          (BASE_PATH || "/").replace(/\/?$/, "/") +
          page +
          (isPreviewMode() ? "?preview" : "")
      }
    });
  }

  // About Teagan® product sheet (opens in a new tab for HTF)
  get teaganPdfUrl() {
    return "https://www.hudsonbank.com/teagan.pdf";
  }

  get brandId() {
    return this._brandId;
  }
  get content() {
    return this._content || {};
  }
  get featureEyebrow() {
    return this.content.eyebrow || "Why Hudson Bank";
  }
  get featureTitle() {
    return this.content.title || "Financing designed around your business";
  }
  get featureBody() {
    return this.content.body || "";
  }
  get featureNote() {
    return this.content.note || "Subject to credit approval.";
  }
  get featureList() {
    return this.content.list || [];
  }
  get isHTF() {
    return this._brandId === "htf";
  }
  get featureGridClass() {
    return this.isHTF ? "feature__grid" : "feature__grid feature__grid--rev";
  }
  get hasCatalog() {
    return this._hasCatalog;
  }
  get ctaPrimaryLabel() {
    return this.isHTF ? "Start an application" : "Apply for financing";
  }
  get secondaryLabel() {
    if (this.isHTF) return "About Teagan®";
    return this.hasCatalog ? "Browse catalog" : "Read the FAQ";
  }
}