export const instant = false

import { AdminClientInterestPanel } from '@/components/admin/admin-client-interest-panel'
import { listClientInterestBoard, listQuoteEnquiries } from '@/lib/platform/site-data'

type Enquiry = {
  _id: string
  name: string
  organisation?: string
  phone: string
  email?: string
  location?: string
  products?: string
  notes?: string
  reference?: string
  createdAt?: string
}

export default async function AdminClientInterestPage() {
  const [rows, enquiries] = await Promise.all([
    listClientInterestBoard().catch(() => []),
    listQuoteEnquiries<Enquiry>().catch(() => []),
  ])
  return <AdminClientInterestPanel rows={rows} enquiries={enquiries} />
}
