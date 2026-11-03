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
    openGraph: { title, description: options.description, url: canonical },
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
