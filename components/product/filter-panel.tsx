"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BrandWithCount, CatalogueQuery, CategoryWithCount } from "@/types";

const control =
  "h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink";

export function FilterPanel({
  action,
  query,
  categories,
  brands,
  lines,
  lockCategory,
}: {
  action: string;
  query: CatalogueQuery;
  categories: CategoryWithCount[];
  brands: BrandWithCount[];
  lines: string[];
  lockCategory: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    const qs = params.toString();
    router.push(qs ? `${action}?${qs}` : action);
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="mb-3 w-full lg:hidden"
        aria-expanded={open}
        aria-controls="catalogue-filters"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {open ? "Hide filters" : "Show filters"}
      </Button>
      <form
        id="catalogue-filters"
        method="get"
        action={action}
        onSubmit={onSubmit}
        className={open ? "space-y-4 rounded-md border border-line bg-surface p-4 lg:border-0 lg:bg-transparent lg:p-0" : "hidden space-y-4 lg:block"}
      >
        {!lockCategory ? (
          <label className="block text-sm font-semibold">
            Category
            <select name="category" defaultValue={query.category ?? ""} className={`${control} mt-1`}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm font-semibold">
          Brand
          <select name="brand" defaultValue={query.brand ?? ""} className={`${control} mt-1`}>
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name} ({brand.count})
              </option>
            ))}
          </select>
        </label>
        {lines.length > 0 ? (
          <label className="block text-sm font-semibold">
            Group
            <select name="line" defaultValue={query.line ?? ""} className={`${control} mt-1`}>
              <option value="">All groups</option>
              {lines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm font-semibold">
          Availability
          <select name="availability" defaultValue={query.availability ?? ""} className={`${control} mt-1`}>
            <option value="">Any</option>
            <option value="in_stock">In stock (example)</option>
            <option value="limited">Limited (confirm)</option>
            <option value="on_request">On request</option>
            <option value="unavailable">Unavailable (example)</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Purchase
          <select name="mode" defaultValue={query.mode ?? ""} className={`${control} mt-1`}>
            <option value="">Quote or buy</option>
            <option value="quote">Quote only</option>
            <option value="buy">Buy only</option>
            <option value="both">Quote and buy</option>
          </select>
        </label>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Example price (KES)</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">
              Min
              <input
                name="min"
                inputMode="numeric"
                defaultValue={query.min ?? ""}
                className={`${control} mt-1`}
                aria-label="Minimum example price"
              />
            </label>
            <label className="text-xs text-muted">
              Max
              <input
                name="max"
                inputMode="numeric"
                defaultValue={query.max ?? ""}
                className={`${control} mt-1`}
                aria-label="Maximum example price"
              />
            </label>
          </div>
          <p className="text-xs text-muted">Unpriced equipment is hidden when a range is set.</p>
        </fieldset>
        {query.sort && query.sort !== "featured" ? <input type="hidden" name="sort" value={query.sort} /> : null}
        {query.view === "list" ? <input type="hidden" name="view" value="list" /> : null}
        {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
        <Button type="submit" variant="secondary" className="w-full">
          Apply filters
        </Button>
      </form>
    </div>
  );
}
