export const instant = false

import { AdminManufacturersPanel } from '@/components/admin/admin-manufacturers-panel'
import { listManufacturers } from '@/lib/platform/site-data'


export default async function AdminManufacturersPage() {
  const items = await listManufacturers().catch(() => [])
  return <AdminManufacturersPanel items={items} />
}
