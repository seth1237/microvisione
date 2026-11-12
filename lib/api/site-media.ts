import "server-only";

import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";
import { isPartnerLogo, partnerDisplayName } from "@/lib/platform/partner-logos";

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
  const [rows, partners] = await Promise.all([
    listed<PublicManufacturer>("/api/manufacturers"),
    partnerLogos(),
  ]);
  const direct = rows.flatMap((item) => {
    const logoUrl = publicAssetUrl(item.logoUrl);
    return logoUrl && item.name ? [{ ...item, logoUrl }] : [];
  });
  const names = new Set(direct.map((item) => item.name.toLowerCase()));
  return [...direct, ...partners.filter((item) => !names.has(item.name.toLowerCase()))];
}

async function partnerLogos(): Promise<PublicManufacturer[]> {
  if (!catalogueApiSelected()) return [];
  try {
    const response = await fetch(accordApiPath("/api/certifications"), { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: Array<{ id?: string; name?: string; purpose?: string; imageUrl?: string }> };
    return (payload.data || []).flatMap((item) => {
      if (!isPartnerLogo(item)) return [];
      const name = partnerDisplayName(item.name || "");
      const logoUrl = publicAssetUrl(item.imageUrl);
      return logoUrl && name && item.id ? [{ id: item.id, name, logoUrl }] : [];
    });
  } catch {
    return [];
  }
}

export async function liveGallery(): Promise<PublicGalleryPhoto[]> {
  const rows = await listed<PublicGalleryPhoto>("/api/gallery");
  return rows.flatMap((item) => {
    const imageUrl = publicAssetUrl(item.imageUrl);
    return imageUrl ? [{ ...item, caption: item.caption || "", imageUrl }] : [];
  });
}
