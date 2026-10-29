import { createElement } from "lwc";
import PcSiteFooter from "c/pcSiteFooter";

describe("c-pc-site-footer", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the brand block, three link columns, and legal strip", () => {
    const el = createElement("c-pc-site-footer", { is: PcSiteFooter });
    document.body.appendChild(el);
    const root = el.shadowRoot;

    expect(root.querySelector(".pc-footer__tagline").textContent).toBe(
      "Salesforce Partner Cloud, built by Slalom."
    );
    const heads = [...root.querySelectorAll(".pc-footer__head")].map(
      (h) => h.textContent
    );
    expect(heads).toEqual(["Solutions", "Insights", "Company"]);

    const hrefs = [...root.querySelectorAll(".pc-footer__link")].map((a) =>
      a.getAttribute("href")
    );
    expect(hrefs).toContain("/partnercloud/approach#process");
    expect(hrefs).toContain("/partnercloud/approach#engagement");
    expect(hrefs).toContain("/partnercloud/approach#accelerators");
    expect(hrefs).toContain("/partnercloud/insights");
    expect(hrefs).toContain("/partnercloud/insights#newsletter");
    expect(hrefs).toContain("mailto:jake.seibert@slalom.com");

    expect(root.querySelector(".pc-footer__bot").textContent).toContain(
      `© ${new Date().getFullYear()} Slalom`
    );
    expect(root.querySelectorAll(".pc-footer__mini a")).toHaveLength(3);
  });
});
