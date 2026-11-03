import "server-only";

import { cacheLife } from "next/cache";
import { brands as knownBrands } from "@/data/brands";
import { categories as knownCategories } from "@/data/categories";
import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";
import type { BrandWithCount, CatalogueEvent, CategoryWithCount, Job, Offer, Product, SearchHit } from "@/types";

type LiveProduct = {
  id: string;
  name: string;
  description?: string;
  details?: string;
  categoryId: string;
  categoryName?: string;
  manufacturer?: string;
  price?: number;
  inStock?: boolean;
  image?: string | null;
  images?: string[];
  slug: string;
  featured?: boolean;
  checkout?: boolean;
  highlights?: string[];
  howToUse?: string;
  measuringParameters?: string;
};

type LiveCategory = {
  _id: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
};

type LiveOffer = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  productIds?: string[];
  banner?: { secureUrl?: string };
  createdAt: string;
};

type LiveEvent = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  startAt?: string;
  createdAt: string;
  location?: string;
  cover?: { secureUrl?: string };
};

type LiveJob = {
  _id: string;
  slug: string;
  title: string;
  location: string;
  employmentType?: string;
  department?: string;
  summary: string;
  description?: string;
  requirements?: string;
  image?: { secureUrl?: string } | null;
};

export type LiveInstallation = {
  _id: string;
  slug: string;
  title: string;
  facility?: string;
  location?: string;
  published?: boolean;
  body?: string;
  cover?: { secureUrl?: string };
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";
}

async function apiJson<T>(path: string): Promise<T | null> {
  "use cache";
  cacheLife("minutes");
  if (!catalogueApiSelected()) return null;
  try {
    const response = await fetch(accordApiPath(path));
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toProduct(item: LiveProduct): Product {
  const category = knownCategories.find((entry) => entry.slug === item.categoryId || entry.name === item.categoryName);
  const brand = knownBrands.find((entry) => entry.name === item.manufacturer);
  const price = Number(item.price) || 0;
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brandId: brand?.id || slugify(item.manufacturer || "manufacturer"),
    categoryId: category?.id || item.categoryId,
    shortDescription: item.description || `${item.name} from Microvision Enterprises Ltd.`,
    longDescription: item.details || item.description || item.name,
    images: [{ variant: "primary", alt: item.name }],
    photoUrl: publicAssetUrl(item.image),
    photos: [...new Set([item.image, ...(item.images || [])].filter(Boolean) as string[])]
      .map((url) => publicAssetUrl(url))
      .filter((url): url is string => Boolean(url))
      .map((url) => ({ url, caption: '' })),
    specs: [],
    features: Array.isArray(item.highlights)
      ? item.highlights.map((entry) => String(entry || "").trim()).filter(Boolean).slice(0, 8)
      : [],
    howToUse: item.howToUse || "",
    measuringParameters: item.measuringParameters || "",
    purchaseMode: item.checkout && price > 0 ? "both" : "quote",
    price: price > 0 ? price : undefined,
    currency: "KES",
    stockStatus: item.inStock ? "in_stock" : "on_request",
    stockIsPlaceholder: true,
    documents: [],
    relatedIds: [],
    accessoryNotes: [],
    tags: [],
    featured: item.featured,
    faqs: [],
  };
}

export async function liveProductBySlug(slug: string): Promise<Product | null> {
  if (!catalogueApiSelected()) return null;
  try {
    const response = await fetch(accordApiPath("/api/catalog"), { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as { catalog?: { products?: LiveProduct[] } };
    const item = (payload.catalog?.products || []).find((product) => product.slug === slug);
    return item ? toProduct(item) : null;
  } catch {
    return null;
  }
}

export async function liveCatalogue() {
  if (!catalogueApiSelected()) return null;
  const payload = await apiJson<{ catalog?: { products?: LiveProduct[]; categories?: LiveCategory[] } }>("/api/catalog");
  const products = (payload?.catalog?.products || []).map(toProduct);
  if (!products.length) return null;
  const categories: CategoryWithCount[] = (payload?.catalog?.categories || []).map((category) => {
    const known = knownCategories.find((entry) => entry.slug === category.slug || entry.name === category.name);
    return {
      id: known?.id || category.slug || category._id,
      slug: category.slug,
      name: category.name,
      icon: known?.icon || "flask",
      description: known?.description || category.description || "",
      count: category.count,
    };
  });
  const brandNames = new Map<string, number>();
  for (const product of products) brandNames.set(product.brandId, (brandNames.get(product.brandId) || 0) + 1);
  const brands: BrandWithCount[] = [...brandNames.entries()].map(([id, count]) => {
    const known = knownBrands.find((entry) => entry.id === id);
    return {
      id,
      slug: known?.slug || id,
      name: known?.name || id,
      description: "",
      count,
    };
  });
  const searchIndex: SearchHit[] = products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: brands.find((brand) => brand.id === product.brandId)?.name || "",
    category: categories.find((category) => category.id === product.categoryId)?.name || "",
    categoryId: product.categoryId,
  }));
  return { products, categories, brands, searchIndex };
}

export async function liveOffers(): Promise<Offer[] | null> {
  if (!catalogueApiSelected()) return null;
  const payload = await apiJson<{ data?: LiveOffer[] }>("/api/offers");
  const rows = payload?.data || [];
  if (!rows.length) return null;
  return rows.map((offer) => ({
    id: offer._id,
    slug: offer.slug,
    title: offer.title,
    summary: offer.description,
    startsAt: offer.startDate || offer.createdAt.slice(0, 10),
    expiresAt: offer.endDate || undefined,
    productIds: offer.productIds || [],
    bannerUrl: publicAssetUrl(offer.banner?.secureUrl),
  }));
}

export async function liveEvents(): Promise<CatalogueEvent[] | null> {
  if (!catalogueApiSelected()) return null;
  const payload = await apiJson<{ data?: LiveEvent[] }>("/api/events");
  if (!payload) return null;
  return (payload.data || []).map((event) => ({
    id: event._id,
    slug: event.slug,
    title: event.title,
    category: "Event" as const,
    date: (event.startAt || event.createdAt).slice(0, 10),
    location: event.location || "Nairobi",
    summary: event.description,
    body: event.description,
    coverUrl: publicAssetUrl(event.cover?.secureUrl),
  }));
}

export async function liveJobs(): Promise<Job[] | null> {
  if (!catalogueApiSelected()) return null;
  let payload: { data?: LiveJob[] } | null = null;
  try {
    const response = await fetch(accordApiPath("/api/jobs"), { cache: "no-store" });
    if (!response.ok) return null;
    payload = (await response.json()) as { data?: LiveJob[] };
  } catch {
    return null;
  }
  return (payload.data || []).map((job) => ({
    id: job._id,
    slug: job.slug,
    title: job.title,
    location: job.location,
    type: job.employmentType || job.department || "",
    department: job.department || "",
    closingDate: "",
    summary: job.summary,
    description: job.description || "",
    responsibilities: job.description ? job.description.split(/\n+/).filter(Boolean) : [],
    requirements: job.requirements ? job.requirements.split(/\n+/).filter(Boolean) : [],
    imageUrl: publicAssetUrl(job.image?.secureUrl),
  }));
}

function withPublicCover(item: LiveInstallation): LiveInstallation {
  const secureUrl = publicAssetUrl(item.cover?.secureUrl);
  if (!secureUrl || !item.cover) return item;
  return { ...item, cover: { ...item.cover, secureUrl } };
}

export async function liveInstallations(): Promise<LiveInstallation[]> {
  if (!catalogueApiSelected()) return [];
  const payload = await apiJson<{ data?: LiveInstallation[] }>("/api/installations");
  return (payload?.data || []).map(withPublicCover);
}

export async function liveInstallation(slug: string): Promise<LiveInstallation | null> {
  if (!catalogueApiSelected()) return null;
  const payload = await apiJson<{ data?: LiveInstallation }>(`/api/installations/${encodeURIComponent(slug)}`);
  return payload?.data ? withPublicCover(payload.data) : null;
}
