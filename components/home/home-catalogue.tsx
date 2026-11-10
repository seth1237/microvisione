"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { CategoryGlyph } from "@/components/product/category-glyph";
import { cn } from "@/lib/utils/cn";
import type { CategoryWithCount, Product } from "@/types";

const PAGE_SIZE = 12;

export function HomeCatalogue({
  categories,
  products,
  initialCategoryId = null,
  activeSlug = "",
  categoryLinks = false,
}: {
  categories: CategoryWithCount[];
  products: Product[];
  initialCategoryId?: string | null;
  activeSlug?: string;
  categoryLinks?: boolean;
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setCategoryId(initialCategoryId);
    setVisible(PAGE_SIZE);
  }, [initialCategoryId]);

  const filtered = useMemo(
    () => (categoryId ? products.filter((product) => product.categoryId === categoryId) : products),
    [categoryId, products],
  );
  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  function selectCategory(id: string | null) {
    if (categoryLinks) {
      if (!id) {
        router.push("/");
        return;
      }
      const category = categories.find((item) => item.id === id);
      if (category) router.push(`/category/${category.slug}`);
      return;
    }
    setCategoryId(id);
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="mt-4 grid items-start gap-4 lg:mt-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-6">
      <CategorySidebar
        categories={categories}
        products={products}
        activeId={categoryId}
        activeSlug={activeSlug}
        onSelect={selectCategory}
        className="sticky top-36 hidden lg:block"
      />
      <div className="min-w-0">
        <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
          {shown.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <ProductCard product={product} index={index} />
            </li>
          ))}
        </ul>
        {shown.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No products in this category yet.</p>
        ) : null}
        {remaining > 0 ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="inline-flex h-11 items-center rounded-[12px] border border-brand bg-white px-6 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-on-brand"
              onClick={() => setVisible((count) => count + PAGE_SIZE)}
            >
              Load more products
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function CategorySidebar({
  categories,
  products,
  activeId,
  activeSlug = "",
  onSelect,
  linkCategories = false,
  currentSlug = "",
  showTitle = true,
  className,
}: {
  categories: CategoryWithCount[];
  products: Product[];
  activeId: string | null;
  activeSlug?: string;
  onSelect?: (id: string | null) => void;
  linkCategories?: boolean;
  currentSlug?: string;
  showTitle?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(activeId);

  function selectCategory(id: string | null) {
    if (linkCategories) {
      if (!id) {
        router.push("/");
        return;
      }
      const category = categories.find((item) => item.id === id);
      if (category) router.push(`/category/${category.slug}`);
      return;
    }
    onSelect?.(id);
  }

  return (
    <aside className={cn("overflow-hidden rounded-md border border-[#1211bb]/30 bg-white shadow-sm", className)}>
      {showTitle ? (
        <div className="bg-brand px-4 py-3">
          <h2 className="text-xs font-bold tracking-wider text-white uppercase">Product categories</h2>
        </div>
      ) : null}
      <div className="max-h-[70vh] overflow-auto">
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between border-b border-line px-4 py-3 text-left text-[13px] font-semibold",
            activeId === null ? "bg-brand-soft text-brand" : "text-ink hover:bg-[#F8FAFC]",
          )}
          onClick={() => selectCategory(null)}
        >
          All products
          <span className="text-[11px] text-muted">{products.length}</span>
        </button>
        {categories.map((category) => {
          const items = products.filter((product) => product.categoryId === category.id);
          const open = expanded === category.id;
          const active = activeId === category.id;
          return (
            <div key={category.slug} className="border-b border-line last:border-0">
              <div className={cn("flex items-stretch", (activeSlug ? category.slug === activeSlug : active) && "bg-brand text-on-brand")}>
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold"
                  onClick={() => selectCategory(category.id)}
                >
                  <CategoryGlyph name={category.icon} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{category.name}</span>
                </button>
                <button
                  type="button"
                  className="inline-flex w-10 items-center justify-center"
                  aria-expanded={open}
                  aria-label={open ? `Hide ${category.name} products` : `Show ${category.name} products`}
                  onClick={() => setExpanded(open ? null : category.id)}
                >
                  <span className="text-[10px]">{items.length}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
                </button>
              </div>
              {open ? (
                <ul className="max-h-64 overflow-auto bg-[#F8FAFC] py-1">
                  {items.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        className={cn(
                          "block truncate px-4 py-1.5 text-[12px] hover:bg-white hover:text-brand",
                          product.slug === currentSlug ? "bg-white font-semibold text-brand" : "text-[#334155]",
                        )}
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
