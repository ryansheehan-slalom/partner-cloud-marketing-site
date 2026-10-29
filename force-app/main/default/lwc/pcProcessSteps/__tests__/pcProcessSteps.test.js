import { createElement } from "lwc";
import PcProcessSteps from "c/pcProcessSteps";

describe("c-pc-process-steps", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders four ordered phases with durations and deliverables", () => {
    const el = createElement("c-pc-process-steps", { is: PcProcessSteps });
    document.body.appendChild(el);
    const root = el.shadowRoot;

    expect(root.querySelector("section").getAttribute("tabindex")).toBe("-1");
    expect(root.querySelector("ol.pc-steps")).not.toBeNull();
    const steps = root.querySelectorAll(".pc-step");
    expect(steps).toHaveLength(4);
    expect(
      [...steps].map((s) =>
        s
          .querySelector(".pc-step__title")
          .textContent.replace(/\s+/g, " ")
          .trim()
      )
    ).toEqual([
      "Phase 1: Assess",
      "Phase 2: Design",
      "Phase 3: Build",
      "Phase 4: Optimize"
    ]);
    expect(steps[3].querySelector(".pc-step__duration").textContent).toBe(
      "Ongoing"
    );
    steps.forEach((step) => {
      expect(step.querySelectorAll(".pc-step__list li")).toHaveLength(3);
    });
  });
});
