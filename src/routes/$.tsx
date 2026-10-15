import { createFileRoute } from "@tanstack/react-router";
import { LegacyReferencePage } from "@/components/legacy-reference-page";

// Preserve the original privacy, terms, refund and data-deletion pages on reload.
export const Route = createFileRoute("/$")({ head: () => ({ links: [{ rel: "stylesheet", href: "/reference/site.css" }] }), component: LegacyReferencePage });
