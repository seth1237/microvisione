import "server-only";

import { cacheLife } from "next/cache";
import { certificates, jobs, services } from "@/data/content";
import { offers } from "@/data/offers";
import { products } from "@/data/products";
import { liveEvents, liveJobs, liveOffers } from "@/lib/api/live-catalogue";
import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";
import type { CatalogueEvent, Job, Offer, Product } from "@/types";

async function staticOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  return offers;
}

export async function getOffers(): Promise<Offer[]> {
  const live = await liveOffers().catch(() => null);
  if (live) return live;
  return staticOffers();
}

export async function getOfferProducts(offer: Offer): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return offer.productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

export async function getEvents(): Promise<CatalogueEvent[]> {
  const live = await liveEvents().catch(() => null);
  if (live) return live.filter((event) => !event.isPlaceholder);
  return [];
}

export async function getEventBySlug(slug: string): Promise<CatalogueEvent | null> {
  const list = await getEvents();
  return list.find((event) => event.slug === slug) ?? null;
}

export async function getServices() {
  "use cache";
  cacheLife("hours");
  return services;
}

export async function getCompanyProfilePages() {
  "use cache";
  cacheLife("minutes");
  if (!catalogueApiSelected()) return [];
  try {
    const response = await fetch(accordApiPath("/api/company-profile"));
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      data?: Array<{ _id: string; title: string; body: string; image?: { secureUrl?: string } | null; published?: boolean }>;
    };
    return (payload.data || [])
      .filter((page) => page.published !== false && page.title)
      .map((page) => ({
        id: page._id,
        title: page.title,
        body: page.body || "",
        imageUrl: publicAssetUrl(page.image?.secureUrl),
      }));
  } catch {
    return [];
  }
}

export async function getCertificates() {
  "use cache";
  cacheLife("hours");
  return certificates;
}

async function staticJobs() {
  "use cache";
  cacheLife("hours");
  return jobs;
}

export async function getJobs(): Promise<Job[]> {
  const live = await liveJobs().catch(() => null);
  if (live) return live;
  return staticJobs();
}

export async function getJobBySlug(slug: string) {
  const list = await getJobs();
  return list.find((job) => job.slug === slug) ?? null;
}

