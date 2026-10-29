import {
  ARTICLE_TAGS,
  getArticleBySlug,
  getArticles,
  getFeaturedArticle,
  getLatestArticles,
  getRelatedArticles
} from "c/pcArticleData";

describe("c-pc-article-data", () => {
  it("returns all articles newest first with decorated fields", () => {
    const articles = getArticles();
    expect(articles).toHaveLength(8);
    const dates = articles.map((a) => a.date);
    expect([...dates].sort().reverse()).toEqual(dates);

    const first = articles[0];
    expect(first.dateLabel).toBe("Aug 12, 2026");
    expect(first.metaShort).toBe("Aug 12 · 6 min");
    expect(first.href).toBe(
      "/partnercloud/insight-detail?article=designing-partner-journeys"
    );
    expect(first.imageUrl).toContain("journeys.svg");
    expect(first.author.name).toBe("Jake Seibert");
    expect(first.author.hasEmail).toBe(true);
  });

  it("uses only known tags", () => {
    getArticles().forEach((a) => expect(ARTICLE_TAGS).toContain(a.tag));
  });

  it("returns the latest N and the featured article", () => {
    expect(getLatestArticles(3).map((a) => a.slug)).toEqual([
      "designing-partner-journeys",
      "proving-partner-roi",
      "slack-and-salesforce"
    ]);
    expect(getFeaturedArticle().featured).toBe(true);
  });

  it("decorates body blocks with type flags and unique keys", () => {
    const body = getArticleBySlug("designing-partner-journeys").body;
    expect(body[0].isLead).toBe(true);
    expect(body.some((b) => b.isCallout && b.items.length === 3)).toBe(true);
    expect(body.find((b) => b.isFigure).imageUrl).toContain("journey-map.svg");
    const keys = body.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("returns null for unknown slugs", () => {
    expect(getArticleBySlug("nope")).toBeNull();
  });

  it("prefers same-tag related articles and excludes the current one", () => {
    const related = getRelatedArticles("proving-partner-roi", 3);
    expect(related).toHaveLength(3);
    expect(related[0].slug).toBe("forecasting-incentive-spend");
    expect(related.map((a) => a.slug)).not.toContain("proving-partner-roi");
  });

  it("returns fresh copies so callers cannot mutate shared data", () => {
    getArticles()[0].title = "changed";
    expect(getArticles()[0].title).not.toBe("changed");
  });
});
