export const instant = false

import { cookies } from 'next/headers'
import { AdminCertificationPanel } from '@/components/admin/admin-certification-panel'
import { accordApiPath } from '@/lib/platform/backend-url'
import type { CertificationLogo } from '@/lib/platform/content'

export default async function AdminCertificationPage() {
  const store = await cookies()
  const cookie = store.getAll().map((item) => `${item.name}=${item.value}`).join('; ')
  const response = await fetch(accordApiPath('/api/admin/certifications'), {
    headers: cookie ? { cookie } : {},
    cache: 'no-store',
  }).catch(() => null)
  const payload = response && response.ok ? await response.json().catch(() => null) : null
  const items = (payload?.data || []) as CertificationLogo[]
  return <AdminCertificationPanel items={items} />
}
