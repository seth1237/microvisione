"use client";

import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PriceTag } from "@/components/product/price-tag";
import { StockBadge } from "@/components/product/stock-badge";
import { Button } from "@/components/ui/button";
import { productWhatsAppMessage, whatsAppHref } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { useQuoteStore } from "@/store/quote";
import { useWishlistStore } from "@/store/wishlist";
import type { Product } from "@/types";

export function PurchasePanel({
  product,
  brandName,
}: {
  product: Product;
  brandName: string;
}) {
  const addToQuote = useQuoteStore((state) => state.add);
  const toggleWish = useWishlistStore((state) => state.toggle);
  const wished = useWishlistStore((state) => state.ids.includes(product.id));
  const href = `/product/${product.slug}`;
  const whatsapp = whatsAppHref(productWhatsAppMessage({ name: product.name, quantity: 1, path: href }));

  function onQuote() {
    addToQuote({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brand: brandName,
      quantity: 1,
    });
    toast.success(`${product.name} added to the quote basket`);
  }

  function onSave() {
    const added = toggleWish(product.id);
    toast.success(added ? `${product.name} saved` : `${product.name} removed from saved items`);
  }

  return (
    <>
      <aside className="rounded-md border border-line bg-white p-5">
        {brandName && !/tbc/i.test(brandName) ? <p className="text-sm text-muted">{brandName}</p> : null}
        <div className="mt-2">
          <PriceTag price={product.price} placeholder={product.priceIsPlaceholder} className="text-lg" />
        </div>
        {product.stockIsPlaceholder ? null : (
          <div className="mt-3">
            <StockBadge status={product.stockStatus} />
          </div>
        )}
        <div className="mt-5 hidden flex-col gap-2 lg:flex">
          <Button type="button" onClick={onQuote}>Request Quote</Button>
          <Button variant="outline" className="bg-surface/40" asChild>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Inquire via WhatsApp
            </a>
          </Button>
          <Button type="button" variant="outline" className="bg-surface/40" aria-pressed={wished} onClick={onSave}>
            <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} aria-hidden="true" />
            {wished ? "Saved" : "Save"}
          </Button>
        </div>
        <p className="mt-4 text-sm">
          <Link href="/services" className="font-semibold text-brand">
            Installation, training and service
          </Link>
        </p>
      </aside>
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-white/50 bg-surface/70 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2">
          <Button type="button" size="sm" className="col-span-2" onClick={onQuote}>
            Request Quote
          </Button>
          <Button size="sm" variant="outline" className="bg-surface/40" asChild>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Inquire via WhatsApp
            </a>
          </Button>
          <Button type="button" size="sm" variant="outline" className="bg-surface/40" aria-pressed={wished} onClick={onSave}>
            <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} aria-hidden="true" />
            {wished ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </>
  );
}
