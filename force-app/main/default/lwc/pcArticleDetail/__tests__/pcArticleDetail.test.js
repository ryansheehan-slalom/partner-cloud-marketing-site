import { createElement } from "lwc";
import PcArticleDetail from "c/pcArticleDetail";
import { CurrentPageReference } from "lightning/navigation";

// eslint-disable-next-line @lwc/lwc/no-async-operation
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("c-pc-article-detail", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-article-detail", { is: PcArticleDetail });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("shows the featured article when no slug is provided", () => {
    const root = render().shadowRoot;
    expect(root.querySelector("h1").textContent).toBe(
      "Designing partner journeys that actually convert"
    );
    expect(root.querySelector(".pc-crumb a").getAttribute("href")).toBe(
      "/partnercloud/insights"
    );
    expect(root.querySelector(".pc-prose__lead")).not.toBeNull();
    expect(root.querySelector(".pc-quote")).not.toBeNull();
    const items = root.querySelectorAll(".pc-callout__list li");
    expect(items).toHaveLength(3);
    expect(items[0].textContent.replace(/\s+/g, " ")).toBe(
      "Days 0–30: One-click deal registration and a guided first win — remove pipeline friction immediately."
    );
    expect(root.querySelector(".pc-author__meta span").textContent).toBe(
      "Senior Principal, Partner Cloud · Aug 12, 2026 · 6 min read"
    );
    expect(root.querySelector(".pc-figure__img").getAttribute("src")).toContain(
      "journey-map.svg"
    );
    expect(root.querySelector(".pc-biocard__link").getAttribute("href")).toBe(
      "mailto:jake.seibert@slalom.com"
    );
    expect(root.querySelectorAll("c-pc-article-card")).toHaveLength(3);
  });

  it("renders the article named in the URL", async () => {
    const el = render();
    CurrentPageReference.emit({ state: { article: "proving-partner-roi" } });
    await flushPromises();
    const root = el.shadowRoot;
    expect(root.querySelector("h1").textContent).toBe(
      "Proving partner ROI with a 360° revenue view"
    );
    expect(root.querySelector(".pc-biocard__link").getAttribute("href")).toBe(
      "/partnercloud/#connect"
    );
    const related = [...root.querySelectorAll("c-pc-article-card")].map(
      (c) => c.article.slug
    );
    expect(related).not.toContain("proving-partner-roi");
  });

  it("falls back to the configured slug and shows not-found for unknown slugs", async () => {
    const el = render({ articleSlug: "tiering-partners-understand" });
    expect(el.shadowRoot.querySelector("h1").textContent).toBe(
      "Tiering that partners actually understand"
    );
    CurrentPageReference.emit({ state: { article: "missing" } });
    await flushPromises();
    expect(el.shadowRoot.querySelector("h1").textContent).toBe(
      "We couldn't find that article."
    );
  });

  it("builds share links and copies the article URL", async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true
    });
    const root = render().shadowRoot;

    const [, linkedIn, email] = root.querySelectorAll(".pc-share__btn");
    expect(linkedIn.getAttribute("href")).toContain(
      "linkedin.com/sharing/share-offsite/?url="
    );
    expect(email.getAttribute("href")).toMatch(/^mailto:\?subject=Designing/);

    root.querySelector("button.pc-share__btn").click();
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/partnercloud/insight-detail?article=designing-partner-journeys`
    );
    expect(root.querySelector(".pc-share__status").textContent).toBe(
      "Link copied"
    );
  });
});
