import { createElement } from "lwc";
import PcStatBand from "c/pcStatBand";

describe("c-pc-stat-band", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props = {}) {
    const el = createElement("c-pc-stat-band", { is: PcStatBand });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders three default proof points as a description list", () => {
    const root = render().shadowRoot;
    expect(root.querySelector("h2").textContent).toBe(
      "Why Slalom for Partner Cloud"
    );
    const values = [...root.querySelectorAll("dd")].map((d) => d.textContent);
    expect(values).toEqual(["Summit", "360°", "30·60·90"]);
    expect(root.querySelectorAll("dt")).toHaveLength(3);
  });

  it("uses configured values and drops stats without a value", () => {
    const root = render({
      stat1Value: "42%",
      stat1Label: "Faster onboarding",
      stat3Value: ""
    }).shadowRoot;
    expect([...root.querySelectorAll("dd")].map((d) => d.textContent)).toEqual([
      "42%",
      "360°"
    ]);
    expect(root.querySelector("dt").textContent).toBe("Faster onboarding");
  });
});
