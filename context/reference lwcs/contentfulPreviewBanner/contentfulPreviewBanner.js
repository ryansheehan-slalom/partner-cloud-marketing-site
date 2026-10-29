import { LightningElement } from "lwc";
import { isPreviewMode } from "c/contentfulService";

const BANNER_HEIGHT = "40px";

/**
 * contentfulPreviewBanner — fixed banner shown only when the page is in
 * Contentful preview mode (?preview in the URL). Place it on the Experience
 * Cloud template so it appears on every page; it renders nothing in published
 * mode. Sets --preview-bar-h on the document root so the sticky site header
 * can offset its top position accordingly.
 */
export default class ContentfulPreviewBanner extends LightningElement {
  preview = false;
  exitUrl = "#";

  connectedCallback() {
    this.preview = isPreviewMode();
    if (this.preview) {
      this.exitUrl = this._buildExitUrl();
      try {
        // --preview-bar-h offsets the sticky site header so it sticks below the banner.
        // padding-top on body pushes the document flow down by the banner height so
        // page content is not obscured on initial load.
        document.documentElement.style.setProperty(
          "--preview-bar-h",
          BANNER_HEIGHT
        );
        document.body.style.setProperty("padding-top", BANNER_HEIGHT);
      } catch (_e) {
        /* LWS may restrict document access */
      }
    }
  }

  disconnectedCallback() {
    try {
      document.documentElement.style.removeProperty("--preview-bar-h");
      document.body.style.removeProperty("padding-top");
    } catch (_e) {
      /* LWS may restrict document access */
    }
  }

  /** Current page URL with the preview parameter removed. */
  _buildExitUrl() {
    const url = document.URL;
    const hashIndex = url.indexOf("#");
    const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
    const noHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
    const queryIndex = noHash.indexOf("?");
    if (queryIndex < 0) return url;

    const base = noHash.slice(0, queryIndex);
    const params = noHash
      .slice(queryIndex + 1)
      .split("&")
      .filter((part) => part.split("=")[0].toLowerCase() !== "preview");
    const query = params.length ? "?" + params.join("&") : "";
    return base + query + hash;
  }
}