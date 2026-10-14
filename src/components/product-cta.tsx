import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { offer } from "@/lib/product";

export function ProductCTA({ children = "QUERO OS +300 BRINQUEDOS", checkout = false, className = "" }: { children?: React.ReactNode; checkout?: boolean; className?: string }) {
  return <Button asChild className={`cta ${className}`}><a href={checkout ? offer.checkout : "#oferta"}>{children}<ArrowRight aria-hidden="true" /></a></Button>;
}