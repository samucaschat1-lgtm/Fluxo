import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/$")({
  component: () => (
    <main style={{ padding: 48 }}>
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao financeiro</Link>
    </main>
  ),
});
