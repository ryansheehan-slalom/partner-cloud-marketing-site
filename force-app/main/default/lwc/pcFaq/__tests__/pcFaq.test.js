import { createElement } from "lwc";
import PcFaq from "c/pcFaq";

const flushPromises = () => Promise.resolve();

describe("c-pc-faq", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render() {
    const el = createElement("c-pc-faq", { is: PcFaq });
    document.body.appendChild(el);
    return el;
  }

  it("renders collapsed questions wired to their panels", () => {
    const root = render().shadowRoot;
    const buttons = root.querySelectorAll(".pc-faq__btn");
    expect(buttons).toHaveLength(5);
    buttons.forEach((button) => {
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(button.getAttribute("aria-controls")).toBeTruthy();
    });
    root.querySelectorAll(".pc-faq__panel").forEach((panel) => {
      expect(panel.hidden).toBe(true);
      expect(panel.getAttribute("role")).toBe("region");
    });
    expect(root.querySelector(".pc-faq__cta").getAttribute("href")).toBe(
      "/partnercloud/#connect"
    );
  });

  it("toggles panels independently", async () => {
    const root = render().shadowRoot;
    const [first, second] = root.querySelectorAll(".pc-faq__btn");
    const panels = () => root.querySelectorAll(".pc-faq__panel");

    first.click();
    await flushPromises();
    expect(first.getAttribute("aria-expanded")).toBe("true");
    expect(panels()[0].hidden).toBe(false);
    expect(panels()[0].textContent).toContain("12–16 weeks");

    second.click();
    await flushPromises();
    expect(panels()[0].hidden).toBe(false);
    expect(panels()[1].hidden).toBe(false);

    first.click();
    await flushPromises();
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(panels()[0].hidden).toBe(true);
  });
});
