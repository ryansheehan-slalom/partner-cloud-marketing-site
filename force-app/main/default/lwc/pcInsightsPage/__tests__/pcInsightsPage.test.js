import { createElement } from "lwc";
import PcInsightsPage from "c/pcInsightsPage";

const flushPromises = () => Promise.resolve();

describe("c-pc-insights-page", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render() {
    const el = createElement("c-pc-insights-page", { is: PcInsightsPage });
    document.body.appendChild(el);
    return el;
  }

  const cardSlugs = (root) =>
    [...root.querySelectorAll("c-pc-article-card")].map((c) => c.article.slug);

  it("shows the featured article and the first page of the grid", () => {
    const root = render().shadowRoot;
    expect(root.querySelector(".pc-featured__title").textContent).toBe(
      "Designing partner journeys that actually convert"
    );
    const slugs = cardSlugs(root);
    expect(slugs).toHaveLength(6);
    expect(slugs).not.toContain("designing-partner-journeys");
    expect(root.querySelector(".pc-loadmore button")).not.toBeNull();
  });

  it("loads more articles and hides the button when exhausted", async () => {
    const root = render().shadowRoot;
    root.querySelector(".pc-loadmore button").click();
    await flushPromises();
    expect(cardSlugs(root)).toHaveLength(7);
    expect(root.querySelector(".pc-loadmore")).toBeNull();
  });

  it("filters by category, hides the featured block, and updates aria-pressed", async () => {
    const root = render().shadowRoot;
    const dataTab = [...root.querySelectorAll(".pc-tab")].find(
      (b) => b.textContent.trim() === "Data"
    );
    dataTab.click();
    await flushPromises();

    expect(dataTab.getAttribute("aria-pressed")).toBe("true");
    expect(root.querySelector(".pc-featured")).toBeNull();
    expect(cardSlugs(root)).toEqual([
      "proving-partner-roi",
      "forecasting-incentive-spend"
    ]);

    const strategyTab = [...root.querySelectorAll(".pc-tab")].find(
      (b) => b.textContent.trim() === "Strategy"
    );
    strategyTab.click();
    await flushPromises();
    expect(cardSlugs(root)).toContain("designing-partner-journeys");
  });

  it("validates the newsletter email and confirms a valid signup", async () => {
    const root = render().shadowRoot;
    const input = root.querySelector(".pc-news__input");
    const form = root.querySelector(".pc-news__form");

    input.value = "not-an-email";
    input.dispatchEvent(new CustomEvent("input"));
    form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
    await flushPromises();
    expect(root.querySelector(".pc-news__error").textContent).toBe(
      "Please enter a valid email address."
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");

    input.value = "partner@company.com";
    input.dispatchEvent(new CustomEvent("input"));
    form.dispatchEvent(new CustomEvent("submit", { cancelable: true }));
    await flushPromises();
    expect(root.querySelector(".pc-news__form")).toBeNull();
    expect(root.querySelector(".pc-news__success").textContent).toContain(
      "on the list"
    );
  });
});
