import { useEffect, useRef, useState } from "react";

/** Images uploaded to /public for the cardboard game and toy previews. */
const projectImages = [
  "Imagem do ChatGPT 15 de out. de 2026, 09_00_22.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_00_26.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_00_29.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_49-1.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_50-2.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_51-3.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_52-4.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_56-5.png",
].map((filename) => "/" + encodeURIComponent(filename));

function replacePreviewCarousel(root: HTMLElement, previews: string[]): boolean {
  const title = Array.from(root.querySelectorAll("h2")).find(
    (el) => el.textContent?.trim().toLowerCase() === "veja algumas páginas por dentro"
  );
  if (!title?.parentElement) return false;

  const tracks: HTMLElement[] = [];
  let sibling = title.parentElement.nextElementSibling;
  for (let i = 0; sibling && i < 5 && tracks.length < 2; i++, sibling = sibling.nextElementSibling) {
    const track = sibling.querySelector<HTMLElement>("div[style*='animation']");
    if (track && track.querySelectorAll("img").length >= 5) tracks.push(track);
  }
  if (tracks.length !== 2) return false;

  tracks.forEach((track, rowIndex) => {
    if (track.dataset.projectImagesApplied === "yes") return;
    const cards = Array.from(track.querySelectorAll<HTMLImageElement>("img"))
      .slice(0, 5).map((img) => img.parentElement).filter((card): card is HTMLElement => !!card);
    if (cards.length !== 5) return;
    const replacements = Array.from({ length: 10 }, (_, n) => {
      const card = cards[n % 5].cloneNode(true) as HTMLElement;
      const img = card.querySelector("img");
      if (img) {
        img.src = previews[(rowIndex * 5 + (n % 5)) % previews.length];
        img.alt = "Projeto criativo com materiais recicláveis " + (rowIndex * 5 + n % 5 + 1);
        img.loading = "lazy";
        img.decoding = "async";
      }
      return card;
    });
    track.replaceChildren(...replacements);
    track.dataset.projectImagesApplied = "yes";
  });
  return tracks.every((track) => track.dataset.projectImagesApplied === "yes");
}


const BASIC_CHECKOUT_URL = "https://ggcheckout.app/checkout/v5/37188bd2-cc3a-43d0-b695-cbd0fc08ba13";

/** Identify the Premium purchase control without affecting other purchase CTAs. */
function isPremiumPurchase(element: HTMLElement): boolean {
  const ownText = (element.textContent || "").toLowerCase();
  if (/premium/.test(ownText)) return true;
  // Plan buttons are usually inside their own plan card.
  let parent = element.parentElement;
  for (let depth = 0; parent && depth < 4; depth++, parent = parent.parentElement) {
    const headings = Array.from(parent.querySelectorAll("h2,h3,h4,h5,strong"));
    if (headings.some((heading) => /plano\\s*premium|premium/i.test(heading.textContent || "")) &&
        !headings.some((heading) => /plano\\s*b[aá]sico/i.test(heading.textContent || ""))) {
      return true;
    }
  }
  return false;
}

function isPurchaseCTA(element: HTMLElement): boolean {
  if (element.closest("[data-basic-sticky-cta]")) return false;
  const label = (element.textContent || "").replace(/\\s+/g, " ").trim();
  if (label.length > 180) return false;
  const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
  return /ggcheckout|cakto|checkout|#planos/i.test(href) ||
    /quero|acessar agora|garantir|comprar|começar agora|obter acesso|escolher plano|receber (meu|o) acesso|aproveitar oferta|aproveitar agora/i.test(label);
}

function redirectBasicCTAs(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>("a,button,[role='button']").forEach((element) => {
    if (!isPurchaseCTA(element) || isPremiumPurchase(element)) return;
    if (element instanceof HTMLAnchorElement) {
      if (element.href !== BASIC_CHECKOUT_URL) element.href = BASIC_CHECKOUT_URL;
    }
    element.dataset.basicCheckoutCta = "true";
  });
}

export function ReferencePage() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unmount: (() => void) | undefined;
    let observer: MutationObserver | undefined;
    const handlePurchaseClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !container.current) return;
      const button = target.closest<HTMLElement>("a,button,[role='button']");
      if (!button || !container.current.contains(button) ||
          !isPurchaseCTA(button) || isPremiumPurchase(button)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(BASIC_CHECKOUT_URL);
    };
    container.current?.addEventListener("click", handlePurchaseClick, true);
    const moduleUrl = new URL("/reference/site.js", window.location.origin).href;

    import(/* @vite-ignore */ moduleUrl)
      .then((module) => {
        if (cancelled) return;
        const previews = projectImages;
        if (container.current) {
          unmount = module.mountReferencePage(container.current);
          observer = new MutationObserver(() => {
            if (container.current) {
              replacePreviewCarousel(container.current, previews);
              redirectBasicCTAs(container.current);
            }
          });
          observer.observe(container.current, { childList: true, subtree: true });
          replacePreviewCarousel(container.current, previews);
          redirectBasicCTAs(container.current);
        }
      })
      .catch((error) => {
        console.error("Erro ao montar prévias do carrossel:", error);
        // Keep the original page functional even if the preview ZIP cannot load.
        if (cancelled) return;
        import(/* @vite-ignore */ moduleUrl)
          .then((module) => { if (!cancelled && container.current) unmount = module.mountReferencePage(container.current); })
          .catch(() => { if (!cancelled) setFailed(true); });
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      container.current?.removeEventListener("click", handlePurchaseClick, true);
      unmount?.();
    };
  }, []);

  return <>
    <div ref={container} />
    <div data-basic-sticky-cta className="basic-sticky-offer" role="region" aria-label="Oferta do Plano Básico">
      <div className="basic-sticky-offer__info">
        <span className="basic-sticky-offer__label">Plano Básico • Acesso digital</span>
        <strong>Por apenas R$ 10,00</strong>
      </div>
      <a href={BASIC_CHECKOUT_URL} className="basic-sticky-offer__button">QUERO GARANTIR <span aria-hidden="true">→</span></a>
    </div>
    {failed && <p role="alert">Não foi possível carregar a página. <a href="/">Tentar novamente</a></p>}
  </>;
}
