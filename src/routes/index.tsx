import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/features/finance/FinanceApp";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fluxo • Financeiro Low Ticket" },
      {
        name: "description",
        content: "Controle financeiro da operação: receitas, custos, resultados e metas.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FinanceApp,
});
