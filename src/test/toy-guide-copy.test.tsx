import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ToyGuidePage } from "@/components/toy-guide-page";
import { guideOffer } from "@/lib/toy-guide-copy";

describe("Toy guide sales copy", () => {
  it("renders the complete offer with six bonuses, ten FAQ entries and correct checkout", () => {
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(<ToyGuidePage />);
    expect(root.querySelector("h1")?.textContent).toContain("+300 Brinquedos criativos");
    expect(root.querySelectorAll(".tg-bonus")).toHaveLength(6);
    expect(root.querySelectorAll("details")).toHaveLength(10);
    expect(root.textContent).toContain("Laura Lemos");
    expect(root.textContent).toContain("Garantia de 7 Dias");
    expect(root.textContent).toContain("R$89,00");
    expect(root.textContent).not.toMatch(/Cifras Kids|cantigas|violão|R\$90,00/);
    for (const link of root.querySelectorAll<HTMLAnchorElement>(".tg-cta")) {
      expect(["#oferta", guideOffer.checkout]).toContain(link.getAttribute("href"));
    }
  });
});
