export const instant = false

import { AdminCheckoutPanel } from '@/components/admin/admin-checkout-panel'
import { getFullCatalog, listCheckoutOrders } from '@/lib/platform/site-data'


export default async function AdminCheckoutPage() {
  const [catalog, orders] = await Promise.all([
    getFullCatalog(),
    listCheckoutOrders().catch(() => []),
  ])
  return <AdminCheckoutPanel products={catalog.products} orders={orders} />
}
