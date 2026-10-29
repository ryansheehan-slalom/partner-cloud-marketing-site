import { LightningElement, api } from "lwc";
import { ARTICLE_TAGS, getArticles, getFeaturedArticle } from "c/pcArticleData";
import { registerAnchor, unregisterAnchor } from "c/pcNav";

const ALL = "all";
const DEFAULT_PAGE_SIZE = 6;
const NEWSLETTER_ANCHOR = "newsletter";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default class PcInsightsPage extends LightningElement {
  @api pageSize = DEFAULT_PAGE_SIZE;

  activeFilter = ALL;
  visibleCount;
  email = "";
  errorMessage = "";
  subscribed = false;

  _articles = getArticles();
  _featured = getFeaturedArticle();
  _newsletterEl;

  connectedCallback() {
    this.visibleCount = this.normalizedPageSize;
  }

  renderedCallback() {
    this._newsletterEl = this.refs.newsletter;
    registerAnchor(NEWSLETTER_ANCHOR, this._newsletterEl);
  }

  disconnectedCallback() {
    unregisterAnchor(NEWSLETTER_ANCHOR, this._newsletterEl);
  }

  get normalizedPageSize() {
    const size = parseInt(this.pageSize, 10);
    return size > 0 ? size : DEFAULT_PAGE_SIZE;
  }

  get filters() {
    return [ALL, ...ARTICLE_TAGS].map((value) => {
      const active = value === this.activeFilter;
      return {
        value,
        label: value === ALL ? "All" : value,
        pressed: active ? "true" : "false",
        className: active ? "pc-tab pc-tab--active" : "pc-tab"
      };
    });
  }

  get isAll() {
    return this.activeFilter === ALL;
  }

  get featured() {
    return this._featured;
  }

  get showFeatured() {
    return this.isAll && Boolean(this._featured);
  }

  /** "All" hides the featured article from the grid since it's shown above. */
  get filteredArticles() {
    if (this.isAll) {
      return this._articles.filter(
        (article) => article.slug !== this._featured?.slug
      );
    }
    return this._articles.filter(
      (article) => article.tag === this.activeFilter
    );
  }

  get visibleArticles() {
    return this.filteredArticles.slice(0, this.visibleCount);
  }

  get hasArticles() {
    return this.filteredArticles.length > 0;
  }

  get hasMore() {
    return this.filteredArticles.length > this.visibleCount;
  }

  get gridHeading() {
    return this.isAll ? "All articles" : `${this.activeFilter} articles`;
  }

  get resultsAnnouncement() {
    const count = this.filteredArticles.length;
    return `${count} ${count === 1 ? "article" : "articles"} shown`;
  }

  get emailInvalid() {
    return this.errorMessage ? "true" : "false";
  }

  handleFilterClick(event) {
    this.activeFilter = event.currentTarget.dataset.value;
    this.visibleCount = this.normalizedPageSize;
  }

  handleLoadMore() {
    this.visibleCount += this.normalizedPageSize;
  }

  handleEmailInput(event) {
    this.email = event.target.value;
    if (this.errorMessage) {
      this.errorMessage = "";
    }
  }

  // Static v1: no subscription backend yet — validate and confirm client-side only.
  handleSubscribe(event) {
    event.preventDefault();
    const value = (this.email || "").trim();
    if (!EMAIL_PATTERN.test(value)) {
      this.errorMessage = "Please enter a valid email address.";
      return;
    }
    this.errorMessage = "";
    this.subscribed = true;
  }
}
