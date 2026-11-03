import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/api/content";
import { getBrands, getCategories, getProducts } from "@/lib/api/products";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, events] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getEvents(),
  ]);
  const staticPaths = [
    "/",
    "/brands",
    "/services",
    "/about",
    "/events",
    "/careers",
    "/contact",
    "/legal/terms",
    "/legal/privacy",
    "/legal/returns",
  ];

  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...categories.map((category) => ({ url: absoluteUrl(`/category/${category.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((product) => ({ url: absoluteUrl(`/product/${product.slug}`), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...brands.map((brand) => ({ url: absoluteUrl(`/brands/${brand.slug}`), changeFrequency: "monthly" as const, priority: 0.5 })),
    ...events.map((event) => ({ url: absoluteUrl(`/events/${event.slug}`), changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
