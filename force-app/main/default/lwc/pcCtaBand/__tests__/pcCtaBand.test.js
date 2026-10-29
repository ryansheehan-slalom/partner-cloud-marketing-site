import { createElement } from "lwc";
import PcCtaBand from "c/pcCtaBand";

describe("c-pc-cta-band", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-cta-band", { is: PcCtaBand });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders the band copy, buttons, and Jake's contact card", () => {
    const root = render().shadowRoot;
    expect(root.querySelector("h2").textContent.trim()).toBe(
      "Ready to modernize your partner experience?"
    );
    const buttons = root.querySelectorAll(".pc-cta-band__btns a");
    expect(buttons[0].textContent).toContain("Email Jake");
    expect(buttons[0].getAttribute("href")).toBe(
      "mailto:jake.seibert@slalom.com"
    );
    expect(buttons[1].getAttribute("href")).toBe(
      "https://slalom.com/salesforce"
    );
    expect(root.querySelector(".pc-contact-card__name").textContent).toBe(
      "Jake Seibert"
    );
    expect(
      root.querySelector(".pc-contact-card__avatar").getAttribute("src")
    ).toBe("pcContactAvatar");
    expect(root.querySelectorAll(".pc-cta-band__orb")).toHaveLength(2);
  });

  it("reflects configured contact details", () => {
    const root = render({
      contactName: "Ada Lovelace",
      contactEmail: "ada@slalom.com"
    }).shadowRoot;
    const email = root.querySelector(".pc-cta-band__btns a");
    expect(email.textContent).toContain("Email Ada");
    expect(email.getAttribute("href")).toBe("mailto:ada@slalom.com");
    expect(root.querySelector(".pc-contact-card__email").textContent).toBe(
      "ada@slalom.com"
    );
  });
});
