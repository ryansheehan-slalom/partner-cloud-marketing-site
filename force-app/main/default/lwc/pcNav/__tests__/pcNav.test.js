import {
  ROUTES,
  anchorHref,
  articleHref,
  currentPageAnchorHref,
  buildHref,
  getBasePath,
  navigateToAnchor,
  registerAnchor,
  unregisterAnchor
} from "c/pcNav";

function clickEvent(anchor) {
  return {
    currentTarget: { dataset: { anchor } },
    preventDefault: jest.fn()
  };
}

describe("c-pc-nav", () => {
  it("prefixes internal routes with the community base path", () => {
    expect(getBasePath()).toBe("/partnercloud");
    expect(buildHref(ROUTES.insights)).toBe("/partnercloud/insights");
    expect(buildHref("insights")).toBe("/partnercloud/insights");
    expect(buildHref()).toBe("/partnercloud/");
  });

  it("passes external, mailto and hash links through untouched", () => {
    expect(buildHref("https://slalom.com")).toBe("https://slalom.com");
    expect(buildHref("mailto:a@b.com")).toBe("mailto:a@b.com");
    expect(buildHref("#connect")).toBe("#connect");
  });

  it("builds anchor and article hrefs", () => {
    expect(anchorHref("connect")).toBe("/partnercloud/#connect");
    expect(anchorHref("newsletter", ROUTES.insights)).toBe(
      "/partnercloud/insights#newsletter"
    );
    expect(currentPageAnchorHref("faq")).toBe(
      `${window.location.pathname}#faq`
    );
    expect(articleHref("a b")).toBe(
      "/partnercloud/insight-detail?article=a%20b"
    );
  });

  it("scrolls to a registered anchor and prevents default navigation", () => {
    const section = document.createElement("section");
    section.scrollIntoView = jest.fn();
    registerAnchor("connect", section);

    const event = clickEvent("connect");
    expect(navigateToAnchor(event)).toBe(true);
    expect(section.scrollIntoView).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();

    unregisterAnchor("connect", section);
    const second = clickEvent("connect");
    expect(navigateToAnchor(second)).toBe(false);
    expect(second.preventDefault).not.toHaveBeenCalled();
  });

  it("moves focus to the target section after scrolling", () => {
    const section = document.createElement("section");
    section.tabIndex = -1;
    section.scrollIntoView = jest.fn();
    document.body.appendChild(section);
    registerAnchor("solution", section);

    navigateToAnchor(clickEvent("solution"));
    expect(document.activeElement).toBe(section);

    unregisterAnchor("solution", section);
    section.remove();
  });

  it("lets the browser follow the link when the anchor is not on the page", () => {
    const event = clickEvent("missing");
    expect(navigateToAnchor(event)).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
