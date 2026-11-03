import { cn } from "@/lib/utils/cn";
import { formatKes } from "@/lib/utils/format";

export function PriceTag({
  price,
  placeholder,
  className,
}: {
  price?: number;
  placeholder?: boolean;
  className?: string;
}) {
  if (price == null) {
    return <span className={cn("font-semibold text-brand", className)}>Request a quote</span>;
  }
  return (
    <span className={className}>
      <span className="font-semibold text-ink">{formatKes(price)}</span>
      {placeholder ? (
        <span className="ml-2 align-middle text-xs font-semibold text-warning">Example price</span>
      ) : null}
    </span>
  );
}
