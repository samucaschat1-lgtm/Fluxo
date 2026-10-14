import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { offer } from "@/lib/product";

export function ProductCTA({ children = "QUERO OS +300 BRINQUEDOS", checkout = false, className = "", onClick }: { children?: React.ReactNode; checkout?: boolean; className?: string; onClick?: () => void }) {
  return <Button asChild className={`cta ${className}`}><a href={checkout ? offer.checkout : "#oferta"} onClick={onClick}>{children}<ArrowRight aria-hidden="true" /></a></Button>;
}