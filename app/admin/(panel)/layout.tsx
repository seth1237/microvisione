import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { getAdminSession } from '@/lib/platform/auth'

export const instant = false

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return <AdminShell email={session.email}>{children}</AdminShell>
}
