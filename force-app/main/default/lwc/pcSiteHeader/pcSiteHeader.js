import { LightningElement, api } from "lwc";
import LOGO_URL from "@salesforce/resourceUrl/pcLogo";
import { ROUTES, anchorHref, buildHref, navigateToAnchor } from "c/pcNav";

const FONT_LINK_ID = "pc-google-fonts";
let fontsRequested = false;
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap";

export default class PcSiteHeader extends LightningElement {
  @api demoUrl = "https://htf-poc-ai.my.site.com/partners/";
  @api aboutUrl = "https://www.slalom.com/us/en/who-we-are";
  @api partnerSiteUrl = "https://slalom.com/salesforce";
  /** Set when fonts are already loaded via the theme head markup. */
  @api disableFontLoading = false;

  logoUrl = LOGO_URL;
  menuOpen = false;

  _keydownHandler = this.handleKeydown.bind(this);

  connectedCallback() {
    if (!this.disableFontLoading) {
      this.loadFonts();
    }
    window.addEventListener("keydown", this._keydownHandler);
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this._keydownHandler);
  }

  get homeHref() {
    return buildHref(ROUTES.home);
  }

  get navLinks() {
    return [
      {
        key: "approach",
        label: "Approach",
        href: buildHref(ROUTES.approach)
      },
      {
        key: "insights",
        label: "Insights",
        href: buildHref(ROUTES.insights)
      },
      {
        key: "about",
        label: "About",
        href: this.aboutUrl,
        external: true,
        target: "_blank",
        rel: "noopener noreferrer"
      },
      {
        key: "connect",
        label: "Connect",
        href: anchorHref("connect"),
        anchor: "connect"
      }
    ];
  }

  get menuExpanded() {
    return this.menuOpen ? "true" : "false";
  }

  get menuButtonLabel() {
    return this.menuOpen ? "Close menu" : "Open menu";
  }

  get menuIcon() {
    return this.menuOpen ? "close" : "menu";
  }

  handleMenuToggle() {
    this.menuOpen = !this.menuOpen;
  }

  handleLinkClick(event) {
    navigateToAnchor(event);
    this.menuOpen = false;
  }

  handleKeydown(event) {
    if (event.key !== "Escape" || !this.menuOpen) {
      return;
    }
    const focusInMenu = Boolean(
      this.template.activeElement?.closest(".pc-mobile-menu")
    );
    this.menuOpen = false;
    if (focusInMenu) {
      this.refs.menuButton.focus();
    }
  }

  // Mirrors ecHtfSiteHeader._loadFonts(): inject the Google Fonts stylesheet once per page.
  loadFonts() {
    if (fontsRequested || document.head.querySelector(`link#${FONT_LINK_ID}`)) {
      return;
    }
    fontsRequested = true;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }
}
