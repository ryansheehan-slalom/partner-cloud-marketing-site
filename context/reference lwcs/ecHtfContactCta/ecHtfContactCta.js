import { LightningElement, wire, api } from "lwc";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import BASE_PATH from "@salesforce/community/basePath";

import { detectBrandId, applyBrandTokens, BRAND_ORDER } from "c/ecHtfBrandData";
import { getBrandTheme, isPreviewMode } from "c/ecHtfContentService";

export default class EcHtfContactCta extends NavigationMixin(LightningElement) {
  @api contactPageName = "contact";
  @api applyPageName = "apply";

  _brandId = "htf";

  connectedCallback() {
    this._brandId = detectBrandId();
    this._applyTheme();
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
    if (resolved !== this._brandId) {
      this._brandId = resolved;
      this._applyTheme();
    }
  }

  async _applyTheme() {
    const brandId = this._brandId;
    const theme = await getBrandTheme(brandId);
    if (brandId !== this._brandId) return;
    applyBrandTokens(this.template.host, theme);
  }

  handleContactClick(e) {
    e.preventDefault();
    const ref = {
      type: "comm__namedPage",
      attributes: { name: this.contactPageName }
    };
    if (isPreviewMode()) {
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
  }

  handleApplyClick(e) {
    e.preventDefault();
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url:
          (BASE_PATH || "/").replace(/\/?$/, "/") +
          this.applyPageName +
          (isPreviewMode() ? "?preview" : "")
      }
    });
  }
}