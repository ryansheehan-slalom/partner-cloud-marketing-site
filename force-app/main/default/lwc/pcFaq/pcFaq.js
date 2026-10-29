import { LightningElement } from "lwc";
import {
  anchorHref,
  navigateToAnchor,
  registerAnchor,
  unregisterAnchor
} from "c/pcNav";

const ANCHOR = "faq";

const FAQS = [
  {
    id: "timeline",
    question: "How long does a typical Partner Cloud engagement take?",
    answer:
      "Most programs see a first release in 12–16 weeks: a short assessment and design phase followed by agile build sprints. Optimization continues after launch as we measure adoption and iterate."
  },
  {
    id: "replace",
    question: "Do we need to replace our existing partner portal?",
    answer:
      "Not necessarily. We often modernize existing tools first — simplifying journeys, decluttering navigation, and surfacing key actions — and only recommend a rebuild when the platform is holding partners back."
  },
  {
    id: "migration",
    question: "Can you migrate us from another PRM platform?",
    answer:
      "Yes. We plan data and process migration alongside the experience redesign, so partners land in a better portal rather than just a new one."
  },
  {
    id: "licensing",
    question: "Which Salesforce licenses will we need?",
    answer:
      "It depends on your partner roles and use cases. During assessment we map partner personas to the right Experience Cloud and Partner Relationship Management licenses so you only pay for what partners use."
  },
  {
    id: "success",
    question: "How do you measure success?",
    answer:
      "We agree on a small set of outcome metrics up front — time-to-first-deal, partner activation, portal adoption, and partner-sourced pipeline — and report on them throughout the engagement."
  }
];

export default class PcFaq extends LightningElement {
  openIds = [];

  _anchorEl;

  get items() {
    return FAQS.map((faq) => {
      const open = this.openIds.includes(faq.id);
      return {
        ...faq,
        buttonId: `pc-faq-btn-${faq.id}`,
        panelId: `pc-faq-panel-${faq.id}`,
        expanded: open ? "true" : "false",
        collapsed: !open,
        className: open ? "pc-faq__item pc-faq__item--open" : "pc-faq__item"
      };
    });
  }

  get connectHref() {
    return anchorHref("connect");
  }

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }

  handleToggle(event) {
    const id = event.currentTarget.dataset.id;
    this.openIds = this.openIds.includes(id)
      ? this.openIds.filter((openId) => openId !== id)
      : [...this.openIds, id];
  }

  handleAnchorClick(event) {
    navigateToAnchor(event);
  }
}
