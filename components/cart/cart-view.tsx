"use client";

import Link from "next/link";
import { QuantityControl } from "@/components/cart/quantity-control";
import { PriceTag } from "@/components/product/price-tag";
import { Button } from "@/components/ui/button";
import { cartTotal, useCartStore } from "@/store/cart";
import { formatKes } from "@/lib/utils/format";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const total = cartTotal(items);
  const example = items.some((item) => item.priceIsPlaceholder);

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-8">
        <h2 className="text-xl">Your cart is empty</h2>
        <p className="mt-2 text-muted">Products you add from the catalogue show up here.</p>
        <Link href="/products?mode=buy" className="mt-4 inline-flex font-semibold text-brand">View items you can buy</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <ul className="divide-y divide-line rounded-md border border-line bg-surface">
        {items.map((item) => (
          <li key={item.productId} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <Link href={`/product/${item.slug}`} className="font-semibold hover:text-brand">{item.name}</Link>
              <div className="mt-1">
                <PriceTag price={item.unitPrice} placeholder={item.priceIsPlaceholder} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <QuantityControl value={item.quantity} label={item.name} onChange={(quantity) => setQuantity(item.productId, quantity)} />
              <button type="button" className="text-sm font-semibold text-accent" onClick={() => remove(item.productId)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-md border border-line bg-surface p-5">
        <h2 className="text-lg">Summary</h2>
        <p className="mt-3 flex justify-between text-sm">
          <span>Total</span>
          <span className="font-semibold">{formatKes(total)}</span>
        </p>
        {example ? <p className="mt-2 text-xs text-warning">Includes example prices. This is not an invoice.</p> : null}
        <Button asChild className="mt-4 w-full">
          <Link href="/checkout">Checkout</Link>
        </Button>
      </aside>
    </div>
  );
}
