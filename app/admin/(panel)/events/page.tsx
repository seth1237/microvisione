export const instant = false

import { AdminEventsPanel } from '@/components/admin/admin-events-panel'
import { listEvents } from '@/lib/platform/site-data'


export default async function AdminEventsPage() {
  const items = await listEvents(false).catch(() => [])
  return <AdminEventsPanel items={items} />
}
