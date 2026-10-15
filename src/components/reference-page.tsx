import "./kids-theme.css";
import { useEffect, useRef, useState } from "react";

function repairBonusImages(root: HTMLElement): void {
  root.querySelectorAll<HTMLImageElement>('img[alt^="Capa do Bônus"]').forEach((img) => {
    const match = img.alt.match(/Bônus\s+(\d+)/i);
    if (!match) return;
    const number = Number(match[1]);
    if (number < 1 || number > 6) return;
    const imageNumber = number === 1 ? 6 : number === 6 ? 1 : number;
    const path = "/bonus%20" + imageNumber + "%20kids.webp";
    if (img.getAttribute("src") !== path) img.setAttribute("src", path);
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
  // The Premium card is labeled "Plano Completo" in the current page.
  if (element.closest("#plano-completo")) return true;
  const ownText = (element.textContent || "").replace(/\s+/g, " ").trim();
  if (/premium|plano\s+completo/i.test(ownText)) return true;
  const card = element.closest("article");
  const heading = card?.querySelector("h2,h3,h4")?.textContent || "";
  return /premium|plano\s+completo/i.test(heading);
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
    const moduleUrl = new URL("/reference/site.js?v=red-bonuses-20261015", window.location.origin).href;

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
              optimizeImages(container.current);
            });
          });
          observer.observe(container.current, { childList: true, subtree: true });
          redirectBasicCTAs(container.current);
          optimizeImages(container.current);
        }
      })
      .catch((error) => {
        console.error("Erro ao montar prévias do carrossel:", error);
        // Keep the original page functional even if the preview ZIP cannot load.
        if (cancelled) return;
        import(/* @vite-ignore */ moduleUrl)
          .then((module) => { if (!cancelled && container.current) { unmount = module.mountReferencePage(container.current); redirectBasicCTAs(container.current); optimizeImages(container.current); } })
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
