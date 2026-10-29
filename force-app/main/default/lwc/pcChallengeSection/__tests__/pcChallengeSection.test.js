import { createElement } from "lwc";
import PcChallengeSection from "c/pcChallengeSection";

const flushPromises = () => Promise.resolve();

describe("c-pc-challenge-section", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders six challenges, the closing note, and the art panel", async () => {
    const el = createElement("c-pc-challenge-section", {
      is: PcChallengeSection
    });
    document.body.appendChild(el);
    const root = el.shadowRoot;

    expect(root.querySelector("h2").textContent.trim()).toBe(
      "Partner experiences that get in the way of growth."
    );
    const items = root.querySelectorAll(".pc-feature__item");
    expect(items).toHaveLength(6);
    expect(items[0].querySelector("strong").textContent).toBe(
      "Frustrating deal registration"
    );
    expect(root.querySelector(".pc-feature__note")).not.toBeNull();
    expect(root.querySelector(".pc-feature__img").getAttribute("src")).toBe(
      "pcChallengeArt"
    );
    expect(root.querySelector(".pc-feature").classList).not.toContain(
      "pc-feature--rev"
    );

    el.reversed = true;
    await flushPromises();
    expect(root.querySelector(".pc-feature").classList).toContain(
      "pc-feature--rev"
    );
  });
});
