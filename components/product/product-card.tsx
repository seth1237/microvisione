"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { postShopEvent } from "@/lib/analytics/shop";
import { CategoryGlyph } from "@/components/product/category-glyph";
import { ProductVisual } from "@/components/product/product-visual";
import { useCatalogue } from "@/components/providers/catalogue-provider";
import { productWhatsAppMessage, whatsAppHref } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { formatKes } from "@/lib/utils/format";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";

function flyToCart(source: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.querySelector<HTMLElement>("[data-cart-target]");
  if (!target) return;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = 28;
  const node = document.createElement("span");
  node.setAttribute("aria-hidden", "true");
  node.style.position = "fixed";
  node.style.zIndex = "70";
  node.style.left = `${from.left + from.width / 2 - size / 2}px`;
  node.style.top = `${from.top + from.height / 2 - size / 2}px`;
  node.style.width = `${size}px`;
  node.style.height = `${size}px`;
  node.style.borderRadius = "10px";
  node.style.background = "#ffffff";
  node.style.border = "1px solid #1211bb";
  node.style.boxShadow = "0 8px 18px rgba(15,23,42,0.12)";
  node.style.pointerEvents = "none";
  node.style.display = "grid";
  node.style.placeItems = "center";
  node.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1211bb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/><path d="M3 4h2l2.2 11h11.3l2-7H7"/></svg>';
  document.body.appendChild(node);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = node.animate(
    [
      { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", opacity: 1 },
      { transform: `translate3d(${dx * 0.62}px, ${dy * 0.4 - 16}px, 0) rotate(170deg) scale(0.8)`, opacity: 0.9, offset: 0.6 },
      { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(320deg) scale(0.35)`, opacity: 0.15 },
    ],
    { duration: 560, easing: "cubic-bezier(0.22, 0.7, 0.2, 1)", fill: "forwards" },
  );
  animation.onfinish = () => {
    node.remove();
    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }],
      { duration: 220, easing: "ease-out" },
    );
  };
}

const REVEAL_S = 0.6;
const STAGGER_S = 0.07;
const ROW = 5;

function chipText(value: string) {
  const text = value.trim();
  if (!text) return "";
  const lowered = text.toLowerCase();
  if (lowered.includes("tbc") || lowered.includes("placeholder")) return "";
  return text;
}

export function ProductCard({
  product,
  layout = "grid",
  index = 0,
}: {
  product: Product;
  layout?: "grid" | "list";
  index?: number;
}) {
  const addToCart = useCartStore((state) => state.add);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setInView(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const revealed = Boolean(reduceMotion) || inView;
  const { brands, categories, showPrices } = useCatalogue();

  const brandName =
    brands.find((brand) => brand.id === product.brandId)?.name ?? "Microvision";

  const category = categories.find(
    (entry) => entry.id === product.categoryId || entry.slug === product.categoryId
  );

  const href = `/product/${product.slug}`;

  const whatsapp = whatsAppHref(
    productWhatsAppMessage({ name: product.name, quantity: 1, path: href })
  );

  const isList = layout === "list";

  const specs = product.features
    .map(chipText)
    .filter(Boolean)
    .slice(0, isList ? 4 : 3);

  const showPrice = Boolean(
    showPrices !== false && product.price && product.price > 0 && !product.priceIsPlaceholder
  );

  function onAdd(event: React.MouseEvent<HTMLButtonElement>) {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      quantity: 1,
      unitPrice: showPrice ? product.price : undefined,
      priceIsPlaceholder: product.priceIsPlaceholder,
      imageVariant: "primary",
      categoryId: product.categoryId,
    });
    flyToCart(event.currentTarget);
    postShopEvent("/api/products/cart", {
      productId: product.id,
      productName: product.name,
      categoryId: category?.slug || product.categoryId,
      categoryName: category?.name || "",
    });
  }

  const photo = product.photoUrl && !photoFailed ? product.photoUrl : "";

  return (
    <motion.article
      ref={cardRef}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: revealed && !reduceMotion ? REVEAL_S : 0,
        delay: revealed && !reduceMotion ? (index % ROW) * STAGGER_S : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <div
        className={cn(
          "group relative flex h-full min-w-0 flex-col overflow-hidden",
          "rounded-xl border border-slate-200 bg-white",
          "transition-[transform,box-shadow,border-color] duration-300 ease-out",
          "hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          "focus-within:ring-2 focus-within:ring-[#1211bb]/25",
          isList && "sm:flex-row"
        )}
      >
      {/* Image */}
      <div
        className={cn(
          "relative shrink-0 bg-white",
          isList
            ? "aspect-[4/3] w-full border-b border-slate-100 sm:aspect-auto sm:w-60 sm:border-b-0 sm:border-r"
            : "aspect-[4/3] w-full border-b border-slate-100"
        )}
      >
        <Link
          href={href}
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-[1]"
        />
        <div className="absolute inset-3 sm:inset-4">
          <div className="relative h-full w-full">
            {photo ? (
              <Image
                src={photo}
                alt={product.name}
                fill
                sizes={isList ? "(max-width: 640px) 100vw, 240px" : "(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"}
                className="object-contain transition-transform duration-[400ms] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <div className="h-full w-full transition-transform duration-[400ms] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <ProductVisual
                  name={product.name}
                  variant="primary"
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="truncate font-medium">{brandName}</span>
          <span className="flex min-w-0 items-center gap-1">
            <CategoryGlyph
              name={category?.icon ?? "flask"}
              className="h-3 w-3 shrink-0"
            />
            <span className="hidden truncate sm:inline">
              {category?.name || "Medical Equipment"}
            </span>
          </span>
        </div>

        <h3
          className={cn(
            "mt-1 text-sm font-semibold leading-snug text-slate-900 sm:text-[15px]",
            "transition-colors group-hover:text-[#1211bb]"
          )}
        >
          <Link href={href} className="line-clamp-2">
            {product.name}
          </Link>
        </h3>

        {specs.length > 0 && (
          <p className="mt-1 truncate text-xs leading-snug text-slate-600" title={specs.join(" · ")}>
            {specs.join(" · ")}
          </p>
        )}

        {/* Price + actions */}
        <div className="mt-3">
          <div className="mb-2 flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
            {showPrice ? (
              <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                {formatKes(product.price!)}
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-500">
                Price on request
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add ${product.name} to cart`}
              className={cn(
                "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2",
                "rounded-lg bg-[#1211bb] px-3 text-sm font-semibold text-white",
                "transition-colors duration-150 hover:bg-[#0e0d96] active:bg-[#0b0a7a]",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[#1211bb] focus-visible:ring-offset-2"
              )}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add to cart</span>
              </span>
            </button>

            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Inquire on WhatsApp"
              aria-label={`Inquire about ${product.name} on WhatsApp`}
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center",
                "rounded-lg border border-slate-300 bg-white text-slate-700",
                "transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[#1211bb] focus-visible:ring-offset-2"
              )}
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </div>
      </div>
    </motion.article>
  );
}

/* PRODUCT CARD SKELETON */

export function ProductCardSkeleton({
  layout = "grid",
}: {
  layout?: "grid" | "list";
}) {
  const isList = layout === "list";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl",
        "border border-slate-200 bg-white",
        isList && "sm:flex-row"
      )}
    >
      <div
        className={cn(
          "animate-pulse bg-slate-50",
          isList
            ? "aspect-[4/3] w-full sm:aspect-auto sm:w-60"
            : "aspect-[4/3] w-full"
        )}
      />
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 flex gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </div>
  );
}