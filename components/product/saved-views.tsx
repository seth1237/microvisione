"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useCatalogue } from "@/components/providers/catalogue-provider";
import { useCompareStore } from "@/store/compare";
import { useWishlistStore } from "@/store/wishlist";

export function WishlistView() {
  const ids = useWishlistStore((state) => state.ids);
  const { products } = useCatalogue();
  const saved = ids.map((id) => products.find((product) => product.id === id)).filter((item) => item != null);

  if (saved.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-8">
        <h2 className="text-xl">No saved products</h2>
        <p className="mt-2 text-muted">Use the heart on a product card to keep it in this browser.</p>
        <Link href="/products" className="mt-4 inline-flex font-semibold text-brand">Browse products</Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
      {saved.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function CompareView() {
  const ids = useCompareStore((state) => state.ids);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const { products } = useCatalogue();
  const selected = ids.map((id) => products.find((product) => product.id === id)).filter((item) => item != null);

  if (selected.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-8">
        <h2 className="text-xl">Nothing to compare</h2>
        <p className="mt-2 text-muted">Add up to four products from their cards. Specifications are still TBC, so the table shows that honestly.</p>
        <Link href="/products" className="mt-4 inline-flex font-semibold text-brand">Browse products</Link>
      </div>
    );
  }

  const labels = selected[0]?.specs.map((spec) => spec.label) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{selected.length} of 4</p>
        <button type="button" className="text-sm font-semibold text-accent" onClick={clear}>Clear</button>
      </div>
      <div className="overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Side-by-side product comparison</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="p-3">Specification</th>
              {selected.map((product) => (
                <th key={product.id} scope="col" className="p-3">
                  <Link href={`/product/${product.slug}`} className="font-semibold text-brand">{product.name}</Link>
                  <button type="button" className="mt-1 block text-xs font-semibold text-accent" onClick={() => remove(product.id)}>
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <th scope="row" className="p-3">Purchase</th>
              {selected.map((product) => (
                <td key={product.id} className="p-3">{product.purchaseMode}</td>
              ))}
            </tr>
            {labels.map((label) => (
              <tr key={label} className="border-b border-line">
                <th scope="row" className="p-3">{label}</th>
                {selected.map((product) => (
                  <td key={product.id} className="p-3">{product.specs.find((spec) => spec.label === label)?.value ?? "TBC"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
