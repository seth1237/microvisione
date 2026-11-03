import "server-only";

import { accordApiPath, catalogueApiSelected, publicAssetUrl } from "@/lib/platform/backend-url";

export type PublicCertification = {
  id: string;
  name: string;
  purpose: string;
  imageUrl: string;
};

export async function liveCertifications(): Promise<PublicCertification[]> {
  if (!catalogueApiSelected()) return [];
  try {
    const response = await fetch(accordApiPath("/api/certifications"), { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: PublicCertification[] };
    return (payload.data || []).flatMap((item) => {
      const imageUrl = publicAssetUrl(item.imageUrl);
      return imageUrl && item.name ? [{ ...item, purpose: item.purpose || "", imageUrl }] : [];
    });
  } catch {
    return [];
  }
}
