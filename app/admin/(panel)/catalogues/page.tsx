export const instant = false

import { AdminCataloguesPanel } from '@/components/admin/admin-catalogues-panel'
import { catalogueAnalytics, getCatalog } from '@/lib/platform/site-data'


export default async function AdminCataloguesPage() {
  const [analytics, catalog] = await Promise.all([
    catalogueAnalytics().catch(() => ({ total: 0, catalogues: [], recent: [] })),
    getCatalog(),
  ])
  return (
    <AdminCataloguesPanel
      catalogues={analytics.catalogues}
      total={analytics.total}
      products={catalog.products || []}
    />
  )
}
