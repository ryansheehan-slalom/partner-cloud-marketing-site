import { LightningElement } from "lwc";

/**
 * MOCKUP — Partner Cloud home page (Elevated / Abstract direction).
 * Throwaway visual prototype. No Apex, @wire, schema, or label imports.
 * All content is hardcoded in the template for side-by-side design review.
 */
export default class MockupPartnerCloudHome extends LightningElement {
  // MOCKUP: nav is stubbed — this component is for visual review only.
  handleNavClick(event) {
    const label = event.currentTarget?.dataset?.label || "link";
    // eslint-disable-next-line no-console
    console.log(`[mockup] nav/cta clicked: ${label}`);
  }
}