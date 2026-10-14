import { useEffect, useRef, useState } from "react";

/** Mount the supplied site's original components with their own React runtime.
 * The host app retains routing/build integration without restyling the snapshot.
 * Tracking scripts from the downloaded HTML are deliberately not loaded.
 */
export function ReferencePage() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let unmount: (() => void) | undefined;
    const moduleUrl = "/reference/site.js";
    import(/* @vite-ignore */ moduleUrl)
      .then((module) => {
        if (!cancelled && container.current) {
          unmount = module.mountReferencePage(container.current);
        }
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; unmount?.(); };
  }, []);
  return <>
    <div ref={container} />
    {failed && <p role="alert">Não foi possível carregar a página. <a href="/">Tentar novamente</a></p>}
  </>;
}
