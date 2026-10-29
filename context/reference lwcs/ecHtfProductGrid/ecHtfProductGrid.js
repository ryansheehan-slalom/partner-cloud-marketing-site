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

const CART_KEY = "htf_cart_subway";

export default class EcHtfProductGrid extends NavigationMixin(
  LightningElement
) {
  @api applyPageName = "apply";

  @track _cart = [];
  @track _activeCat = "All";
  @track _content = null;

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
      getSection("catalogSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || null;
    this._iconsReady = false;
    if (this._content) {
      this._loadCart();
    }
  }

  renderedCallback() {
    if (this._iconsReady) return;
    this._iconsReady = true;
    this._injectIcons();
  }

  // ─── Icon injection ────────────────────────────────────────────────────

  _injectIcons() {
    this.template.querySelectorAll("[data-icon]").forEach((el) => {
      if (!el.innerHTML) {
        const size = parseInt(el.dataset.size, 10) || 24;
        el.innerHTML = getIconSvg(el.dataset.icon, size);
      }
    });
  }

  // ─── Cart persistence ──────────────────────────────────────────────────

  _loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) this._cart = JSON.parse(raw) || [];
    } catch (_e) {
      /* ignore */
    }
  }

  _saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this._cart));
    } catch (_e) {
      /* ignore */
    }
  }

  // ─── Computed getters ──────────────────────────────────────────────────

  get hasCatalog() {
    return !!this._content;
  }

  get categoryPills() {
    const cats = this._content
      ? ["All", ...(this._content.categories || [])]
      : ["All"];
    return cats.map((c) => ({
      value: c,
      label: c,
      isActive: this._activeCat === c,
      cls: `cat-pill${this._activeCat === c ? " cat-pill--active" : ""}`
    }));
  }

  get filteredProducts() {
    if (!this._content) return [];
    const products = this._content.products || [];
    const filtered =
      this._activeCat === "All"
        ? products
        : products.filter((p) => p.cat === this._activeCat);
    return filtered.map((p) => ({
      ...p,
      inCart: this._cart.includes(p.id),
      cartBtnLabel: this._cart.includes(p.id) ? "Remove" : "Add to lease",
      cartBtnClass: this._cart.includes(p.id)
        ? "btn btn--added btn--sm"
        : "btn btn--outline-brand btn--sm"
    }));
  }

  get productCountLabel() {
    const n = this.filteredProducts.length;
    return `${n} product${n === 1 ? "" : "s"}`;
  }

  get hasCart() {
    return this._cart.length > 0;
  }

  get cartSummary() {
    const count = this._cart.length;
    const total = this._cart.reduce((sum, id) => {
      const products = (this._content && this._content.products) || [];
      const p = products.find((x) => x.id === id);
      return sum + (p ? p.price || 0 : 0);
    }, 0);
    return `${count} item${count === 1 ? "" : "s"} selected — est. $${total}/mo`;
  }

  // ─── Event handlers ────────────────────────────────────────────────────

  handleCatFilter(evt) {
    this._activeCat = evt.currentTarget.dataset.cat;
    this._iconsReady = false;
  }

  handleCartToggle(evt) {
    const id = evt.currentTarget.dataset.id;
    const idx = this._cart.indexOf(id);
    this._cart =
      idx === -1 ? [...this._cart, id] : this._cart.filter((x) => x !== id);
    this._saveCart();
    this._iconsReady = false;
  }

  handleClearCart() {
    this._cart = [];
    this._saveCart();
  }

  handleContinue() {
    this._saveCart();
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
}