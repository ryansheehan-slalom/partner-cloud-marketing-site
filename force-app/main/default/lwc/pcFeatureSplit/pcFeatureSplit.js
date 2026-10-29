import { LightningElement, api } from "lwc";
import INSIGHT_ART from "@salesforce/resourceUrl/pcInsightArt";
import CHALLENGE_ART from "@salesforce/resourceUrl/pcChallengeArt";
import WHO_WE_ARE_ART from "@salesforce/resourceUrl/pcWhoWeAreArt";
import HERO_ART from "@salesforce/resourceUrl/pcHeroPhoto";
import {
  buildHref,
  currentPageAnchorHref,
  navigateToAnchor,
  registerAnchor,
  unregisterAnchor
} from "c/pcNav";

const WIDE = { width: 1600, height: 900, wide: true };
const CLASSIC = { width: 800, height: 640, wide: false };

/** Art available to Builder via the "image" picklist. */
const IMAGES = {
  roi: {
    url: `${INSIGHT_ART}/roi.svg`,
    alt: "Illustration of a 360-degree revenue ring beside a rising bar chart",
    ...WIDE
  },
  engagement: {
    url: `${INSIGHT_ART}/slack.svg`,
    alt: "Illustration of a collaboration channel with real-time deal approval messages",
    ...WIDE
  },
  directory: {
    url: `${INSIGHT_ART}/directory.svg`,
    alt: "Illustration of a searchable partner directory routing a request to a deal inbox",
    ...WIDE
  },
  journeys: {
    url: `${INSIGHT_ART}/journeys.svg`,
    alt: "Illustration of a partner journey path with milestones",
    ...WIDE
  },
  onboarding: {
    url: `${INSIGHT_ART}/onboarding.svg`,
    alt: "Illustration of ascending 30, 60, and 90 day steps",
    ...WIDE
  },
  tiering: {
    url: `${INSIGHT_ART}/tiering.svg`,
    alt: "Illustration of partner tier medallions and a progress bar",
    ...WIDE
  },
  conflict: {
    url: `${INSIGHT_ART}/conflict.svg`,
    alt: "Illustration of direct and partner lanes merging through a shield",
    ...WIDE
  },
  forecast: {
    url: `${INSIGHT_ART}/forecast.svg`,
    alt: "Illustration of an incentive spend forecast chart",
    ...WIDE
  },
  challenge: {
    url: CHALLENGE_ART,
    alt: "Illustration of a cluttered partner portal",
    ...CLASSIC
  },
  lockup: {
    url: WHO_WE_ARE_ART,
    alt: "Slalom and Salesforce Partner Cloud lockup",
    ...CLASSIC
  },
  hub: {
    url: HERO_ART,
    alt: "Illustration of partners connected through a central Partner Cloud hub",
    width: 800,
    height: 680,
    wide: false
  }
};
const DEFAULT_IMAGE = "roi";
const BACKGROUNDS = ["white", "surface", "canvas"];

export default class PcFeatureSplit extends LightningElement {
  /** Registers this section for in-page links (e.g. /approach#roi). */
  @api anchorId = "";
  @api eyebrow = "";
  @api title = "";
  @api body = "";
  @api bullet1 = "";
  @api bullet2 = "";
  @api bullet3 = "";
  @api bullet4 = "";
  @api image = DEFAULT_IMAGE;
  @api imageAlt = "";
  @api reversed = false;
  @api background = "white";
  @api ctaLabel = "";
  @api ctaHref = "";

  _anchorEl;
  _registeredId;

  get resolvedImage() {
    return IMAGES[this.image] || IMAGES[DEFAULT_IMAGE];
  }

  get media() {
    return this.resolvedImage;
  }

  get resolvedImageAlt() {
    return this.imageAlt || this.resolvedImage.alt;
  }

  get sectionClass() {
    const bg = BACKGROUNDS.includes(this.background)
      ? this.background
      : "white";
    return `pc-section pc-section--${bg} pc-bleed pc-split-section`;
  }

  get gridClass() {
    return this.reversed ? "pc-split pc-split--rev" : "pc-split";
  }

  get mediaClass() {
    return this.resolvedImage.wide
      ? "pc-split__media pc-split__media--wide"
      : "pc-split__media";
  }

  get bullets() {
    return [this.bullet1, this.bullet2, this.bullet3, this.bullet4]
      .filter((text) => text && text.trim())
      .map((text, index) => ({ key: `b${index}`, text }));
  }

  get hasBullets() {
    return this.bullets.length > 0;
  }

  get hasCta() {
    return Boolean(this.ctaLabel && this.ctaHref);
  }

  get ctaUrl() {
    return this.ctaHref && this.ctaHref.startsWith("#")
      ? currentPageAnchorHref(this.ctaHref.slice(1))
      : buildHref(this.ctaHref);
  }

  get ctaAnchor() {
    return this.ctaHref && this.ctaHref.startsWith("#")
      ? this.ctaHref.slice(1)
      : undefined;
  }

  renderedCallback() {
    if (this._registeredId && this._registeredId !== this.anchorId) {
      unregisterAnchor(this._registeredId, this._anchorEl);
    }
    this._anchorEl = this.refs.section;
    this._registeredId = this.anchorId;
    if (this.anchorId) {
      registerAnchor(this.anchorId, this._anchorEl);
    }
  }

  disconnectedCallback() {
    if (this._registeredId) {
      unregisterAnchor(this._registeredId, this._anchorEl);
    }
  }

  handleCtaClick(event) {
    navigateToAnchor(event);
  }
}
