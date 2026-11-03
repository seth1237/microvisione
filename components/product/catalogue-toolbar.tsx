"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, List, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { catalogueHref } from "@/lib/catalogue-query";
import { cn } from "@/lib/utils/cn";
import type { CatalogueQuery } from "@/types";

export function CatalogueToolbar({
  action,
  query,
  total,
}: {
  action: string;
  query: CatalogueQuery;
  total: number;
}) {
  const router = useRouter();

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${action}?${qs}` : action);
  }

  const gridHref = catalogueHref(action, query, { view: "grid", page: 1 }, ["view", "page"]);
  const listHref = catalogueHref(action, query, { view: "list", page: 1 });

  return (
    <form method="get" action={action} onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
      {query.brand ? <input type="hidden" name="brand" value={query.brand} /> : null}
      {query.line ? <input type="hidden" name="line" value={query.line} /> : null}
      {query.availability ? <input type="hidden" name="availability" value={query.availability} /> : null}
      {query.mode ? <input type="hidden" name="mode" value={query.mode} /> : null}
      {query.min ? <input type="hidden" name="min" value={String(query.min)} /> : null}
      {query.max ? <input type="hidden" name="max" value={String(query.max)} /> : null}
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search this catalogue</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          name="q"
          defaultValue={query.q ?? ""}
          placeholder="Search by product or brand"
          className="h-11 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm"
        />
      </label>
      <Button type="submit">Search</Button>
      <label className="text-sm font-semibold sm:w-48">
        <span className="sr-only">Sort</span>
        <select
          name="sort"
          defaultValue={query.sort ?? "featured"}
          className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="featured">Featured</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="price-asc">Example price, low to high</option>
          <option value="price-desc">Example price, high to low</option>
        </select>
      </label>
      <div className="flex items-center gap-2">
        <Link
          href={gridHref}
          aria-label="Grid view"
          aria-pressed={query.view !== "list"}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-md border border-line",
            query.view !== "list" ? "bg-brand text-on-brand" : "bg-surface",
          )}
        >
          <LayoutGrid className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={listHref}
          aria-label="List view"
          aria-pressed={query.view === "list"}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-md border border-line",
            query.view === "list" ? "bg-brand text-on-brand" : "bg-surface",
          )}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <p className="text-sm text-muted sm:ml-auto" aria-live="polite">
        {total} {total === 1 ? "product" : "products"}
      </p>
    </form>
  );
}
