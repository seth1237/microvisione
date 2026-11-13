import "server-only";

import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";
import { hiddenManufacturerDisplayName, isPartnerLogo, manufacturerKey, partnerDisplayName } from "@/lib/platform/partner-logos";

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

type CertificationRow = { id?: string; name?: string; purpose?: string; imageUrl?: string }

async function certificationRows(): Promise<CertificationRow[]> {
  if (!catalogueApiSelected()) return [];
  try {
    const response = await fetch(accordApiPath("/api/certifications"), { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: CertificationRow[] };
    return payload.data || [];
  } catch {
    return [];
  }
}

export async function hiddenManufacturerKeys(): Promise<Set<string>> {
  const rows = await certificationRows();
  return new Set(rows.flatMap((item) => {
    const name = hiddenManufacturerDisplayName(item.name);
    return name ? [manufacturerKey(name)] : [];
  }));
}

export async function liveManufacturers(): Promise<PublicManufacturer[]> {
  const [rows, certifications] = await Promise.all([
    listed<PublicManufacturer>("/api/manufacturers"),
    certificationRows(),
  ]);
  const hidden = new Set(certifications.flatMap((item) => {
    const name = hiddenManufacturerDisplayName(item.name);
    return name ? [manufacturerKey(name)] : [];
  }));
  const partners = certifications.flatMap((item) => {
    if (!isPartnerLogo(item) || hiddenManufacturerDisplayName(item.name)) return [];
    const name = partnerDisplayName(item.name || "");
    const logoUrl = publicAssetUrl(item.imageUrl);
    return logoUrl && name && item.id && !hidden.has(manufacturerKey(name)) ? [{ id: item.id, name, logoUrl }] : [];
  });
  const direct = rows.flatMap((item) => {
    const logoUrl = publicAssetUrl(item.logoUrl);
    if (!logoUrl || !item.name || hidden.has(manufacturerKey(item.name))) return [];
    return [{ ...item, logoUrl }];
  });
  const names = new Set(direct.map((item) => item.name.toLowerCase()));
  return [...direct, ...partners.filter((item) => !names.has(item.name.toLowerCase()))];
}

export async function liveGallery(): Promise<PublicGalleryPhoto[]> {
  const rows = await listed<PublicGalleryPhoto>("/api/gallery");
  return rows.flatMap((item) => {
    const imageUrl = publicAssetUrl(item.imageUrl);
    return imageUrl ? [{ ...item, caption: item.caption || "", imageUrl }] : [];
  });
}
