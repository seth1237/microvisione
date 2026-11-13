export const instant = false

import { AdminManufacturersPanel } from '@/components/admin/admin-manufacturers-panel'
import { getBrands } from '@/lib/api/products'
import type { ManufacturerSubmission } from '@/lib/platform/content'
import { manufacturerKey } from '@/lib/platform/partner-logos'
import { hiddenAdminManufacturerKeys, listManufacturers } from '@/lib/platform/site-data'

function withCatalogueBrands(items: ManufacturerSubmission[], brands: Awaited<ReturnType<typeof getBrands>>, hidden: Set<string>) {
  const names = new Set(items.map((item) => manufacturerKey(item.companyName)))
  const catalogue = brands.flatMap((brand) => {
    const companyName = brand.name.trim()
    if (!companyName || /tbc/i.test(companyName) || hidden.has(manufacturerKey(companyName)) || names.has(manufacturerKey(companyName))) return []
    const row: ManufacturerSubmission = {
      _id: `catalogue-${brand.id}`,
      companyName,
      contactName: '',
      email: '',
      phone: '',
      website: '',
      productsOfInterest: brand.count > 0 ? `${brand.count} in the catalogue` : '',
      notes: '',
      brochure: null,
      logo: null,
      status: 'approved',
      token: '',
      adminNote: '',
      createdAt: '',
      updatedAt: '',
    }
    return [row]
  })
  return [...items, ...catalogue].sort((a, b) => a.companyName.localeCompare(b.companyName))
}

export default async function AdminManufacturersPage() {
  const [items, brands, hidden] = await Promise.all([
    listManufacturers().catch(() => []),
    getBrands().catch(() => []),
    hiddenAdminManufacturerKeys().catch(() => new Set<string>()),
  ])
  return <AdminManufacturersPanel items={withCatalogueBrands(items, brands, hidden)} />
}
