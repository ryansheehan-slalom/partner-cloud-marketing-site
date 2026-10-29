import { createElement } from "lwc";
import PcArticleCard from "c/pcArticleCard";
import { getArticleBySlug } from "c/pcArticleData";

describe("c-pc-article-card", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props) {
    const el = createElement("c-pc-article-card", { is: PcArticleCard });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders a linked card with cover, tag, long date and excerpt", () => {
    const article = getArticleBySlug("proving-partner-roi");
    const root = render({ article }).shadowRoot;
    expect(root.querySelector("a").getAttribute("href")).toBe(article.href);
    expect(root.querySelector(".pc-article__img").getAttribute("src")).toBe(
      article.imageUrl
    );
    expect(root.querySelector(".pc-tag").textContent).toBe("Data");
    expect(root.querySelector(".pc-article__date").textContent).toBe(
      "Jul 28, 2026"
    );
    expect(root.querySelector("h3").textContent).toBe(article.title);
    expect(root.querySelector(".pc-author")).toBeNull();
  });

  it("shows short meta and author initials when requested", () => {
    const article = getArticleBySlug("proving-partner-roi");
    const root = render({
      article,
      showAuthor: true,
      metaFormat: "short"
    }).shadowRoot;
    expect(root.querySelector(".pc-article__date").textContent).toBe(
      "Jul 28 · 5 min"
    );
    expect(root.querySelector("span.pc-author__avatar").textContent).toBe("RS");
    expect(root.querySelector(".pc-author__name").textContent).toBe(
      "Riya Shah"
    );
  });

  it("uses the avatar image when the author has one", () => {
    const article = getArticleBySlug("designing-partner-journeys");
    const root = render({ article, showAuthor: true }).shadowRoot;
    expect(
      root.querySelector("img.pc-author__avatar").getAttribute("src")
    ).toBe("pcContactAvatar");
  });
});
