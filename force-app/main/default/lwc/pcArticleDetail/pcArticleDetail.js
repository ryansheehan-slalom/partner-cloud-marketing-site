import { LightningElement, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import {
  getArticleBySlug,
  getFeaturedArticle,
  getRelatedArticles
} from "c/pcArticleData";
import { ROUTES, anchorHref, buildHref } from "c/pcNav";

const STATUS_RESET_MS = 2500;

export default class PcArticleDetail extends LightningElement {
  /** Fallback slug when the URL has no ?article= parameter. */
  @api
  get articleSlug() {
    return this._apiSlug;
  }
  set articleSlug(value) {
    this._apiSlug = value;
    this.resolveArticle();
  }

  article = null;
  relatedArticles = [];
  shareStatus = "";
  copyIcon = "link";

  _apiSlug;
  _urlSlug;
  _resolvedSlug;
  _statusTimer;

  @wire(CurrentPageReference)
  wiredPageRef(pageRef) {
    this._urlSlug = pageRef?.state?.article;
    this.resolveArticle();
  }

  connectedCallback() {
    this.resolveArticle();
  }

  disconnectedCallback() {
    clearTimeout(this._statusTimer);
  }

  /** Unknown slugs render the not-found state; no slug at all shows the featured article. */
  resolveArticle() {
    const slug = this._urlSlug || this._apiSlug || null;
    if (this.article !== null && slug === this._resolvedSlug) {
      return;
    }
    this._resolvedSlug = slug;
    this.article = slug ? getArticleBySlug(slug) : getFeaturedArticle();
    this.relatedArticles = this.article
      ? getRelatedArticles(this.article.slug, 3)
      : [];
  }

  get insightsHref() {
    return buildHref(ROUTES.insights);
  }

  get connectHref() {
    return anchorHref("connect");
  }

  get shareUrl() {
    const origin = window.location.origin;
    return this.article
      ? `${origin}${this.article.href}`
      : window.location.href;
  }

  get linkedInShareHref() {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}`;
  }

  get emailShareHref() {
    const subject = encodeURIComponent(this.article?.title || "");
    const body = encodeURIComponent(
      `${this.article?.deck || ""}\n\n${this.shareUrl}`
    );
    return `mailto:?subject=${subject}&body=${body}`;
  }

  async handleCopyLink() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.showStatus("Link copied", "check");
    } catch {
      this.showStatus("Copy failed — use your browser's address bar", "link");
    }
  }

  showStatus(message, icon) {
    this.shareStatus = message;
    this.copyIcon = icon;
    clearTimeout(this._statusTimer);
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this._statusTimer = setTimeout(() => {
      this.shareStatus = "";
      this.copyIcon = "link";
    }, STATUS_RESET_MS);
  }
}
