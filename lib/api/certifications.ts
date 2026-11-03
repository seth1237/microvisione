import "server-only";

import { cacheLife } from "next/cache";
import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";

export type PublicCertification = {
  id: string;
  name: string;
  imageUrl: string;
};

export async function liveCertifications(): Promise<PublicCertification[]> {
  "use cache";
  cacheLife("minutes");
  if (!catalogueApiSelected()) return [];
  try {
    const response = await fetch(accordApiPath("/api/certifications"));
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: PublicCertification[] };
    return (payload.data || []).flatMap((item) => {
      const imageUrl = publicAssetUrl(item.imageUrl);
      return imageUrl && item.name ? [{ ...item, imageUrl }] : [];
    });
  } catch {
    return [];
  }
}
