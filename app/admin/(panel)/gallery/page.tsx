export const instant = false

import { cookies } from 'next/headers'
import { AdminGalleryPanel } from '@/components/admin/admin-gallery-panel'
import { accordApiPath } from '@/lib/platform/backend-url'
import type { GalleryPhoto } from '@/lib/platform/content'

export default async function AdminGalleryPage() {
  const store = await cookies()
  const cookie = store.getAll().map((item) => `${item.name}=${item.value}`).join('; ')
  const response = await fetch(accordApiPath('/api/admin/gallery'), {
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null)
  const payload = response && response.ok ? await response.json().catch(() => null) : null
  const items = (payload?.data || []) as GalleryPhoto[]
  return <AdminGalleryPanel items={items} />
}
