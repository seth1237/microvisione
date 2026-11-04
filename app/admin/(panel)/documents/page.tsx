export const instant = false

import { cookies } from "next/headers";
import { AdminDocumentsPanel } from "@/components/admin/admin-documents-panel";
import { accordApiPath } from "@/lib/platform/backend-url";

type AccountDocument = {
  id: string;
  title: string;
  filename: string;
  createdAt: string;
  email?: string;
};

export default async function AdminDocumentsPage() {
  const store = await cookies();
  const cookie = store.getAll().map((item) => `${item.name}=${item.value}`).join("; ");
  const response = await fetch(accordApiPath("/api/admin/account-documents"), {
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  }).catch(() => null);
  const payload = response && response.ok ? await response.json().catch(() => null) : null;
  const items = (payload?.data || []) as AccountDocument[];
  return <AdminDocumentsPanel items={items} />;
}
