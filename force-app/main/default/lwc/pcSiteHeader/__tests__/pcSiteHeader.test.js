import { createElement } from "lwc";
import PcSiteHeader from "c/pcSiteHeader";

const flushPromises = () => Promise.resolve();

describe("c-pc-site-header", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-site-header", { is: PcSiteHeader });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders base-path aware nav links and the demo CTA", () => {
    const el = render();
    const links = [...el.shadowRoot.querySelectorAll(".pc-nav__link")];
    expect(links.map((a) => a.textContent.trim().split(",")[0])).toEqual([
      "Approach",
      "Insights",
      "About",
      "Connect"
    ]);
    expect(links[0].getAttribute("href")).toBe("/partnercloud/approach");
    expect(links[1].getAttribute("href")).toBe("/partnercloud/insights");
    expect(links[2].getAttribute("target")).toBe("_blank");
    expect(links[2].textContent).toBe("About, opens in a new tab");
    expect(links[3].getAttribute("href")).toBe("/partnercloud/#connect");
    expect(links[3].dataset.anchor).toBe("connect");

    const cta = el.shadowRoot.querySelector(".pc-header__cta");
    expect(cta.getAttribute("href")).toBe(
      "https://htf-poc-ai.my.site.com/partners/"
    );
    expect(el.shadowRoot.querySelector(".pc-logo").getAttribute("href")).toBe(
      "/partnercloud/"
    );
  });

  it("uses a configured demo URL", () => {
    const el = render({ demoUrl: "https://example.com/demo" });
    expect(
      el.shadowRoot.querySelector(".pc-header__cta").getAttribute("href")
    ).toBe("https://example.com/demo");
  });

  it("toggles the mobile menu and closes it with Escape", async () => {
    const el = render();
    const button = el.shadowRoot.querySelector(".pc-menu-btn");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(el.shadowRoot.querySelector(".pc-mobile-menu")).toBeNull();

    button.click();
    await flushPromises();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Close menu");
    expect(
      el.shadowRoot.querySelectorAll(".pc-mobile-menu__link")
    ).toHaveLength(4);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();
    expect(el.shadowRoot.querySelector(".pc-mobile-menu")).toBeNull();
  });

  it("returns focus to the menu button when Escape closes the menu from inside it", async () => {
    const el = render();
    const button = el.shadowRoot.querySelector(".pc-menu-btn");
    button.click();
    await flushPromises();

    el.shadowRoot.querySelector(".pc-mobile-menu__link").focus();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();

    expect(el.shadowRoot.querySelector(".pc-mobile-menu")).toBeNull();
    expect(el.shadowRoot.activeElement).toBe(button);
  });

  it("injects the Google Fonts stylesheet once", () => {
    render();
    render();
    const links = document.head.querySelectorAll("link#pc-google-fonts");
    expect(links).toHaveLength(1);
    expect(links[0].href).toContain("fonts.googleapis.com");
  });
});
