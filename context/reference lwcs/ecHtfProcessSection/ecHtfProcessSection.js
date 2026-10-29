import { LightningElement, wire, track } from "lwc";
import { detectBrandId, applyBrandTokens, BRAND_ORDER } from "c/ecHtfBrandData";
import { getSection, getBrandTheme } from "c/ecHtfContentService";
import { CurrentPageReference } from "lightning/navigation";

export default class EcHtfProcessSection extends LightningElement {
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
      getSection("processSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
    this._iconsReady = false;
  }

  renderedCallback() {
    if (this._iconsReady) return;
    this._iconsReady = true;
    this._injectStepNums();
  }

  // ─── Step number circle injection ──────────────────────────────────────

  _injectStepNums() {
    this.template.querySelectorAll("[data-step-num]").forEach((el) => {
      el.innerHTML = this._stepNumSvg(el.dataset.stepNum);
    });
  }

  _stepNumSvg(num) {
    return `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="22" cy="22" r="21" fill="var(--brand-tint)" stroke="var(--brand)" stroke-width="1.5"/>
  <text x="22" y="27" text-anchor="middle" font-size="15" font-weight="700" font-family="var(--font-display,system-ui)" fill="var(--brand-deep)">${num}</text>
</svg>`;
  }

  // ─── Computed getters ──────────────────────────────────────────────────

  get content() {
    return this._content || {};
  }

  get isHTF() {
    return this._brandId === "htf";
  }

  get steps() {
    return this.content.steps || [];
  }
}