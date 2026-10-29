import { LightningElement, api } from "lwc";
import LOGO_URL from "@salesforce/resourceUrl/pcLogo";
import { ROUTES, anchorHref, buildHref, navigateToAnchor } from "c/pcNav";

const EXTERNAL = {
  external: true,
  target: "_blank",
  rel: "noopener noreferrer"
};

export default class PcSiteFooter extends LightningElement {
  @api contactEmail = "jake.seibert@slalom.com";
  @api linkedInUrl = "https://www.linkedin.com/company/slalom-consulting/";

  logoUrl = LOGO_URL;

  get homeHref() {
    return buildHref(ROUTES.home);
  }

  get year() {
    return new Date().getFullYear();
  }

  get columns() {
    const approach = (anchor) => ({
      href: anchorHref(anchor, ROUTES.approach),
      anchor
    });
    const insights = buildHref(ROUTES.insights);
    return [
      {
        key: "solutions",
        title: "Solutions",
        links: [
          { key: "strategy", label: "Strategy design", ...approach("process") },
          {
            key: "journeys",
            label: "Partner journeys",
            ...approach("process")
          },
          {
            key: "engagement",
            label: "Multi-channel engagement",
            ...approach("engagement")
          },
          {
            key: "accelerators",
            label: "Slalom accelerators",
            ...approach("accelerators")
          }
        ]
      },
      {
        key: "insights",
        title: "Insights",
        links: [
          { key: "latest", label: "Latest articles", href: insights },
          { key: "cases", label: "Case studies", href: insights },
          {
            key: "newsletter",
            label: "Newsletter signup",
            href: anchorHref("newsletter", ROUTES.insights),
            anchor: "newsletter"
          }
        ]
      },
      {
        key: "company",
        title: "Company",
        links: [
          {
            key: "about",
            label: "About Slalom",
            href: "https://www.slalom.com",
            ...EXTERNAL
          },
          {
            key: "contact",
            label: "Contact Jake",
            href: `mailto:${this.contactEmail}`
          },
          {
            key: "salesforce",
            label: "slalom.com/salesforce",
            href: "https://slalom.com/salesforce",
            ...EXTERNAL
          },
          {
            key: "linkedin",
            label: "LinkedIn",
            href: this.linkedInUrl,
            ...EXTERNAL
          }
        ]
      }
    ];
  }

  get legalLinks() {
    return [
      {
        key: "privacy",
        label: "Privacy",
        href: "https://www.slalom.com/us/en/legal/privacy-policy"
      },
      {
        key: "terms",
        label: "Terms",
        href: "https://www.slalom.com/us/en/legal/terms-of-use"
      },
      {
        key: "accessibility",
        label: "Accessibility",
        href: "https://www.slalom.com/us/en/legal/accessibility"
      }
    ];
  }

  handleLinkClick(event) {
    navigateToAnchor(event);
  }
}
