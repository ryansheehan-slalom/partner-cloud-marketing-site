import { LightningElement, api } from "lwc";
import HERO_IMAGE from "@salesforce/resourceUrl/pcHeroPhoto";
import {
  ROUTES,
  anchorHref,
  buildHref,
  navigateToAnchor,
  registerAnchor,
  unregisterAnchor
} from "c/pcNav";

const ANCHOR = "home";
const DEFAULT_ALT =
  "Illustration of Salesforce partners connected through a central Partner Cloud hub";

export default class PcHero extends LightningElement {
  /** Override with a team photo URL when one is available. */
  @api imageUrl;
  @api imageAlt;

  titleSegments = [
    { key: "t1", text: "Empower your partners with a " },
    { key: "t2", text: "compelling", accent: true },
    { key: "t3", text: " experience that " },
    { key: "t4", text: "accelerates growth", accent: true },
    { key: "t5", text: " and provides " },
    { key: "t6", text: "meaningful value", accent: true },
    { key: "t7", text: "." }
  ];

  assurances = [
    "Strategy-led",
    "360° partner view",
    "Slalom-only accelerators"
  ];

  _anchorEl;

  get heroImageUrl() {
    return this.imageUrl || HERO_IMAGE;
  }

  get heroImageAlt() {
    return this.imageAlt || DEFAULT_ALT;
  }

  get connectHref() {
    return anchorHref("connect");
  }

  get approachHref() {
    return buildHref(ROUTES.approach);
  }

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }

  handleAnchorClick(event) {
    navigateToAnchor(event);
  }
}
