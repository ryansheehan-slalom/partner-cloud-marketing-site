import { createElement } from "lwc";
import PcHero from "c/pcHero";
import PcCtaBand from "c/pcCtaBand";

describe("c-pc-hero", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.restoreAllMocks();
  });

  function render(props = {}) {
    const el = createElement("c-pc-hero", { is: PcHero });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders the headline with accent spans, CTAs, and assurances", () => {
    const el = render();
    const root = el.shadowRoot;
    // Exact match (no whitespace normalization): word spaces must come from the
    // segment text, since the platform compiler trims template whitespace.
    const segments = [...root.querySelectorAll("h1 > span")].map(
      (s) => s.textContent
    );
    expect(segments.join("")).toBe(
      "Empower your partners with a compelling experience that accelerates growth and provides meaningful value."
    );
    expect(
      [...root.querySelectorAll(".pc-accent")].map((s) => s.textContent)
    ).toEqual(["compelling", "accelerates growth", "meaningful value"]);
    const ctas = root.querySelectorAll(".pc-hero__cta a");
    expect(ctas[0].getAttribute("href")).toBe("/partnercloud/#connect");
    expect(ctas[1].getAttribute("href")).toBe("/partnercloud/approach");
    expect(root.querySelectorAll(".pc-chip-a")).toHaveLength(3);
    expect(root.querySelector(".pc-floatcard__title").textContent).toBe(
      "Salesforce Partner"
    );
  });

  it("uses the static resource image unless overridden", () => {
    const el = render();
    expect(
      el.shadowRoot.querySelector(".pc-hero__img").getAttribute("src")
    ).toBe("pcHeroPhoto");

    const custom = render({ imageUrl: "/team.jpg", imageAlt: "Team" });
    const img = custom.shadowRoot.querySelector(".pc-hero__img");
    expect(img.getAttribute("src")).toBe("/team.jpg");
    expect(img.getAttribute("alt")).toBe("Team");
  });

  it("scrolls to the Connect band when it is on the same page", () => {
    const scroll = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scroll;
    const hero = render();
    document.body.appendChild(
      createElement("c-pc-cta-band", { is: PcCtaBand })
    );

    const link = hero.shadowRoot.querySelector(".pc-hero__cta a");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(scroll).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });
});
