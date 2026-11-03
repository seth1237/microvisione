export const instant = false

import { AdminJobsPanel } from '@/components/admin/admin-jobs-panel'
import { listJobApplications, listJobs } from '@/lib/platform/site-data'


export default async function AdminJobsPage() {
  const [jobs, applications] = await Promise.all([
    listJobs(false).catch(() => []),
    listJobApplications().catch(() => []),
  ])
  return <AdminJobsPanel jobs={jobs} applications={applications} />
}
