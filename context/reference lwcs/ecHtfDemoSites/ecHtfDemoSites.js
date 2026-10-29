import { LightningElement, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import {
  applyBrandTokens,
  getIconSvg,
  applyHead,
  SLALOM_THEME
} from "c/ecHtfBrandData";
import { getHubContent, isPreviewMode } from "c/ecHtfContentService";
import BASE_PATH from "@salesforce/community/basePath";

/**
 * ecHtfDemoSites — the "Demo Sites" page on the Contentful hub site.
 *
 * Displays the brand showcase section (three live experiences) that was
 * previously embedded on the hub home page. Moving it here keeps the home
 * page focused on the platform story while giving the demo directory its own
 * browseable URL (/demo-sites).
 */

// Per-brand accent colours [base, deep], keyed by brand. Applied as inline CSS
// custom properties on each card so the button colour never depends on the CMS
// brand key matching a CSS class name — the original hub drove these from a
// hard-coded list and broke once the cards came from Contentful, where an empty
// or unexpected brandKey left every "Explore" button falling back to hub blue.
const BRAND_ACCENTS = {
  htf: ["#117aca", "#0a5293"],
  subway: ["#009b3a", "#00712b"],
  dunkin: ["#ff671b", "#c44500"]
};

/** Normalise a card's brand to one of htf/subway/dunkin, inferring from the
 *  domain when the CMS brand key is missing or unexpected. */
function normaliseBrandKey(id, domain) {
  const key = (id || "").toLowerCase();
  if (BRAND_ACCENTS[key]) return key;
  const host = (domain || "").toLowerCase();
  if (host.startsWith("subway")) return "subway";
  if (host.startsWith("dunkin")) return "dunkin";
  return "htf";
}
export default class EcHtfDemoSites extends NavigationMixin(LightningElement) {
  @track showcase = {};
  @track _loaded = false;

  connectedCallback() {
    applyBrandTokens(this.template.host, SLALOM_THEME);
    this._load();
  }

  get homeHref() {
    return (BASE_PATH || "/").replace(/\/?$/, "/");
  }

  handleHomeClick(e) {
    e.preventDefault();
    // The LWR home page lives at the community base path (comm__namedPage 'Home'
    // resolves to /home, which 404s). Navigate to the base path directly.
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url: this.homeHref + (isPreviewMode() ? "?preview" : "")
      }
    });
  }

  async _load() {
    const c = await getHubContent();
    if (!c) return;
    this.showcase = c.brandShowcase || {};
    this._loaded = true;
    applyHead({
      title: "Demo Sites | Slalom",
      description: this.showcase.body || undefined
    });
  }

  renderedCallback() {
    this.template.querySelectorAll("[data-icon]").forEach((el) => {
      if (el.innerHTML) return;
      el.innerHTML = getIconSvg(
        el.dataset.icon,
        parseInt(el.dataset.size, 10) || 22
      );
    });

    // Apply each card's brand accent as CSS custom properties via the DOM API.
    // LWC's `style={}` template binding does not reliably set CSS custom
    // properties, so we set them here the same way applyBrandTokens does. This
    // guarantees the "Explore" button shows the brand colour rather than falling
    // back to the hub's blue --brand.
    this.template.querySelectorAll(".brand-card").forEach((el) => {
      const { accent, accentDeep } = el.dataset;
      if (accent) el.style.setProperty("--card-accent", accent);
      if (accentDeep) el.style.setProperty("--card-accent-deep", accentDeep);
    });
  }

  get hasCards() {
    return (
      this._loaded &&
      Array.isArray(this.showcase.brands) &&
      this.showcase.brands.length > 0
    );
  }

  get brandCards() {
    const brands = Array.isArray(this.showcase.brands)
      ? this.showcase.brands
      : [];
    return brands.map((b) => {
      const key = normaliseBrandKey(b.id, b.domain);
      const [accent, accentDeep] = BRAND_ACCENTS[key];
      return {
        id: b.id,
        tag: b.tag,
        name: b.name,
        domain: b.domain,
        description: b.description,
        enterUrl: b.enterUrl || "#",
        cardClass: `brand-card brand-card--${key}`,
        // Carried on data-* and applied as CSS custom properties in
        // renderedCallback (see there) so the button colour is guaranteed
        // regardless of the CMS brand key — see BRAND_ACCENTS above.
        accent,
        accentDeep,
        pages: (Array.isArray(b.pages) ? b.pages : []).map((p, i) => ({
          key: `${key}-${p.label}-${i}`,
          label: p.label,
          exclusive: p.exclusive || null,
          hasExclusive: !!p.exclusive
        }))
      };
    });
  }
}