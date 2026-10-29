import { LightningElement } from "lwc";
import { ROUTES, buildHref, registerAnchor, unregisterAnchor } from "c/pcNav";

const ANCHOR = "solution";

export default class PcSolutionGrid extends LightningElement {
  offerings = [
    {
      icon: "layers",
      title: "Strategy-led ecosystem design",
      description:
        "Grounded in partner strategy, industry insight, and purposeful UX."
    },
    {
      icon: "dollar",
      title: "Realized ROI and partner value",
      description:
        "Pair deal insights with incentive forecasting and marketing attribution for a 360° view of investment and expected revenue."
    },
    {
      icon: "refresh",
      title: "Streamlined core partner journeys",
      description:
        "Simplified onboarding, enablement, selling motions, and program progression."
    },
    {
      icon: "megaphone",
      title: "Multi-channel engagement",
      description:
        "Combining marketing communications with Slack-based, real-time interactions."
    },
    {
      icon: "grid",
      title: "Centralized partner hub architecture",
      description:
        "Provide partners with a full view of their engagement across the ecosystem."
    },
    {
      icon: "bolt",
      title: "Slalom-only accelerators",
      description:
        "Drive immediate impact with intuitive marketing development visualization and deal intake channels through directory management."
    }
  ];

  _anchorEl;

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
}
