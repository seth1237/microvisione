export const instant = false

import { AdminSettingsForm } from '@/components/admin/admin-settings-form'
import { getPriceVisibility } from '@/lib/platform/site-data'

export default async function AdminSettingsPage() {
  const showPrices = await getPriceVisibility()
  return <AdminSettingsForm showPrices={showPrices} />
}
