import { LightningElement, wire, track } from "lwc";
import {
  detectBrandId,
  applyBrandTokens,
  getIconSvg,
  BRAND_ORDER
} from "c/ecHtfBrandData";
import { getSection, getBrandTheme } from "c/ecHtfContentService";
import { CurrentPageReference } from "lightning/navigation";

export default class EcHtfFinanceSection extends LightningElement {
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
      getSection("financeSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
    this._iconsReady = false;
  }

  renderedCallback() {
    if (this._iconsReady) return;
    this._iconsReady = true;
    this._injectIcons();
  }

  // ─── Icon injection ────────────────────────────────────────────────────

  _injectIcons() {
    this.template.querySelectorAll("[data-asset-icon]").forEach((el) => {
      el.innerHTML = getIconSvg(el.dataset.assetIcon, 24);
    });
  }

  // ─── Computed getters ──────────────────────────────────────────────────

  get content() {
    return this._content || {};
  }

  get financeEyebrow() {
    return this.content.eyebrow || "What We Finance";
  }

  get financeTitle() {
    return this.content.title || "Solutions across every asset class.";
  }

  get financeBody() {
    return (
      this.content.body ||
      "From enterprise IT to industrial equipment, we finance the assets that keep your business moving."
    );
  }

  get assets() {
    return this.content.assets || [];
  }
}