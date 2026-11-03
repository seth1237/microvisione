import "server-only";

import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";

export type PublicManufacturer = {
  id: string;
  name: string;
  logoUrl: string;
};

export type PublicGalleryPhoto = {
  id: string;
  caption: string;
  imageUrl: string;
};

async function listed<T>(path: string): Promise<T[]> {
  if (!catalogueApiSelected()) return [];
  try {
    const response = await fetch(accordApiPath(path), { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: T[] };
    return payload.data || [];
  } catch {
    return [];
  }
}

export async function liveManufacturers(): Promise<PublicManufacturer[]> {
  const rows = await listed<PublicManufacturer>("/api/manufacturers");
  return rows.flatMap((item) => {
    const logoUrl = publicAssetUrl(item.logoUrl);
    return logoUrl && item.name ? [{ ...item, logoUrl }] : [];
  });
}

export async function liveGallery(): Promise<PublicGalleryPhoto[]> {
  const rows = await listed<PublicGalleryPhoto>("/api/gallery");
  return rows.flatMap((item) => {
    const imageUrl = publicAssetUrl(item.imageUrl);
    return imageUrl ? [{ ...item, caption: item.caption || "", imageUrl }] : [];
  });
}
