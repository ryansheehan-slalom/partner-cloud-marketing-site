import { createElement } from "lwc";
import PcPageHero from "c/pcPageHero";
import { registerAnchor, unregisterAnchor } from "c/pcNav";

describe("c-pc-page-hero", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-page-hero", { is: PcPageHero });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders breadcrumb, eyebrow, title with accent, and lede", () => {
    const root = render({
      eyebrow: "Our Approach",
      title: "From partner strategy to",
      titleAccent: "partner behavior.",
      lede: "Lede copy",
      crumbLabel: "Approach"
    }).shadowRoot;

    const crumbs = root.querySelectorAll(".pc-crumb li");
    expect(crumbs[0].querySelector("a").getAttribute("href")).toBe(
      "/partnercloud/"
    );
    expect(crumbs[1].textContent).toBe("Approach");
    expect(crumbs[1].getAttribute("aria-current")).toBe("page");
    expect(root.querySelector(".pc-eyebrow").textContent).toBe("Our Approach");
    expect(
      root.querySelector("h1").textContent.replace(/\s+/g, " ").trim()
    ).toBe("From partner strategy to partner behavior.");
    expect(root.querySelector(".pc-accent").textContent).toBe(
      "partner behavior."
    );
    expect(root.querySelector(".pc-page-hero__lede").textContent).toBe(
      "Lede copy"
    );
    expect(root.querySelector(".pc-page-hero__cta")).toBeNull();
  });

  it("hides the breadcrumb on request and falls back to the eyebrow for its label", () => {
    expect(
      render({ hideBreadcrumb: true, title: "T" }).shadowRoot.querySelector(
        ".pc-crumb"
      )
    ).toBeNull();
    const root = render({ eyebrow: "Insights", title: "T" }).shadowRoot;
    expect(root.querySelector(".pc-crumb__current").textContent).toBe(
      "Insights"
    );
  });

  it("builds CTAs for site paths and in-page anchors", () => {
    const section = document.createElement("section");
    section.scrollIntoView = jest.fn();
    registerAnchor("process", section);

    const root = render({
      title: "T",
      primaryLabel: "See how we work",
      primaryHref: "#process",
      secondaryLabel: "Insights",
      secondaryHref: "/insights"
    }).shadowRoot;
    const [primary, secondary] = root.querySelectorAll(".pc-page-hero__cta a");
    expect(primary.getAttribute("href")).toBe(
      `${window.location.pathname}#process`
    );
    expect(primary.dataset.anchor).toBe("process");
    expect(secondary.getAttribute("href")).toBe("/partnercloud/insights");
    expect(secondary.dataset.anchor).toBeUndefined();

    primary.click();
    expect(section.scrollIntoView).toHaveBeenCalled();
    unregisterAnchor("process", section);
  });
});
