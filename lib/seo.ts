import "server-only";

import type { Metadata } from "next";
import { catalogueHref, parseCatalogueQuery } from "@/lib/catalogue-query";
import { queryCatalogue } from "@/lib/api/products";
import type { CatalogueQuery } from "@/types";

export async function catalogueMetadata(options: {
  basePath: string;
  title: string;
  description: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  lockedCategory?: string;
}): Promise<Metadata> {
  const parsed = parseCatalogueQuery(await options.searchParams);
  const query: CatalogueQuery = options.lockedCategory
    ? { ...parsed, category: options.lockedCategory }
    : parsed;
  const linkQuery: CatalogueQuery = {
    ...query,
    category: options.lockedCategory ? undefined : query.category,
  };
  const result = await queryCatalogue(query);
  const filtered = Boolean(
    query.q ||
      query.brand ||
      query.line ||
      query.availability ||
      query.mode ||
      query.min ||
      query.max ||
      (query.category && !options.lockedCategory),
  );
  const page = result.page;
  const title = page > 1 ? `${options.title} — page ${page}` : options.title;
  const canonical =
    !filtered && page > 1 ? catalogueHref(options.basePath, linkQuery, { page }) : options.basePath;

  return {
    title,
    description: options.description,
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description: options.description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description: options.description },
    pagination: filtered
      ? undefined
      : {
          previous:
            page > 1
              ? catalogueHref(options.basePath, linkQuery, { page: page - 1 }, page - 1 <= 1 ? ["page"] : [])
              : null,
          next:
            page < result.pages
              ? catalogueHref(options.basePath, linkQuery, { page: page + 1 })
              : null,
        },
  };
}

export const utilityRobots: Metadata["robots"] = { index: false, follow: false };

const RANKED_PRODUCT_SLUGS = new Set([
  "blood-sugar-machine",
  "chem-100",
  "chem-200",
  "chem-400",
  "piccolo-chem",
  "spotchem-d-concept",
  "ams-sat450",
  "hb-meter",
])

export function rankedProductCopy(product: { slug: string; name: string }, categoryName: string) {
  if (!RANKED_PRODUCT_SLUGS.has(product.slug) || !categoryName) return null
  return {
    title: `${product.name}, ${categoryName} in Kenya`,
    description: `${product.name}. ${categoryName} from Microvision Enterprises Ltd in Kenya.`,
  }
}

export function metaText(value: string, max = 158) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const word = cut.replace(/\s+\S*$/, "");
  return `${word || cut}…`;
}

export function keywordList(value: string | undefined) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}
