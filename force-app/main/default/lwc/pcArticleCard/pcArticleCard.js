import { LightningElement, api } from "lwc";

export default class PcArticleCard extends LightningElement {
  /** Decorated article from c/pcArticleData. */
  @api article;
  @api showAuthor = false;
  /** "long" → "Aug 12, 2026"; "short" → "Aug 12 · 6 min". */
  @api metaFormat = "long";

  get metaLabel() {
    if (!this.article) {
      return "";
    }
    return this.metaFormat === "short"
      ? this.article.metaShort
      : this.article.dateLabel;
  }
}
