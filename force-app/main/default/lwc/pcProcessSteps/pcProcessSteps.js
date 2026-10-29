import { LightningElement } from "lwc";
import { registerAnchor, unregisterAnchor } from "c/pcNav";

const ANCHOR = "process";

export default class PcProcessSteps extends LightningElement {
  steps = [
    {
      number: "1",
      title: "Assess",
      duration: "2–3 weeks",
      description:
        "We audit your partner program, portal analytics, and partner feedback to pinpoint where friction is costing you pipeline.",
      deliverables: [
        "Partner journey & friction audit",
        "Program and tiering benchmark",
        "Prioritized opportunity roadmap"
      ]
    },
    {
      number: "2",
      title: "Design",
      duration: "3–4 weeks",
      description:
        "We co-design the target partner experience — journeys, navigation, and the data model behind a 360° partner view.",
      deliverables: [
        "Target-state journey maps",
        "Clickable portal prototype",
        "ROI & measurement framework"
      ]
    },
    {
      number: "3",
      title: "Build",
      duration: "8–12 weeks",
      description:
        "We implement on Salesforce Partner Cloud in agile releases, using Slalom accelerators to shortcut common capabilities.",
      deliverables: [
        "Partner portal on Experience Cloud",
        "Deal registration & channel rules",
        "Slack and marketing integrations"
      ]
    },
    {
      number: "4",
      title: "Optimize",
      duration: "Ongoing",
      description:
        "We measure adoption and time-to-first-deal, then iterate on what partners actually use.",
      deliverables: [
        "Adoption & ROI dashboards",
        "Enablement and change playbooks",
        "Quarterly experience reviews"
      ]
    }
  ];

  _anchorEl;

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }
}
