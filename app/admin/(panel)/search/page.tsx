export const instant = false

import { AdminSearchReport } from '@/components/admin/admin-search-report'
import { emptySearchReport } from '@/lib/platform/search-analytics'
import { getSearchReport } from '@/lib/platform/site-data'


export default async function AdminSearchPage() {
  const report = await getSearchReport({ period: 'daily' }).catch(() => emptySearchReport('daily'))
  return <AdminSearchReport initial={report} />
}
