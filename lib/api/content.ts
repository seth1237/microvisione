import "server-only";

import { cacheLife } from "next/cache";
import { certificates, jobs, services } from "@/data/content";
import { offers } from "@/data/offers";
import { products } from "@/data/products";
import { liveEvents, liveJobs, liveOffers } from "@/lib/api/live-catalogue";
import { accordApiPath, catalogueApiSelected } from "@/lib/platform/backend-url";
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

export async function getCompanyProfileDownload() {
  "use cache";
  cacheLife("minutes");
  if (!catalogueApiSelected()) return null;
  try {
    const response = await fetch(accordApiPath("/api/company-profile"));
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      download?: { available?: boolean; filename?: string } | null;
    };
    if (!payload.download?.available) return null;
    return {
      href: "/api/company-profile/download",
      filename: payload.download.filename || "company-profile.pdf",
    };
  } catch {
    return null;
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

