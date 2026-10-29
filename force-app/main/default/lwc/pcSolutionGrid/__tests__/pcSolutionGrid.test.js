import { createElement } from "lwc";
import PcSolutionGrid from "c/pcSolutionGrid";

describe("c-pc-solution-grid", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the section head and six offering cards with icons", () => {
    const el = createElement("c-pc-solution-grid", { is: PcSolutionGrid });
    document.body.appendChild(el);
    const root = el.shadowRoot;

    const section = root.querySelector("section");
    expect(section.getAttribute("aria-labelledby")).toBeTruthy();
    expect(root.querySelector(".pc-sec-head__title").textContent.trim()).toBe(
      "A strategy-first approach to partner ecosystem modernization."
    );
    const cards = root.querySelectorAll(".pc-card");
    expect(cards).toHaveLength(6);
    expect([...cards].map((c) => c.querySelector("c-pc-icon").name)).toEqual([
      "layers",
      "dollar",
      "refresh",
      "megaphone",
      "grid",
      "bolt"
    ]);
    expect(cards[5].querySelector("h3").textContent).toBe(
      "Slalom-only accelerators"
    );
    expect(root.querySelector(".pc-solution__cta a").getAttribute("href")).toBe(
      "/partnercloud/approach"
    );
  });
});
