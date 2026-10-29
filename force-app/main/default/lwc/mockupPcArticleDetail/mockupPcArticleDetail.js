import { LightningElement } from "lwc";

/**
 * MOCKUP — Partner Cloud article detail page. Static prototype, no backend.
 */
export default class MockupPcArticleDetail extends LightningElement {
  // MOCKUP: interactions stubbed for visual review only.
  handleNavClick(event) {
    const label = event.currentTarget?.dataset?.label || "link";
    // eslint-disable-next-line no-console
    console.log(`[mockup] article click: ${label}`);
  }
}