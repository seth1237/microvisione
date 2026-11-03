import { Minus, Plus } from "lucide-react";

export function QuantityControl({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-line">
      <button type="button" className="inline-flex h-10 w-10 items-center justify-center" aria-label={`Decrease quantity for ${label}`} onClick={() => onChange(Math.max(1, value - 1))}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-8 text-center text-sm font-semibold">{value}</span>
      <button type="button" className="inline-flex h-10 w-10 items-center justify-center" aria-label={`Increase quantity for ${label}`} onClick={() => onChange(Math.min(99, value + 1))}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
