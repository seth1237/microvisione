export const instant = false

import { AdminOffersPanel } from '@/components/admin/admin-offers-panel'
import { getFullCatalog, getOfferAnalytics, listOffers } from '@/lib/platform/site-data'


export default async function AdminOffersPage() {
  const [offers, catalog, stats] = await Promise.all([
    listOffers(false).catch(() => []),
    getFullCatalog().catch(() => ({ products: [], categories: [] })),
    getOfferAnalytics().catch(() => ({ clicks: 0, whatsapp: 0, products: [], events: [] })),
  ])
  return <AdminOffersPanel offers={offers} products={catalog.products} stats={stats} />
}
