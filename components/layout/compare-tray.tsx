"use client";

import Link from "next/link";
import { useCatalogue } from "@/components/providers/catalogue-provider";
import { useCompareStore } from "@/store/compare";

export function CompareTray() {
  const ids = useCompareStore((state) => state.ids);
  const remove = useCompareStore((state) => state.remove);
  const { products } = useCatalogue();
  if (ids.length === 0) return null;
  const selected = ids.map((id) => products.find((product) => product.id === id)).filter((item) => item != null);

  return (
    <div className="fixed inset-x-3 bottom-36 z-30 rounded-md border border-line bg-surface p-3 shadow-pop lg:bottom-6 lg:left-4 lg:max-w-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Compare ({selected.length}/4)</p>
        <Link href="/compare" className="text-sm font-semibold text-brand">Open</Link>
      </div>
      <ul className="mt-2 flex flex-wrap gap-2">
        {selected.map((product) => (
          <li key={product.id}>
            <button type="button" className="rounded-md bg-paper px-2 py-1 text-xs font-semibold" onClick={() => remove(product.id)}>
              {product.name} <span aria-hidden="true">×</span>
              <span className="sr-only">Remove</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
