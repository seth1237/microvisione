import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { createCatalogProduct } from "@/lib/platform/catalog-data";
import { isMysqlConfigured, mysqlIsLocalCatalogReady } from "@/lib/platform/mysql";

let pending: Promise<void> | null = null;

/** Copy the existing Microvision catalogue into MySQL once, when the product table is empty. */
export function seedMicrovisionCatalogue(): Promise<void> {
  if (!isMysqlConfigured()) return Promise.resolve();
  if (!pending) pending = seedIfEmpty().catch((error) => {
    pending = null;
    throw error;
  });
  return pending;
}

async function seedIfEmpty() {
  const ready = await mysqlIsLocalCatalogReady().catch(() => true);
  if (ready) return;
  for (const product of products) {
    const category = categories.find((item) => item.id === product.categoryId);
    const brand = brands.find((item) => item.id === product.brandId);
    await createCatalogProduct({
      name: product.name,
      slug: product.slug,
      description: product.shortDescription,
      details: product.longDescription,
      categoryId: category?.slug || product.categoryId,
      categoryName: category?.name || product.categoryId,
      manufacturer: brand?.name,
      price: product.price,
      inStock: product.stockStatus === "in_stock" || product.stockStatus === "limited",
      featured: Boolean(product.featured),
    });
  }
}
