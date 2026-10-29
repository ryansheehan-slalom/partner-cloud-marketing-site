import { createElement } from "lwc";
import PcFeatureSplit from "c/pcFeatureSplit";
import { navigateToAnchor } from "c/pcNav";

const flushPromises = () => Promise.resolve();

describe("c-pc-feature-split", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-feature-split", { is: PcFeatureSplit });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders copy, non-empty bullets, art, and a base-path aware CTA", () => {
    const root = render({
      eyebrow: "Realized ROI",
      title: "See investment and revenue",
      body: "Body copy",
      bullet1: "One",
      bullet2: "",
      bullet3: "Three",
      image: "roi",
      ctaLabel: "Read more",
      ctaHref: "/insight-detail?article=proving-partner-roi"
    }).shadowRoot;

    expect(root.querySelector(".pc-eyebrow").textContent).toBe("Realized ROI");
    expect(root.querySelector("h2").textContent).toBe(
      "See investment and revenue"
    );
    expect(
      [...root.querySelectorAll(".pc-split__item")].map((li) =>
        li.textContent.trim()
      )
    ).toEqual(["One", "Three"]);
    const img = root.querySelector(".pc-split__img");
    expect(img.getAttribute("src")).toBe("pcInsightArt/roi.svg");
    expect(img.getAttribute("alt")).toContain("360-degree");
    expect(root.querySelector(".pc-split__media").classList).toContain(
      "pc-split__media--wide"
    );
    expect(root.querySelector(".pc-split__cta a").getAttribute("href")).toBe(
      "/partnercloud/insight-detail?article=proving-partner-roi"
    );
  });

  it("applies layout, background, and image fallbacks", () => {
    const root = render({
      title: "T",
      image: "nope",
      reversed: true,
      background: "surface"
    }).shadowRoot;
    expect(root.querySelector(".pc-split").classList).toContain(
      "pc-split--rev"
    );
    expect(root.querySelector("section").classList).toContain(
      "pc-section--surface"
    );
    expect(root.querySelector(".pc-split__img").getAttribute("src")).toBe(
      "pcInsightArt/roi.svg"
    );
    expect(root.querySelector(".pc-split__list")).toBeNull();
    expect(root.querySelector(".pc-split__cta")).toBeNull();

    const classic = render({
      title: "T",
      image: "challenge",
      background: "bogus"
    }).shadowRoot;
    expect(classic.querySelector(".pc-split__media").classList).not.toContain(
      "pc-split__media--wide"
    );
    expect(classic.querySelector("section").classList).toContain(
      "pc-section--white"
    );
  });

  it("registers its anchor id so in-page links can scroll to it", async () => {
    const scroll = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = scroll;
    const el = render({ title: "T", anchorId: "engagement" });
    await flushPromises();

    const event = {
      currentTarget: { dataset: { anchor: "engagement" } },
      preventDefault: jest.fn()
    };
    expect(navigateToAnchor(event)).toBe(true);
    expect(scroll).toHaveBeenCalled();

    document.body.removeChild(el);
    expect(navigateToAnchor({ ...event, preventDefault: jest.fn() })).toBe(
      false
    );
  });
});
