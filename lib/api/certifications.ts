import "server-only";

import { cacheLife } from "next/cache";
import { accordApiPath } from "@/lib/platform/backend-url";

export type PublicCertification = {
  id: string;
  name: string;
  imageUrl: string;
};

export async function liveCertifications(): Promise<PublicCertification[]> {
  "use cache";
  cacheLife("minutes");
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) return [];
  try {
    const response = await fetch(accordApiPath("/api/certifications"));
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: PublicCertification[] };
    return (payload.data || []).filter((item) => item.imageUrl && item.name);
  } catch {
    return [];
  }
}
