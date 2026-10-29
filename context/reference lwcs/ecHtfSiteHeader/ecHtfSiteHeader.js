import { LightningElement, api, track, wire } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import {
  detectBrandId,
  applyBrandTokens,
  getBrandAssets,
  BRAND_ORDER,
  getIconSvg,
  getBrandUrl,
  getSlalomLogoSvg,
  applyHead,
  isSlalomHub,
  SLALOM_THEME,
  SLALOM_HUB_ATTRIBUTION,
  SLALOM_ABOUT_URL
} from "c/ecHtfBrandData";
import {
  getBrandTheme,
  getBrandIdentity,
  isPreviewMode
} from "c/ecHtfContentService";
import BASE_PATH from "@salesforce/community/basePath";
import FAVICON_HTF from "@salesforce/resourceUrl/ecHtfFaviconHtf";
import FAVICON_SUBWAY from "@salesforce/resourceUrl/ecHtfFaviconSubway";
import FAVICON_DUNKIN from "@salesforce/resourceUrl/ecHtfFaviconDunkin";
import FAVICON_SLALOM from "@salesforce/resourceUrl/ecHtfFaviconSlalom";

// Bump on every favicon binary change to force browsers past their (very
// sticky) favicon cache. See _setFavicon().
const FAVICON_VERSION = "20260612-2";

export default class EcHtfSiteHeader extends NavigationMixin(LightningElement) {
  @api activePage = "";

  @api homePageName = "Home";
  @api aboutPageName = "about";
  @api faqPageName = "faq";
  @api contactPageName = "contact";
  @api catalogPageName = "catalog";
  @api applyPageName = "apply";

  @track switcherOpen = false;
  @track mobileNavOpen = false;
  @track menuStyle = "";

  @track brand = {};
  @track switcherOptions = [];
  brandId = detectBrandId();

  // The Slalom hub uses this same header, Slalom-branded: the Slalom wordmark,
  // the demo attribution text, and a single "About Slalom" link instead of the
  // program nav. The Experience switcher stays.
  _slalom = isSlalomHub();
  aboutUrl = SLALOM_ABOUT_URL;
  githubUrl = "https://github.com/tyoch/contentful";

  @api demoSitesPageName = "Demo_Sites__c";

  get isSlalom() {
    return this._slalom;
  }

  _currentPageName = "";
  _outsideClickBound = null;

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
      this._loadSwitcher();
    }
    this._currentPageName =
      (pageRef.attributes && pageRef.attributes.name) || "";
  }

  connectedCallback() {
    this._load();
    this._loadSwitcher();
    this._loadFonts();
    this._setFavicon();
    this._outsideClickBound = this._handleOutsideClick.bind(this);
    document.addEventListener("click", this._outsideClickBound);
  }

  async _load() {
    // Slalom hub: skip the program-brand Contentful load and use Slalom chrome.
    if (this._slalom) {
      applyBrandTokens(this.template.host, SLALOM_THEME);
      this._setFavicon();
      this.brand = {
        name: "Slalom",
        attribution: SLALOM_HUB_ATTRIBUTION,
        attributionLinks: [],
        hasCatalog: false
      };
      return;
    }

    const brandId = this.brandId;
    const [theme, identity] = await Promise.all([
      getBrandTheme(brandId),
      getBrandIdentity(brandId)
    ]);
    if (brandId !== this.brandId) return;
    applyBrandTokens(this.template.host, theme);
    this._setFavicon();
    this.brand = { ...identity, ...getBrandAssets(brandId) };
  }

  async _loadSwitcher() {
    const chipColors = { htf: "#117aca", subway: "#00843d", dunkin: "#ff671f" };
    const ids = [...BRAND_ORDER];
    const identities = await Promise.all(ids.map((id) => getBrandIdentity(id)));
    this.switcherOptions = ids.map((id, i) => {
      const b = identities[i] || {};
      return {
        id,
        name: b.name,
        switchTag: b.switchTag,
        initials: b.initials,
        chipStyle: `background:${chipColors[id]};`,
        // On the Slalom hub no brand experience is "current" — we're on the
        // hub itself, not any of the brand program domains.
        cls: `brand-opt${!this._slalom && id === this.brandId ? " is-current" : ""}`
      };
    });
  }

  disconnectedCallback() {
    if (this._outsideClickBound) {
      document.removeEventListener("click", this._outsideClickBound);
    }
  }

  renderedCallback() {
    const chev = this.template.querySelector(".chev");
    if (chev && !chev.innerHTML) chev.innerHTML = getIconSvg("chevron", 15);

    this.template.querySelectorAll(".nav-toggle").forEach((btn) => {
      if (!btn.innerHTML) btn.innerHTML = getIconSvg("menu", 26);
    });

    this.template.querySelectorAll(".brand-opt__check").forEach((el) => {
      if (!el.innerHTML) el.innerHTML = getIconSvg("check", 18);
    });

    // External-link glyph next to nav links that leave the site.
    this.template.querySelectorAll(".nav-link__ext").forEach((el) => {
      if (!el.innerHTML) el.innerHTML = getIconSvg("external", 13);
    });

    // Slalom hub: inject the inline Slalom wordmark.
    if (this._slalom) {
      this.template.querySelectorAll("[data-slalom-logo]").forEach((el) => {
        if (el.innerHTML) return;
        const h = parseInt(el.dataset.h, 10) || 30;
        const color = el.dataset.variant === "white" ? "#FFFFFF" : "#0C62FB";
        el.innerHTML = getSlalomLogoSvg({ color, height: h });
      });
    }
  }

  _setFavicon() {
    const favicons = {
      htf: FAVICON_HTF,
      subway: FAVICON_SUBWAY,
      dunkin: FAVICON_DUNKIN
    };
    const base = this._slalom
      ? FAVICON_SLALOM
      : favicons[this.brandId] || favicons.htf;
    // Cache-bust the favicon URL. Static-resource URLs are stable across
    // re-deploys, and browsers cache favicons by URL more aggressively than any
    // other asset — so a new icon binary at the same URL keeps showing the old
    // one until a hard refresh. Bumping FAVICON_VERSION forces every browser to
    // refetch on the next publish.
    const href =
      base + (base.includes("?") ? "&" : "?") + "v=" + FAVICON_VERSION;
    // applyHead() injects the favicon links and re-asserts them on load /
    // pageshow / visibilitychange so Safari (which ignores late favicon
    // mutations) actually picks them up.
    applyHead({ favicon: href });
  }

  _loadFonts() {
    try {
      if (!document.querySelector("[data-htf-fonts]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap";
        link.setAttribute("data-htf-fonts", "");
        document.head.appendChild(link);
      }
    } catch (_e) {
      /* LWS may restrict head access */
    }
  }

  get homeHref() {
    const base = (BASE_PATH || "/").replace(/\/?$/, "/");
    return base;
  }

  handleNavClick(e) {
    e.preventDefault();
    const page = e.currentTarget.dataset.page;
    const anchor = e.currentTarget.dataset.anchor;
    if (!page) return;

    const inPreview = isPreviewMode();
    const previewSuffix = inPreview ? "?preview" : "";
    const isHome =
      page.toLowerCase() === (this.homePageName || "").toLowerCase();

    if (isHome) {
      // comm__namedPage('Home') generates /home which 404s.
      // Navigate directly to the community base path instead.
      this[NavigationMixin.Navigate]({
        type: "standard__webPage",
        attributes: { url: this.homeHref + previewSuffix }
      });
    } else if (inPreview) {
      // Resolve the real URL via GenerateUrl then append ?preview so we
      // don't have to guess the URL slug from the page API name.
      const ref = { type: "comm__namedPage", attributes: { name: page } };
      this[NavigationMixin.GenerateUrl](ref)
        .then((url) =>
          this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: { url: url + "?preview" }
          })
        )
        .catch(() => this[NavigationMixin.Navigate](ref));
    } else {
      this[NavigationMixin.Navigate]({
        type: "comm__namedPage",
        attributes: { name: page }
      });
    }

    if (anchor && this._currentPageName === this.homePageName) {
      // Already on home — scroll after re-render
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
    this.mobileNavOpen = false;
  }

  handleBrandSwitch(e) {
    const targetId = e.currentTarget.dataset.brandid;
    if (!BRAND_ORDER.includes(targetId)) return;
    this.switcherOpen = false;
    // On the Slalom hub, detectBrandId() returns "htf" as a fallback (the hub
    // hostname "contentful.*" matches no brand subdomain). Skip the same-brand
    // guard there so clicking Hudson Bank actually navigates instead of no-op'ing.
    if (!this._slalom && targetId === this.brandId) return;
    // Each brand program runs on its own domain. Switching brand means
    // navigating to that brand's site (a full cross-domain page load).
    const url = getBrandUrl(targetId) + (isPreviewMode() ? "?preview" : "");
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: { url }
    });
  }

  _isActive(pageName) {
    return (
      this._currentPageName.toLowerCase() === (pageName || "").toLowerCase()
    );
  }
  get catalogNavClass() {
    return `nav-link${this._isActive(this.catalogPageName) ? " is-active" : ""}`;
  }
  get aboutNavClass() {
    return `nav-link${this._isActive(this.aboutPageName) ? " is-active" : ""}`;
  }
  get faqNavClass() {
    return `nav-link${this._isActive(this.faqPageName) ? " is-active" : ""}`;
  }
  get contactNavClass() {
    return `nav-link${this._isActive(this.contactPageName) ? " is-active" : ""}`;
  }

  toggleSwitcher(e) {
    e.stopPropagation();
    this.switcherOpen = !this.switcherOpen;
    if (this.switcherOpen) {
      // Use fixed positioning so the menu escapes any overflow:hidden ancestor
      // in the Experience Cloud layout. Calculate viewport-relative coordinates.
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      requestAnimationFrame(() => {
        const btn = this.template.querySelector(".brand-switch__btn");
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const vw = document.documentElement.clientWidth;
        const rightOffset = vw - rect.right;
        this.menuStyle = `top:${rect.bottom + 8}px;right:${rightOffset}px;`;
      });
    }
  }

  openMobileNav() {
    this.mobileNavOpen = true;
  }
  closeMobileNav() {
    this.mobileNavOpen = false;
  }

  _handleOutsideClick(e) {
    if (!this.template.querySelector(".brand-switch")?.contains(e.target)) {
      this.switcherOpen = false;
    }
  }
}