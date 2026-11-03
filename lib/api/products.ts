import "server-only";

import { cacheLife } from "next/cache";
import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { liveCatalogue } from "@/lib/api/live-catalogue";
import type {
  BrandWithCount,
  CatalogueQuery,
  CategoryWithCount,
  Product,
  SearchHit,
} from "@/types";

/**
 * Catalogue reads. Swap the bodies for `fetch` calls when Postgres is ready.
 * Keep the return types stable so pages do not change.
 */

async function staticProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return products;
}

export async function getProducts(): Promise<Product[]> {
  const live = await liveCatalogue().catch(() => null);
  if (live) return live.products;
  return staticProducts();
}

async function staticProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const live = await liveCatalogue().catch(() => null);
  if (live) return live.products.find((product) => product.slug === slug) ?? null;
  return staticProductBySlug(slug);
}

async function staticCategories(): Promise<CategoryWithCount[]> {
  "use cache";
  cacheLife("hours");
  return categories.map((category) => ({
    ...category,
    count: products.filter((product) => product.categoryId === category.id).length,
  }));
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const live = await liveCatalogue().catch(() => null);
  if (live) return live.categories;
  return staticCategories();
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithCount | null> {
  const list = await getCategories();
  return list.find((category) => category.slug === slug) ?? null;
}

async function staticBrands(): Promise<BrandWithCount[]> {
  "use cache";
  cacheLife("hours");
  return brands
    .map((brand) => ({
      ...brand,
      count: products.filter((product) => product.brandId === brand.id).length,
    }))
    .filter((brand) => brand.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBrands(): Promise<BrandWithCount[]> {
  const live = await liveCatalogue().catch(() => null);
  if (live) return live.brands.sort((a, b) => a.name.localeCompare(b.name));
  return staticBrands();
}

export async function getBrandBySlug(slug: string): Promise<BrandWithCount | null> {
  const list = await getBrands();
  return list.find((brand) => brand.slug === slug) ?? null;
}

async function staticSearchIndex(): Promise<SearchHit[]> {
  "use cache";
  cacheLife("hours");
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: brands.find((brand) => brand.id === product.brandId)?.name ?? "Manufacturer TBC",
    category: categories.find((category) => category.id === product.categoryId)?.name ?? "",
    categoryId: product.categoryId,
  }));
}

export async function getSearchIndex(): Promise<SearchHit[]> {
  const live = await liveCatalogue().catch(() => null);
  if (live) return live.searchIndex;
  return staticSearchIndex();
}

export async function getLinesForCategory(categorySlug: string): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return [];
  const lines = new Set<string>();
  for (const product of products) {
    if (product.categoryId === category.id && product.line) lines.add(product.line);
  }
  return [...lines].sort();
}

function matchesQuery(product: Product, query: CatalogueQuery, categoryId?: string, brandId?: string): boolean {
  if (categoryId && product.categoryId !== categoryId) return false;
  if (brandId && product.brandId !== brandId) return false;
  if (query.line && product.line !== query.line) return false;
  if (query.availability && product.stockStatus !== query.availability) return false;
  if (query.mode && product.purchaseMode !== query.mode) return false;
  if (query.min != null || query.max != null) {
    if (product.price == null) return false;
    if (query.min != null && product.price < query.min) return false;
    if (query.max != null && product.price > query.max) return false;
  }
  if (query.q) {
    const haystack = [
      product.name,
      product.slug,
      product.line ?? "",
      product.tags.join(" "),
      brands.find((brand) => brand.id === product.brandId)?.name ?? "",
      categories.find((category) => category.id === product.categoryId)?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();
    const terms = query.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.every((term) => haystack.includes(term))) return false;
  }
  return true;
}

function compareProducts(sort: CatalogueQuery["sort"]) {
  return (a: Product, b: Product) => {
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "price-asc") return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name);
    if (sort === "price-desc") return (b.price ?? -1) - (a.price ?? -1) || a.name.localeCompare(b.name);
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    const featured = Number(b.featured ?? false) - Number(a.featured ?? false);
    return featured || a.name.localeCompare(b.name);
  };
}

export async function queryCatalogue(query: CatalogueQuery): Promise<{
  items: Product[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}> {
  "use cache";
  cacheLife("hours");
  const pageSize = 12;
  const categoryId = query.category
    ? categories.find((category) => category.slug === query.category)?.id
    : undefined;
  const brandId = query.brand ? brands.find((brand) => brand.slug === query.brand)?.id : undefined;

  if (query.category && !categoryId) {
    return { items: [], total: 0, page: 1, pages: 1, pageSize };
  }
  if (query.brand && !brandId) {
    return { items: [], total: 0, page: 1, pages: 1, pageSize };
  }

  const filtered = products
    .filter((product) => matchesQuery(product, query, categoryId, brandId))
    .sort(compareProducts(query.sort));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page ?? 1, pages);
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pages,
    pageSize,
  };
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return product.relatedIds
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item));
}
