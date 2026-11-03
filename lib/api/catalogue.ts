import "server-only";

import { cacheLife } from "next/cache";
import { getEvents, getOffers } from "@/lib/api/content";
import { getBrands, getCategories, getProducts, getSearchIndex } from "@/lib/api/products";
import type { CatalogueBundle } from "@/types";

/** Client read-model. The header, compare and wishlist resolve ids against this bundle. */
export async function getCatalogueBundle(): Promise<CatalogueBundle> {
  "use cache";
  cacheLife("hours");
  const [products, categories, brands, offers, events, searchIndex] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getOffers(),
    getEvents(),
    getSearchIndex(),
  ]);
  return { products, categories, brands, offers, events, searchIndex };
}
