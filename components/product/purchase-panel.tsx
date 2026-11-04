"use client";

import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { postShopEvent } from "@/lib/analytics/shop";
import { PriceTag } from "@/components/product/price-tag";
import { useCatalogue } from "@/components/providers/catalogue-provider";
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
  const { categories, showPrices } = useCatalogue();
  const category = categories.find((entry) => entry.id === product.categoryId || entry.slug === product.categoryId);
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
    postShopEvent("/api/products/cart", {
      productId: product.id,
      productName: product.name,
      categoryId: category?.slug || product.categoryId,
      categoryName: category?.name || "",
    });
  }

  function onSave() {
    const added = toggleWish(product.id);
    toast.success(added ? `${product.name} saved` : `${product.name} removed from saved items`);
  }

  return (
    <>
      <aside className="border-t border-slate-200 pt-5">
        <PriceTag price={showPrices === false ? undefined : product.price} placeholder={product.priceIsPlaceholder} className="text-2xl" />
        {product.stockIsPlaceholder ? null : (
          <div className="mt-3">
            <StockBadge status={product.stockStatus} />
          </div>
        )}
        <div className="mt-5 hidden gap-2 lg:grid">
          <Button type="button" onClick={onQuote}>Request Quote</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            </Button>
            <Button type="button" variant="outline" aria-pressed={wished} onClick={onSave}>
              <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} aria-hidden="true" />
              {wished ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          <Link href="/services" className="font-semibold text-brand">
            Installation, training and service
          </Link>
        </p>
      </aside>
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <Button type="button" className="min-w-0 flex-1" onClick={onQuote}>
            Request Quote
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Inquire via WhatsApp">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button type="button" variant="outline" size="icon" aria-pressed={wished} aria-label={wished ? "Saved" : "Save"} onClick={onSave}>
            <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </>
  );
}
