import { createFileRoute } from "@tanstack/react-router";
import { ReferencePage } from "@/components/reference-page";

// Preserve the original privacy, terms, refund and data-deletion pages on reload.
export const Route = createFileRoute("/$")({ component: ReferencePage });
