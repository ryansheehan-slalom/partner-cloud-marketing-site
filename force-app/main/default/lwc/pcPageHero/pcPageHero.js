import { LightningElement, api } from "lwc";
import {
  ROUTES,
  buildHref,
  currentPageAnchorHref,
  navigateToAnchor
} from "c/pcNav";

/**
 * Interior-page hero (reference pattern: ecHtfPageHero). Shorter than pcHero,
 * with breadcrumb, eyebrow, H1 (+ optional gradient accent), lede, and up to
 * two CTAs. CTA hrefs starting with "#" scroll to a registered section on the
 * current page; other values are treated as site paths or external URLs.
 */
export default class PcPageHero extends LightningElement {
  @api eyebrow = "";
  @api title = "";
  @api titleAccent = "";
  @api lede = "";
  @api crumbLabel = "";
  @api hideBreadcrumb = false;
  @api primaryLabel = "";
  @api primaryHref = "";
  @api secondaryLabel = "";
  @api secondaryHref = "";

  get homeHref() {
    return buildHref(ROUTES.home);
  }

  get showBreadcrumb() {
    return !this.hideBreadcrumb;
  }

  get crumbText() {
    return this.crumbLabel || this.eyebrow || this.title;
  }

  get titleSpacer() {
    return this.title ? " " : "";
  }

  get ctas() {
    return [
      {
        key: "primary",
        label: this.primaryLabel,
        href: this.primaryHref,
        className: "pc-btn pc-btn--primary pc-btn--lg"
      },
      {
        key: "secondary",
        label: this.secondaryLabel,
        href: this.secondaryHref,
        className: "pc-btn pc-btn--ghost pc-btn--lg"
      }
    ]
      .filter((cta) => cta.label && cta.href)
      .map((cta) => {
        const isAnchor = cta.href.startsWith("#");
        return {
          ...cta,
          href: isAnchor
            ? currentPageAnchorHref(cta.href.slice(1))
            : buildHref(cta.href),
          anchor: isAnchor ? cta.href.slice(1) : undefined
        };
      });
  }

  get hasCtas() {
    return this.ctas.length > 0;
  }

  handleCtaClick(event) {
    navigateToAnchor(event);
  }
}
