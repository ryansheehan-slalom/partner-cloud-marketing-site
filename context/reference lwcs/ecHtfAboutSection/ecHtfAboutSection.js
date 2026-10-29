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

export default class EcHtfAboutSection extends NavigationMixin(
  LightningElement
) {
  @api applyPageName = "apply";
  @api contactPageName = "contact";

  @track _content = {};
  _brandId = "";
  _iconsReady = false;

  handleApplyClick(e) {
    e.preventDefault();
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: (BASE_PATH || "/").replace(/\/?$/, "/") + this.applyPageName
      }
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

  connectedCallback() {
    this._brandId = detectBrandId();
    this._loadContent();
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
      this._loadContent();
    }
  }

  // ---------------------------------------------------------------------------
  // Content loading — Contentful (headless CMS), via c/ecHtfContentService
  // ---------------------------------------------------------------------------

  /**
   * Loads the About section + brand theme from Contentful. In preview mode
   * (?preview) c/contentfulService automatically reads drafts.
   */
  async _loadContent() {
    const brandId = this._brandId;
    const [theme, content] = await Promise.all([
      getBrandTheme(brandId),
      getSection("aboutSection", brandId)
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

  _injectIcons() {
    this.template.querySelectorAll("[data-icon]").forEach((el) => {
      el.innerHTML = getIconSvg(
        el.dataset.icon,
        parseInt(el.dataset.size || "20", 10)
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  get brandId() {
    return this._brandId;
  }

  get lede() {
    return this._content.lede || "";
  }

  get storyParagraphs() {
    const story = this._content.story || [];
    return story.map((text, i) => ({ id: "p" + i, text }));
  }

  get values() {
    return this._content.values || [];
  }

  get statline() {
    return this._content.statline || [];
  }

  get relEyebrow() {
    const rel = this._content.relationship || {};
    return rel.eyebrow || "";
  }

  get relTitle() {
    const rel = this._content.relationship || {};
    return rel.title || "";
  }

  get relBody() {
    const rel = this._content.relationship || {};
    return rel.body || "";
  }
}