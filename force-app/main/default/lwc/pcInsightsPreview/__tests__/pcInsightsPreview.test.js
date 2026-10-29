import { createElement } from "lwc";
import PcInsightsPreview from "c/pcInsightsPreview";

describe("c-pc-insights-preview", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-insights-preview", {
      is: PcInsightsPreview
    });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("shows the latest three articles and a See all insights link", () => {
    const root = render().shadowRoot;
    const cards = root.querySelectorAll("c-pc-article-card");
    expect(cards).toHaveLength(3);
    expect(cards[0].article.slug).toBe("designing-partner-journeys");
    expect(root.querySelector(".pc-insights-cta a").getAttribute("href")).toBe(
      "/partnercloud/insights"
    );
    expect(root.querySelector("section").classList).toContain(
      "pc-section--white"
    );
  });

  it("respects a configured article count and ignores invalid values", () => {
    expect(
      render({ articleCount: 2 }).shadowRoot.querySelectorAll(
        "c-pc-article-card"
      )
    ).toHaveLength(2);
    expect(
      render({ articleCount: 0 }).shadowRoot.querySelectorAll(
        "c-pc-article-card"
      )
    ).toHaveLength(3);
  });
});
