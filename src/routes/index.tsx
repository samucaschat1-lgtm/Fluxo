import { createFileRoute } from "@tanstack/react-router";
import { ReferencePage } from "@/components/reference-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Cifras Kids | Cantigas infantis com cifras para violão" },
    { name: "description", content: "100 cantigas infantis com cifras para violão, com bônus de musicalização infantil para a criança começar de forma simples, divertida e progressiva." },
    { property: "og:title", content: "Cifras Kids | Cantigas infantis com cifras para violão" },
    { property: "og:description", content: "Material digital com 100 cantigas infantis em cifras, método de iniciação musical, atividades lúdicas e guia simplificado para crianças iniciantes." },
  ] }),
  component: ReferencePage,
});
