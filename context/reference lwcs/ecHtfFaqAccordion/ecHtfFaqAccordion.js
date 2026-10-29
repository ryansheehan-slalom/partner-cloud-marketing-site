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

export default class EcHtfFaqAccordion extends NavigationMixin(
  LightningElement
) {
  /** Experience Cloud page API names — configure in Experience Builder */
  @api contactPageName = "contact";
  @api applyPageName = "apply";

  @track _openItemId = null;
  @track _activeCat = "all";
  @track _searchQuery = "";
  @track _content = {};

  _brandId = "";
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
    const [theme, content] = await Promise.all([
      getBrandTheme(brandId),
      getSection("faqSection", brandId)
    ]);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._content = content || {};
    this._iconsReady = false;
  }

  renderedCallback() {
    // Inject static icons once
    if (!this._iconsReady) {
      this._iconsReady = true;
      // Search bar icon
      const searchIcon = this.template.querySelector(".search-icon[data-icon]");
      if (searchIcon) {
        searchIcon.innerHTML = getIconSvg(
          searchIcon.dataset.icon,
          parseInt(searchIcon.dataset.size || "18", 10)
        );
      }
      // Empty state icon
      const emptyIcon = this.template.querySelector(
        ".faq-empty__icon[data-icon]"
      );
      if (emptyIcon) {
        emptyIcon.innerHTML = getIconSvg(
          emptyIcon.dataset.icon,
          parseInt(emptyIcon.dataset.size || "40", 10)
        );
      }
    }

    // Inject answer HTML for open items (every render — items change on toggle)
    this.template.querySelectorAll(".faq-a__inner[data-html]").forEach((el) => {
      if (el.innerHTML !== el.dataset.html) {
        el.innerHTML = el.dataset.html || "";
      }
    });

    // Re-inject the plus toggle icon (CSS rotates it to an × when open)
    this.template
      .querySelectorAll(".faq-q__chevron[data-icon]")
      .forEach((el) => {
        el.innerHTML = getIconSvg("plus", 18);
      });
  }

  handleContactClick(e) {
    e.preventDefault();
    const ref = {
      type: "comm__namedPage",
      attributes: { name: this.contactPageName }
    };
    if (isPreviewMode()) {
      this[NavigationMixin.GenerateUrl](ref)
        .then((url) =>
          this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: { url: url + "?preview" }
          })
        )
        .catch(() => this[NavigationMixin.Navigate](ref));
    } else {
      this[NavigationMixin.Navigate](ref);
    }
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

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  handleSearch(evt) {
    this._searchQuery = evt.target.value;
    this._openItemId = null;
  }

  handleCatFilter(evt) {
    this._activeCat = evt.currentTarget.dataset.cat;
    this._openItemId = null;
  }

  handleAccordion(evt) {
    const id = evt.currentTarget.dataset.id;
    this._openItemId = this._openItemId === id ? null : id;
  }

  handleClearSearch() {
    this._searchQuery = "";
    this._activeCat = "all";
    this._openItemId = null;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  _filterItem(item) {
    const catOk = this._activeCat === "all" || item.cat === this._activeCat;
    const q = (this._searchQuery || "").trim().toLowerCase();
    const textOk =
      !q ||
      item.q.toLowerCase().includes(q) ||
      item.a.toLowerCase().includes(q);
    return catOk && textOk;
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  get searchQuery() {
    return this._searchQuery;
  }

  get contactBlurb() {
    return this._content.contactBlurb || "";
  }

  get categories() {
    const items = this._content.items || [];
    const seen = new Set();
    const cats = [];
    items.forEach((item) => {
      if (!seen.has(item.cat)) {
        seen.add(item.cat);
        cats.push(item.cat);
      }
    });

    return [
      {
        value: "all",
        label: "All",
        isActive: this._activeCat === "all",
        btnClass:
          this._activeCat === "all" ? "cat-pill cat-pill--active" : "cat-pill"
      },
      ...cats.map((c) => ({
        value: c,
        label: c,
        isActive: this._activeCat === c,
        btnClass:
          this._activeCat === c ? "cat-pill cat-pill--active" : "cat-pill"
      }))
    ];
  }

  get faqItems() {
    const items = this._content.items || [];
    return items.map((item) => ({
      id: item.id,
      cat: item.cat,
      q: item.q,
      a: item.a,
      isOpen: item.id === this._openItemId,
      isVisible: this._filterItem(item)
    }));
  }

  get noResults() {
    return this.faqItems.filter((i) => i.isVisible).length === 0;
  }
}