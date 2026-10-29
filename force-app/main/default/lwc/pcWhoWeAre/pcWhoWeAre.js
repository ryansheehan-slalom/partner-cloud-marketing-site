import { LightningElement, api } from "lwc";
import WHO_WE_ARE_ART from "@salesforce/resourceUrl/pcWhoWeAreArt";
import { registerAnchor, unregisterAnchor } from "c/pcNav";

const ANCHOR = "who-we-are";

export default class PcWhoWeAre extends LightningElement {
  @api learnMoreUrl = "https://slalom.com/salesforce";

  artUrl = WHO_WE_ARE_ART;

  _anchorEl;

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }
}
