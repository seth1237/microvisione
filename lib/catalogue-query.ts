import type { CatalogueQuery, CatalogueSort, PurchaseMode, StockStatus } from "@/types";

const SORTS: CatalogueSort[] = [
  "featured",
  "name-asc",
  "name-desc",
  "price-asc",
  "price-desc",
];

const STOCK: StockStatus[] = ["in_stock", "limited", "on_request", "unavailable"];
const MODES: PurchaseMode[] = ["quote", "buy", "both"];

function one(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseCatalogueQuery(
  sp: Record<string, string | string[] | undefined>,
): CatalogueQuery {
  const sort = one(sp.sort);
  const view = one(sp.view);
  const availability = one(sp.availability);
  const mode = one(sp.mode);
  const min = Number(one(sp.min));
  const max = Number(one(sp.max));
  const page = Number(one(sp.page));

  return {
    q: one(sp.q),
    category: one(sp.category),
    brand: one(sp.brand),
    line: one(sp.line),
    availability: STOCK.includes(availability as StockStatus)
      ? (availability as StockStatus)
      : undefined,
    mode: MODES.includes(mode as PurchaseMode) ? (mode as PurchaseMode) : undefined,
    min: Number.isFinite(min) && min > 0 ? min : undefined,
    max: Number.isFinite(max) && max > 0 ? max : undefined,
    sort: SORTS.includes(sort as CatalogueSort) ? (sort as CatalogueSort) : "featured",
    view: view === "list" ? "list" : "grid",
    page: Number.isFinite(page) && page > 1 ? Math.floor(page) : 1,
  };
}

export function queryToSearchParams(query: CatalogueQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.category) params.set("category", query.category);
  if (query.brand) params.set("brand", query.brand);
  if (query.line) params.set("line", query.line);
  if (query.availability) params.set("availability", query.availability);
  if (query.mode) params.set("mode", query.mode);
  if (query.min) params.set("min", String(query.min));
  if (query.max) params.set("max", String(query.max));
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.view === "list") params.set("view", "list");
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
}

export function catalogueHref(
  basePath: string,
  query: CatalogueQuery,
  patch: Partial<CatalogueQuery> = {},
  omit: (keyof CatalogueQuery)[] = [],
): string {
  const next: CatalogueQuery = { ...query, ...patch };
  for (const key of omit) delete next[key];
  const params = queryToSearchParams(next);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function hasActiveFilters(query: CatalogueQuery, lockedCategory?: string): boolean {
  return Boolean(
    query.q ||
      query.brand ||
      query.line ||
      query.availability ||
      query.mode ||
      query.min ||
      query.max ||
      (query.category && query.category !== lockedCategory),
  );
}
