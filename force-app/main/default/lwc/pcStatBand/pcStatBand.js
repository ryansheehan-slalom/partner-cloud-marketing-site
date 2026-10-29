import { LightningElement, api } from "lwc";

/**
 * Proof-point strip (reference pattern: ecHtfStatBand). Defaults restate facts
 * already published on the site; swap in measured outcomes via Builder once
 * they're approved.
 */
export default class PcStatBand extends LightningElement {
  @api heading = "Why Slalom for Partner Cloud";
  @api stat1Value = "Summit";
  @api stat1Label = "Salesforce Consulting Partner tier";
  @api stat2Value = "360°";
  @api stat2Label = "View of partner investment and expected revenue";
  @api stat3Value = "30·60·90";
  @api stat3Label = "Day onboarding blueprint to shorten time-to-first-deal";

  get stats() {
    return [
      { key: "1", value: this.stat1Value, label: this.stat1Label },
      { key: "2", value: this.stat2Value, label: this.stat2Label },
      { key: "3", value: this.stat3Value, label: this.stat3Label }
    ].filter((stat) => stat.value);
  }
}
