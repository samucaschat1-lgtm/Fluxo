import "./kids-theme.css";
import { useEffect, useRef, useState } from "react";

function repairBonusImages(root: HTMLElement): void {
  root.querySelectorAll<HTMLImageElement>('img[alt^="Capa do Bônus"]').forEach((img) => {
    const match = img.alt.match(/Bônus\s+(\d+)/i);
    if (!match) return;
    const number = Number(match[1]);
    if (number < 1 || number > 6) return;
    const path = "/bonus%20" + number + "%20kids.webp";
    if (img.getAttribute("src") !== path) img.setAttribute("src", path);
  });
}


const myCarouselImages = [
  "Imagem do ChatGPT 15 de out. de 2026, 09_00_22.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_00_26.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_00_29.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_49-1.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_50-2.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_51-3.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_52-4.png",
  "Imagem do ChatGPT 15 de out. de 2026, 09_05_56-5.png",
].map((name) => "/" + encodeURIComponent(name));

function restoreMyCarousel(root: HTMLElement): void {
  const heading = Array.from(root.querySelectorAll("h2")).find((el) =>
    /veja algumas p[aá]ginas por dentro/i.test(el.textContent || "")
  );
  if (!heading) return;
  // This is the single preview track directly following the section heading.
  let next = heading.parentElement?.nextElementSibling;
  let track: Element | null = null;
  for (let i = 0; next && i < 3; i++, next = next.nextElementSibling) {
    const candidate = next.querySelector("div[style*='animation']") || next;
    if (candidate.querySelectorAll("img").length >= 5) { track = candidate; break; }
  }
  if (!track) return;
  const imgs = Array.from(track.querySelectorAll<HTMLImageElement>("img"));
  imgs.forEach((img, i) => {
    const desired = myCarouselImages[i % myCarouselImages.length];
    if (img.dataset.myCarouselImage === desired) return;
    img.dataset.myCarouselImage = desired;
    img.src = desired;
    img.alt = "Brinquedo criativo - projeto " + ((i % myCarouselImages.length) + 1);
    img.loading = "lazy";
    img.decoding = "async";
  });
}

function optimizeImages(root: HTMLElement): void {
  repairBonusImages(root);
  const images = root.querySelectorAll<HTMLImageElement>("img");
  images.forEach((img, index) => {
    // Preserve the initial hero image as a high-priority request.
    if (index === 0) {
      img.loading = "eager";
      img.fetchPriority = "high";
    } else {
      img.loading = "lazy";
      img.fetchPriority = "low";
    }
    img.decoding = "async";
    if (!img.hasAttribute("alt")) img.alt = "";
    img.style.maxWidth = "100%";
  });
}

const BASIC_CHECKOUT_URL = "https://ggcheckout.app/checkout/v5/37188bd2-cc3a-43d0-b695-cbd0fc08ba13";
const PREMIUM_CHECKOUT_URL = "https://ggcheckout.app/checkout/v5/42268e97-5e14-4e72-b9de-63a1111c49ca";

/** Identify the Premium purchase control without affecting other purchase CTAs. */
function isPremiumPurchase(element: HTMLElement): boolean {
  const ownText = (element.textContent || "").toLowerCase();
  if (/premium/i.test(ownText)) return true;
  // Restrict matching to a plan card; avoid identifying the whole plans section.
  let parent = element.parentElement;
  for (let depth = 0; parent && depth < 5; depth++, parent = parent.parentElement) {
    const text = (parent.textContent || "").toLowerCase();
    const hasPremium = /(?:plano\s*)?premium/i.test(text);
    const hasBasic = /plano\s*b[aá]sico/i.test(text);
    if (hasPremium && !hasBasic && parent.querySelectorAll("a,button").length <= 3) return true;
    if (hasBasic) break;
  }
  return false;
}

function isPurchaseCTA(element: HTMLElement): boolean {
  const label = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (label.length > 180) return false;
  const href = element instanceof HTMLAnchorElement ? element.getAttribute("href") || "" : "";
  return /ggcheckout|cakto|checkout|#planos/i.test(href) ||
    /quero|acessar agora|garantir|comprar|começar agora|obter acesso|escolher plano|receber (meu|o) acesso|aproveitar oferta|aproveitar agora/i.test(label);
}

function redirectBasicCTAs(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>("a,button,[role='button']").forEach((element) => {
    if (!isPurchaseCTA(element)) return;
    const targetUrl = isPremiumPurchase(element) ? PREMIUM_CHECKOUT_URL : BASIC_CHECKOUT_URL;
    if (element instanceof HTMLAnchorElement) {
      if (element.getAttribute("href") !== targetUrl) element.setAttribute("href", targetUrl);
    }
    element.dataset.checkoutCta = "true";
  });
}

export function ReferencePage() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unmount: (() => void) | undefined;
    let observer: MutationObserver | undefined;
    let scheduled = false;
    const handlePurchaseClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !container.current) return;
      const button = target.closest<HTMLElement>("a,button,[role='button']");
      if (!button || !container.current.contains(button) ||
          !isPurchaseCTA(button)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(isPremiumPurchase(button) ? PREMIUM_CHECKOUT_URL : BASIC_CHECKOUT_URL);
    };
    container.current?.addEventListener("click", handlePurchaseClick, true);
    const moduleUrl = new URL("/reference/site.js", window.location.origin).href;

    import(/* @vite-ignore */ moduleUrl)
      .then((module) => {
        if (cancelled) return;
        if (container.current) {
          unmount = module.mountReferencePage(container.current);
          observer = new MutationObserver(() => {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => {
              scheduled = false;
              if (!container.current || cancelled) return;
              redirectBasicCTAs(container.current);
              restoreMyCarousel(container.current);
              optimizeImages(container.current);
            });
          });
          observer.observe(container.current, { childList: true, subtree: true });
          redirectBasicCTAs(container.current);
          restoreMyCarousel(container.current);
          optimizeImages(container.current);
        }
      })
      .catch((error) => {
        console.error("Erro ao montar prévias do carrossel:", error);
        // Keep the original page functional even if the preview ZIP cannot load.
        if (cancelled) return;
        import(/* @vite-ignore */ moduleUrl)
          .then((module) => { if (!cancelled && container.current) { unmount = module.mountReferencePage(container.current); redirectBasicCTAs(container.current); restoreMyCarousel(container.current); optimizeImages(container.current); } })
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
    <div ref={container} className="kids-page" />
    {failed && <p role="alert">Não foi possível carregar a página. <a href="/">Tentar novamente</a></p>}
  </>;
}
