import { useEffect, useRef, useState } from "react";

/** Preview images are loaded directly from the ZIP committed to /public.
 * Extracting only the required WebP files avoids changing other site assets.
 */
async function loadProjectImages(): Promise<string[]> {
  const response = await fetch("/carrossel_10_projetos_brinquedoskids.zip");
  if (!response.ok) throw new Error("Arquivo ZIP do carrossel indisponível");
  const buffer = await response.arrayBuffer();
  const data = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const images: string[] = Array(10).fill("");
  const decoder = new TextDecoder();
  let offset = 0;
  while (offset + 30 <= buffer.byteLength && data.getUint32(offset, true) === 0x04034b50) {
    const method = data.getUint16(offset + 8, true);
    const size = data.getUint32(offset + 18, true);
    const nameLength = data.getUint16(offset + 26, true);
    const extraLength = data.getUint16(offset + 28, true);
    const filename = decoder.decode(bytes.subarray(offset + 30, offset + 30 + nameLength));
    const start = offset + 30 + nameLength + extraLength;
    const match = filename.match(/(?:^|\/)projeto-(\d{2})\.webp$/);
    if (match) {
      const index = Number(match[1]) - 1;
      if (index >= 0 && index < images.length) {
        const compressed = bytes.slice(start, start + size);
        let extracted: Blob;
        if (method === 0) {
          extracted = new Blob([compressed], { type: "image/webp" });
        } else if (method === 8) {
          const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
          extracted = new Blob([await new Response(stream).arrayBuffer()], { type: "image/webp" });
        } else {
          throw new Error("Compressão ZIP não suportada: " + method);
        }
        images[index] = URL.createObjectURL(extracted);
      }
    }
    offset = start + size;
  }
  if (images.some((src) => !src)) {
    images.forEach((src) => { if (src) URL.revokeObjectURL(src); });
    throw new Error("O ZIP não contém as dez prévias esperadas");
  }
  return images;
}

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
        img.src = previews[rowIndex * 5 + (n % 5)];
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
    let objectUrls: string[] = [];
    const moduleUrl = new URL("/reference/site.js", window.location.origin).href;

    Promise.all([import(/* @vite-ignore */ moduleUrl), loadProjectImages()])
      .then(([module, previews]) => {
        if (cancelled) {
          previews.forEach(URL.revokeObjectURL);
          return;
        }
        objectUrls = previews;
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
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, []);

  return <>
    <div ref={container} />
    {failed && <p role="alert">Não foi possível carregar a página. <a href="/">Tentar novamente</a></p>}
  </>;
}
