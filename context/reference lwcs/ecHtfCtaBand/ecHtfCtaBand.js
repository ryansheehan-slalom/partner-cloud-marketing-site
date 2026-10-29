import { LightningElement, wire, api, track } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import BASE_PATH from "@salesforce/community/basePath";

import { detectBrandId, applyBrandTokens, BRAND_ORDER } from "c/ecHtfBrandData";
import {
  getSection,
  getBrandTheme,
  isPreviewMode
} from "c/ecHtfContentService";

export default class EcHtfCtaBand extends NavigationMixin(LightningElement) {
  @api applyPageName = "apply";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  /** 'faq' (default) → "Read the FAQ"; 'contact' → "Contact us" */
  @api secondaryMode = "faq";

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
      getSection("ctaSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
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
    const page =
      this.secondaryMode === "contact"
        ? this.contactPageName
        : this.faqPageName;
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

  get content() {
    return this._content || {};
  }
  get ctaEyebrow() {
    return this.content.eyebrow || "Get started";
  }
  get ctaTitle() {
    return this.content.title || "Ready to get started?";
  }
  get ctaBody() {
    return (
      this.content.body ||
      "Tell us about your equipment needs and we'll structure a financing program that works for you."
    );
  }
  get ctaApplyLabel() {
    return this.content.applyLabel || "Apply now";
  }
  get ctaSecondaryLabel() {
    return this.secondaryMode === "contact" ? "Contact us" : "Read the FAQ";
  }
}