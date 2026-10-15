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

export function ReferencePage() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unmount: (() => void) | undefined;
    let observer: MutationObserver | undefined;
    const moduleUrl = new URL("/reference/site.js", window.location.origin).href;

    import(/* @vite-ignore */ moduleUrl)
      .then((module) => {
        if (cancelled) return;
        const previews = projectImages;
        if (container.current) {
          unmount = module.mountReferencePage(container.current);
          observer = new MutationObserver(() => {
            if (container.current && replacePreviewCarousel(container.current, previews)) observer?.disconnect();
          });
          observer.observe(container.current, { childList: true, subtree: true });
          if (replacePreviewCarousel(container.current, previews)) observer.disconnect();
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
      unmount?.();
    };
  }, []);

  return <>
    <div ref={container} />
    {failed && <p role="alert">Não foi possível carregar a página. <a href="/">Tentar novamente</a></p>}
  </>;
}
