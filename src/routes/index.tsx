import { createFileRoute } from "@tanstack/react-router";
import { ToyGuidePage } from "@/components/toy-guide-page";

const title = "Guia de Brinquedos Caseiros | +300 Brinquedos criativos";
const description = "Mais de 300 brinquedos criativos em PDF e mais de 100 vídeos passo a passo para brincar com o que você já tem em casa. Acesso vitalício por R$10.";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
    links: [{ rel: "stylesheet", href: "/reference/toy-guide.css" }],
  }),
  component: ToyGuidePage,
});
