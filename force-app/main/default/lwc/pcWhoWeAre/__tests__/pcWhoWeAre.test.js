import { createElement } from "lwc";
import PcWhoWeAre from "c/pcWhoWeAre";

describe("c-pc-who-we-are", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the purpose copy, lockup art, and external CTA", () => {
    const el = createElement("c-pc-who-we-are", { is: PcWhoWeAre });
    document.body.appendChild(el);
    const root = el.shadowRoot;

    expect(root.querySelector("h2").textContent.trim()).toBe(
      "Purpose-led. Salesforce-fluent. Ecosystem-focused."
    );
    expect(root.querySelectorAll(".pc-feature__body")).toHaveLength(2);
    expect(root.querySelector("section").classList).toContain(
      "pc-section--tight"
    );
    expect(root.querySelector(".pc-feature__img").getAttribute("src")).toBe(
      "pcWhoWeAreArt"
    );

    const cta = root.querySelector(".pc-feature__cta a");
    expect(cta.getAttribute("href")).toBe("https://slalom.com/salesforce");
    expect(cta.getAttribute("target")).toBe("_blank");
    expect(cta.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
