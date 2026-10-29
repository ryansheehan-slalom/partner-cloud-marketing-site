import { LightningElement } from "lwc";

/**
 * MOCKUP — Partner Cloud site header. Static chrome, no backend dependencies.
 */
export default class MockupPcSiteHeader extends LightningElement {
  // MOCKUP: nav is stubbed — visual review only.
  handleNavClick(event) {
    const label = event.currentTarget?.dataset?.label || "link";
    // eslint-disable-next-line no-console
    console.log(`[mockup] header cta clicked: ${label}`);
  }
}