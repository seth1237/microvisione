export const instant = false

import { AdminCompanyProfilePdf } from '@/components/admin/admin-company-profile-pdf'
import { AdminRecordsPanel } from '@/components/admin/admin-records-panel'
import { listCompanyProfilePages } from '@/lib/platform/site-data'


export default async function AdminCompanyProfilePage() {
  const items = await listCompanyProfilePages(false).catch(() => [])
  return (
    <>
      <AdminCompanyProfilePdf pageCount={items.length} />
      <AdminRecordsPanel
        title="Company profile"
        itemLabel="profile page"
        endpoint="/api/admin/company-profile"
        subtitle="These pages appear as a flip-book on /about.html. Upload a PDF above, or edit pages one at a time."
        imageField="image"
        items={items}
        fields={[
          { name: 'title', label: 'Page title', required: false },
          { name: 'order', label: 'Page order', placeholder: '1, 2, 3…' },
          { name: 'body', label: 'Page text', type: 'textarea', rows: 8 },
          { name: 'image', label: 'Page image', type: 'file' },
          { name: 'published', label: 'Published', type: 'checkbox' },
        ]}
      />
    </>
  )
}
