import { createElement } from "lwc";
import PcIcon from "c/pcIcon";
import { ICON_NAMES, getIcon } from "c/pcIconLibrary";

describe("c-pc-icon", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  function render(props) {
    const el = createElement("c-pc-icon", { is: PcIcon });
    Object.assign(el, props);
    document.body.appendChild(el);
    return el;
  }

  it("renders stroke paths for a known icon", () => {
    const el = render({ name: "doc", size: 22 });
    const svg = el.shadowRoot.querySelector("svg");
    expect(svg.getAttribute("width")).toBe("22");
    expect(svg.getAttribute("fill")).toBe("none");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(el.shadowRoot.querySelectorAll("path")).toHaveLength(4);
  });

  it("renders filled icons with no stroke", () => {
    const el = render({ name: "linkedin" });
    const svg = el.shadowRoot.querySelector("svg");
    expect(svg.getAttribute("fill")).toBe("currentColor");
    expect(svg.getAttribute("stroke")).toBe("none");
  });

  it("renders nothing for an unknown icon", () => {
    const el = render({ name: "does-not-exist" });
    expect(el.shadowRoot.querySelectorAll("path")).toHaveLength(0);
  });

  it("has path data for every icon the components use", () => {
    [
      "doc",
      "layout",
      "chart",
      "shield",
      "spark",
      "users",
      "layers",
      "dollar",
      "refresh",
      "megaphone",
      "grid",
      "bolt",
      "handshake",
      "check",
      "arrowRight",
      "external",
      "link",
      "linkedin",
      "mail",
      "menu",
      "close"
    ].forEach((name) => {
      expect(ICON_NAMES).toContain(name);
      expect(getIcon(name).paths.length).toBeGreaterThan(0);
    });
  });
});
