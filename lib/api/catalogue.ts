import "server-only";

import { cacheLife } from "next/cache";
import { getEvents, getOffers } from "@/lib/api/content";
import { getBrands, getCategories, getProducts, getSearchIndex } from "@/lib/api/products";
import { accordApiPath } from "@/lib/platform/backend-url";
import type { CatalogueBundle } from "@/types";

async function readShowPrices() {
  try {
    const response = await fetch(accordApiPath("/api/settings/prices"));
    if (!response.ok) return false;
    const payload = (await response.json()) as { showPrices?: boolean };
    return payload.showPrices !== false;
  } catch {
    return false;
  }
}

/** Client read-model. The header, compare and wishlist resolve ids against this bundle. */
export async function getCatalogueBundle(): Promise<CatalogueBundle> {
  "use cache";
  cacheLife("minutes");
  const [products, categories, brands, offers, events, searchIndex, showPrices] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getOffers(),
    getEvents(),
    getSearchIndex(),
    readShowPrices(),
  ]);
  return { products, categories, brands, offers, events, searchIndex, showPrices };
}
