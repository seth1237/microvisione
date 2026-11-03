export const instant = false

import { AdminCatalogCreate } from '@/components/admin/admin-catalog-create'
import { AdminCatalogCsv } from '@/components/admin/admin-catalog-csv'
import { AdminProductsPanel } from '@/components/admin/admin-products-panel'
import { getFullCatalog, listCatalogues } from '@/lib/platform/site-data'

export default async function AdminProductsPage() {
  const [catalog, catalogues] = await Promise.all([
    getFullCatalog(),
    listCatalogues().catch(() => []),
  ])
  return (
    <>
      <AdminCatalogCsv />
      <AdminCatalogCreate categories={catalog.categories} />
      <AdminProductsPanel
        products={catalog.products}
        categories={catalog.categories}
        catalogues={catalogues}
        title="Products"
        subtitle="Drop photos onto a product, or open it to edit details, enable checkout for priced products, hide it, or delete it."
      />
    </>
  )
}
