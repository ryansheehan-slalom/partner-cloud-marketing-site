import { LightningElement, api } from "lwc";
import CONTACT_AVATAR from "@salesforce/resourceUrl/pcContactAvatar";
import { registerAnchor, unregisterAnchor } from "c/pcNav";

const ANCHOR = "connect";

export default class PcCtaBand extends LightningElement {
  @api contactName = "Jake Seibert";
  @api contactRole = "Senior Principal, Salesforce Partner Cloud";
  @api contactEmail = "jake.seibert@slalom.com";
  @api websiteUrl = "https://slalom.com/salesforce";

  avatarUrl = CONTACT_AVATAR;

  _anchorEl;

  get mailtoHref() {
    return `mailto:${this.contactEmail}`;
  }

  get emailLabel() {
    const firstName = (this.contactName || "").trim().split(/\s+/)[0];
    return firstName ? `Email ${firstName}` : "Email us";
  }

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }
}
