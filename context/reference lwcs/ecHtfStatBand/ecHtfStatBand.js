import { LightningElement, wire, track } from "lwc";
import { detectBrandId, applyBrandTokens, BRAND_ORDER } from "c/ecHtfBrandData";
import { getSection, getBrandTheme } from "c/ecHtfContentService";
import { CurrentPageReference } from "lightning/navigation";

export default class EcHtfStatBand extends LightningElement {
  // ─── Internal state ────────────────────────────────────────────────────
  @track _content = {};

  _brandId = "htf";

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
      getSection("statSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
  }

  // ─── Computed getters ──────────────────────────────────────────────────

  get content() {
    return this._content || {};
  }

  get stats() {
    return this.content.stats || [];
  }
}