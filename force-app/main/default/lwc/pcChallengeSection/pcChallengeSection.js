import { LightningElement, api } from "lwc";
import CHALLENGE_ART from "@salesforce/resourceUrl/pcChallengeArt";
import { registerAnchor, unregisterAnchor } from "c/pcNav";

const ANCHOR = "challenge";

export default class PcChallengeSection extends LightningElement {
  /** Places the media panel on the right instead of the left. */
  @api reversed = false;

  artUrl = CHALLENGE_ART;

  challenges = [
    {
      icon: "doc",
      title: "Frustrating deal registration",
      sub: "Long forms drag down pipeline visibility."
    },
    {
      icon: "layout",
      title: "Cluttered user experiences",
      sub: "Hidden key actions push partners off-platform."
    },
    {
      icon: "chart",
      title: "Limited tiering visibility",
      sub: "Progress and rewards go unrecognized, weakening loyalty."
    },
    {
      icon: "shield",
      title: "No channel conflict strategy",
      sub: "Ambiguity erodes partner trust."
    },
    {
      icon: "spark",
      title: "Weak enablement & onboarding",
      sub: "Adoption and usage stall out."
    },
    {
      icon: "users",
      title: "Non-sales partner needs ignored",
      sub: "Program value is capped at the deal desk."
    }
  ];

  _anchorEl;

  get gridClass() {
    return this.reversed ? "pc-feature pc-feature--rev" : "pc-feature";
  }

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }
}
