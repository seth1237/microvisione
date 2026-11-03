import { Badge } from "@/components/ui/badge";
import type { StockStatus } from "@/types";

const copy: Record<StockStatus, { label: string; tone: "success" | "warning" | "neutral" | "danger" }> = {
  in_stock: { label: "In stock · example", tone: "success" },
  limited: { label: "Limited · confirm", tone: "warning" },
  on_request: { label: "On request", tone: "neutral" },
  unavailable: { label: "Unavailable · example", tone: "danger" },
};

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  const item = copy[status];
  return (
    <Badge tone={item.tone} className={className}>
      {item.label}
    </Badge>
  );
}
