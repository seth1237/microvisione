import Link from "next/link";
import { CatalogueToolbar } from "@/components/product/catalogue-toolbar";
import { FilterPanel } from "@/components/product/filter-panel";
import { Pagination } from "@/components/product/pagination";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { catalogueHref, hasActiveFilters, parseCatalogueQuery } from "@/lib/catalogue-query";
import { getBrands, getCategories, getLinesForCategory, queryCatalogue } from "@/lib/api/products";
import type { CatalogueQuery } from "@/types";

const STOCK_LABEL: Record<string, string> = {
  in_stock: "In stock · example",
  limited: "Limited · confirm",
  on_request: "On request",
  unavailable: "Unavailable · example",
};

const MODE_LABEL: Record<string, string> = {
  quote: "Quote only",
  buy: "Buy only",
  both: "Quote and buy",
};

export async function CatalogueBrowser({
  searchParams,
  lockedCategory,
  heading,
  intro,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  lockedCategory?: string;
  heading: string;
  intro?: string;
}) {
  const parsed = parseCatalogueQuery(await searchParams);
  const query: CatalogueQuery = lockedCategory ? { ...parsed, category: lockedCategory } : parsed;
  const basePath = lockedCategory ? `/category/${lockedCategory}` : "/products";
  const linkQuery: CatalogueQuery = { ...query, category: lockedCategory ? undefined : query.category };

  const [result, categories, brands, lines] = await Promise.all([
    queryCatalogue(query),
    getCategories(),
    getBrands(),
    lockedCategory ? getLinesForCategory(lockedCategory) : Promise.resolve([] as string[]),
  ]);

  const chips: { label: string; href: string }[] = [];
  if (query.q) chips.push({ label: `Search: ${query.q}`, href: catalogueHref(basePath, linkQuery, {}, ["q", "page"]) });
  if (!lockedCategory && query.category) {
    const category = categories.find((item) => item.slug === query.category);
    chips.push({
      label: category?.name ?? query.category,
      href: catalogueHref(basePath, linkQuery, {}, ["category", "page"]),
    });
  }
  if (query.brand) {
    const brand = brands.find((item) => item.slug === query.brand);
    chips.push({ label: brand?.name ?? query.brand, href: catalogueHref(basePath, linkQuery, {}, ["brand", "page"]) });
  }
  if (query.line) chips.push({ label: query.line, href: catalogueHref(basePath, linkQuery, {}, ["line", "page"]) });
  if (query.availability) {
    chips.push({
      label: STOCK_LABEL[query.availability],
      href: catalogueHref(basePath, linkQuery, {}, ["availability", "page"]),
    });
  }
  if (query.mode) chips.push({ label: MODE_LABEL[query.mode], href: catalogueHref(basePath, linkQuery, {}, ["mode", "page"]) });
  if (query.min || query.max) {
    chips.push({
      label: `Price ${query.min ?? 0}–${query.max ?? "any"}`,
      href: catalogueHref(basePath, linkQuery, {}, ["min", "max", "page"]),
    });
  }

  const formKey = JSON.stringify(linkQuery);

  return (
    <Container className="py-8">
      <Breadcrumbs
        items={
          lockedCategory
            ? [
                { href: "/", label: "Home" },
                { href: "/products", label: "Products" },
                { label: heading },
              ]
            : [
                { href: "/", label: "Home" },
                { label: "Products" },
              ]
        }
      />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-3xl text-ink sm:text-4xl">{heading}</h1>
        {intro ? <p className="mt-3 text-muted">{intro}</p> : null}
      </header>

      {lines.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Groups">
          <Link
            href={catalogueHref(basePath, linkQuery, {}, ["line", "page"])}
            className={!query.line ? "rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand" : "rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold"}
          >
            All
          </Link>
          {lines.map((line) => (
            <Link
              key={line}
              href={catalogueHref(basePath, linkQuery, { line, page: 1 })}
              className={
                query.line === line
                  ? "rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-on-brand"
                  : "rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold"
              }
            >
              {line}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <FilterPanel
          key={formKey}
          action={basePath}
          query={linkQuery}
          categories={categories}
          brands={brands}
          lines={lines}
          lockCategory={Boolean(lockedCategory)}
        />
        <div className="space-y-5">
          <CatalogueToolbar key={`toolbar-${formKey}`} action={basePath} query={linkQuery} total={result.total} />
          {chips.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <Link href={chip.href} className="inline-flex items-center gap-2 rounded-md bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep">
                    {chip.label}
                    <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              ))}
              {hasActiveFilters(query, lockedCategory) ? (
                <li>
                  <Link href={basePath} className="inline-flex rounded-md px-3 py-1 text-sm font-semibold text-accent">
                    Clear all
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : null}

          {result.items.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-surface px-6 py-12 text-center">
              <h2 className="text-xl text-ink">No products match</h2>
              <p className="mt-2 text-muted">Try another name, or clear the filters to see the full list.</p>
              <Link href={basePath} className="mt-4 inline-flex font-semibold text-brand">
                Clear filters
              </Link>
            </div>
          ) : (
            <ul className={result && linkQuery.view === "list" ? "space-y-4" : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5"}>
              {result.items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} layout={linkQuery.view === "list" ? "list" : "grid"} />
                </li>
              ))}
            </ul>
          )}

          <Pagination
            page={result.page}
            pages={result.pages}
            hrefFor={(page) => catalogueHref(basePath, linkQuery, page <= 1 ? { page: 1 } : { page }, page <= 1 ? ["page"] : [])}
          />
        </div>
      </div>
    </Container>
  );
}
