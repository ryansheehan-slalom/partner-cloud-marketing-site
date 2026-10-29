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
  isPreviewMode
} from "c/ecHtfContentService";

export default class EcHtfHeroPanel extends NavigationMixin(LightningElement) {
  // ─── @api props ────────────────────────────────────────────────────────
  @api applyPageName = "apply";
  @api homePageName = "Home";
  @api catalogPageName = "catalog";

  // ─── Internal state ────────────────────────────────────────────────────
  @track _content = {};

  _brandId = "htf";
  _iconsReady = false;

  // ─── Lifecycle ─────────────────────────────────────────────────────────

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
      getSection("heroSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._iconsReady = false;
    this._content = content || {};
  }

  renderedCallback() {
    if (this._iconsReady) return;
    this._iconsReady = true;
    this._injectIcons();
  }

  // ─── Navigation ────────────────────────────────────────────────────────

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
    // Secondary CTA only renders for catalog brands (subway) — route to the catalog page.
    const page = this.catalogPageName || "catalog";
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

  // Only show the secondary CTA when the brand has a catalog (subway).
  // HTF and Dunkin have no "what we finance"/catalog destination, so it is hidden.
  get showSecondary() {
    return !!this.content.ctaSecondaryCatalog;
  }

  // ─── Icon injection ────────────────────────────────────────────────────

  _injectIcons() {
    // Hero title with accent spans
    const titleEl = this.template.querySelector("[data-hero-title]");
    if (titleEl) {
      titleEl.innerHTML = this.titleHtml;
    }

    // Float card icon — brand-specific (server / oven / monitor)
    const floatIcon = this.template.querySelector("[data-float-icon]");
    if (floatIcon) {
      floatIcon.innerHTML = getIconSvg(
        this.content.floatcardIcon || "server",
        22
      );
    }

    // Assurance chip icons
    this.template.querySelectorAll("[data-assure-icon]").forEach((el) => {
      el.innerHTML = getIconSvg(el.dataset.assureIcon, 18);
    });
  }

  // ─── Computed getters ──────────────────────────────────────────────────

  get content() {
    return this._content || {};
  }

  get brandId() {
    return this._brandId;
  }

  get heroEyebrow() {
    return this.content.eyebrow || "Technology Lifecycle Management";
  }

  get heroLede() {
    return (
      this.content.lede ||
      "Flexible, competitive financing programs that keep your technology and equipment current — powered by Hudson Bank."
    );
  }

  get ctaPrimaryLabel() {
    return this.content.ctaPrimaryLabel || "Start an application";
  }

  get ctaSecondaryLabel() {
    return this.content.ctaSecondaryLabel || "What we finance";
  }

  get floatcardTitle() {
    return this.content.floatcardTitle || "Powered by Teagan®";
  }

  get floatcardSub() {
    return this.content.floatcardSub || "Real-time asset visibility";
  }

  get assuranceItems() {
    return this.content.assurances || [];
  }

  get titleHtml() {
    const parts = this.content.titleParts;
    if (Array.isArray(parts) && parts.length > 0) {
      return parts
        .map((p) => {
          return p.accent ? `<span class="accent">${p.text}</span>` : p.text;
        })
        .join("");
    }
    // Fallback
    return 'Simple, transparent and fair <span class="accent">asset financing.</span>';
  }
}