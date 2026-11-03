import "server-only";

import { accordApiPath } from "@/lib/platform/backend-url";

export async function listPublicManufacturers(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await fetch(accordApiPath("/api/manufacturers"));
    if (!response.ok) return [];
    const body = (await response.json()) as { data?: { id: string; name: string }[] };
    return Array.isArray(body.data) ? body.data.filter((item) => item.name) : [];
  } catch {
    return [];
  }
}
