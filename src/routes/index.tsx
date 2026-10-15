import { createFileRoute } from "@tanstack/react-router";
import { ReferencePage } from "@/components/reference-page";

const siteTitle = "+300 Brinquedos Criativos | Brinquedos Kids";
const siteDescription = "Mais de 300 ideias de brinquedos criativos para fazer com materiais simples que você já tem em casa. Brinque, aprenda e crie momentos especiais com as crianças.";
const siteUrl = "https://brinquedoskids.vercel.app/";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: siteTitle },
      { name: "description", content: siteDescription },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Brinquedos Kids" },
      { property: "og:title", content: siteTitle },
      { property: "og:description", content: siteDescription },
      { property: "og:url", content: siteUrl },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: siteTitle },
      { name: "twitter:description", content: siteDescription },
    ],
    links: [{ rel: "canonical", href: siteUrl }],
  }),
  component: ReferencePage,
});
