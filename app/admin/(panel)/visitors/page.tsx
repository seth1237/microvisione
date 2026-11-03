export const instant = false

import { redirect } from 'next/navigation'

export default function AdminVisitorsPage() {
  redirect('/admin/performance#visitors')
}
