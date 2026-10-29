import { LightningElement } from "lwc";

/**
 * MOCKUP — Partner Cloud Insights listing page. Static prototype, no backend.
 */
export default class MockupPcInsightsPage extends LightningElement {
  // MOCKUP: interactions stubbed for visual review only.
  handleNavClick(event) {
    const label = event.currentTarget?.dataset?.label || "link";
    // eslint-disable-next-line no-console
    console.log(`[mockup] insights click: ${label}`);
  }

  handleSubmit(event) {
    event.preventDefault();
    // eslint-disable-next-line no-console
    console.log("[mockup] newsletter subscribe (stubbed)");
  }
}