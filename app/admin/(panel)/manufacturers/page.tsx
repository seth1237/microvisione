export const instant = false

import { AdminManufacturersPanel } from '@/components/admin/admin-manufacturers-panel'
import { getBrands } from '@/lib/api/products'
import type { ManufacturerSubmission } from '@/lib/platform/content'
import { listManufacturers } from '@/lib/platform/site-data'

function matchKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function withCatalogueBrands(items: ManufacturerSubmission[], brands: Awaited<ReturnType<typeof getBrands>>) {
  const names = new Set(items.map((item) => matchKey(item.companyName)))
  const catalogue = brands.flatMap((brand) => {
    const companyName = brand.name.trim()
    if (!companyName || /tbc/i.test(companyName) || names.has(matchKey(companyName))) return []
    const row: ManufacturerSubmission = {
      _id: `catalogue:${brand.id}`,
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
  const [items, brands] = await Promise.all([
    listManufacturers().catch(() => []),
    getBrands().catch(() => []),
  ])
  return <AdminManufacturersPanel items={withCatalogueBrands(items, brands)} />
}
