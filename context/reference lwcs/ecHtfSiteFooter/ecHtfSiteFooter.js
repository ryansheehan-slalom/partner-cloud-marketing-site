import { LightningElement, api, track, wire } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import {
  detectBrandId,
  applyBrandTokens,
  BRAND_ORDER,
  getSlalomLogoSvg,
  isSlalomHub,
  SLALOM_THEME,
  SLALOM_HUB_ATTRIBUTION,
  SLALOM_ABOUT_URL
} from "c/ecHtfBrandData";
import {
  getBrandTheme,
  getBrandIdentity,
  getSection,
  isPreviewMode
} from "c/ecHtfContentService";
import LOGO_HUDSON from "@salesforce/resourceUrl/ecHtfLogoHudson";
import BASE_PATH from "@salesforce/community/basePath";

export default class EcHtfSiteFooter extends NavigationMixin(LightningElement) {
  @api homePageName = "Home";
  @api aboutPageName = "about";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  @api catalogPageName = "catalog";
  @api applyPageName = "apply";

  @track brand = { contact: {}, assets: [], attributionLinks: [] };
  brandId = detectBrandId();

  htfLogoUrl = LOGO_HUDSON;

  // The Slalom hub reuses this footer, Slalom-branded (wordmark + demo line +
  // slalom.com link) instead of the program footer columns.
  _slalom = isSlalomHub();
  aboutUrl = SLALOM_ABOUT_URL;
  slalomAttribution = SLALOM_HUB_ATTRIBUTION;

  get isSlalom() {
    return this._slalom;
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
    if (resolved !== this.brandId) {
      this.brandId = resolved;
      this._load();
    }
  }

  connectedCallback() {
    this._load();
  }

  renderedCallback() {
    if (!this._slalom) return;
    this.template.querySelectorAll("[data-slalom-logo]").forEach((el) => {
      if (el.innerHTML) return;
      const h = parseInt(el.dataset.h, 10) || 24;
      el.innerHTML = getSlalomLogoSvg({ color: "#FFFFFF", height: h });
    });
  }

  async _load() {
    // Slalom hub: skip the program-brand Contentful load and use Slalom chrome.
    if (this._slalom) {
      applyBrandTokens(this.template.host, SLALOM_THEME);
      this.brand = { contact: {}, assets: [], attributionLinks: [] };
      return;
    }

    const brandId = this.brandId;
    const [theme, identity, finance, contact] = await Promise.all([
      getBrandTheme(brandId),
      getBrandIdentity(brandId),
      getSection("financeSection", brandId),
      getSection("contactSection", brandId)
    ]);
    if (brandId !== this.brandId) return;
    applyBrandTokens(this.template.host, theme);
    this.brand = {
      ...identity,
      assets: (finance && finance.assets) || [],
      contact: contact || {}
    };
  }

  get phoneHref() {
    const phone = this.brand && this.brand.contact && this.brand.contact.phone;
    return phone ? "tel:" + phone.replace(/[^0-9+]/g, "") : "";
  }
  get emailHref() {
    const email = this.brand && this.brand.contact && this.brand.contact.email;
    return email ? "mailto:" + email : "";
  }

  get homeHref() {
    return (BASE_PATH || "/").replace(/\/?$/, "/");
  }

  handleNavClick(e) {
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    const anchor = e.currentTarget.dataset.anchor;
    if (!page) return;

    const inPreview = isPreviewMode();
    const isHome =
      page.toLowerCase() === (this.homePageName || "").toLowerCase();
    if (isHome) {
      // The home page lives at the community base path, not /home.
      this[NavigationMixin.Navigate]({
        type: "standard__webPage",
        attributes: { url: this.homeHref + (inPreview ? "?preview" : "") }
      });
      return;
    }

    const ref = { type: "comm__namedPage", attributes: { name: page } };
    if (inPreview) {
      // Resolve the real URL via GenerateUrl then append ?preview.
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
    if (anchor) {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }
}