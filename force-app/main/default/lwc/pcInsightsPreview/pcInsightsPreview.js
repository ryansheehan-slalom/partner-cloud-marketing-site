import { LightningElement, api } from "lwc";
import { getLatestArticles } from "c/pcArticleData";
import { ROUTES, buildHref, registerAnchor, unregisterAnchor } from "c/pcNav";

const ANCHOR = "insights-preview";
const DEFAULT_COUNT = 3;

export default class PcInsightsPreview extends LightningElement {
  @api articleCount = DEFAULT_COUNT;

  _anchorEl;

  get articles() {
    const count = parseInt(this.articleCount, 10);
    return getLatestArticles(count > 0 ? count : DEFAULT_COUNT);
  }

  get insightsHref() {
    return buildHref(ROUTES.insights);
  }

  renderedCallback() {
    this._anchorEl = this.refs.section;
    registerAnchor(ANCHOR, this._anchorEl);
  }

  disconnectedCallback() {
    unregisterAnchor(ANCHOR, this._anchorEl);
  }
}
