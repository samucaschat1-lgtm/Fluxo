import { createFileRoute } from "@tanstack/react-router";
import { ReferencePage } from "@/components/reference-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Brinquedos Criativos | +300 atividades para crianças" },
    { name: "description", content: "Mais de 300 ideias de brinquedos e atividades criativas com materiais simples para brincar e aprender em família." },
    { property: "og:title", content: "Brinquedos Criativos | +300 atividades para crianças" },
    { property: "og:description", content: "Mais de 300 atividades e brinquedos criativos com materiais do dia a dia. Acesso digital ao material." },
  ] }),
  component: ReferencePage,
});
