export const instant = false

import { AdminCompanyProfilePdf } from '@/components/admin/admin-company-profile-pdf'
import { getCompanyProfileDownload } from '@/lib/platform/site-data'

export default async function AdminCompanyProfilePage() {
  const filename = await getCompanyProfileDownload(true).catch(() => null)
  return <AdminCompanyProfilePdf filename={filename || ''} />
}
