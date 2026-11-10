import { cookies } from 'next/headers'
import { connection } from 'next/server'
import { accordApiPath } from '@/lib/platform/backend-url'
import {
  ADMIN_COOKIE,
  CUSTOMER_COOKIE,
  adminCookieOptions,
  authenticateAdmin,
  createAdminSessionValue,
  parseAdminSessionValue,
  parseCustomerSessionValue,
} from '@/lib/platform/auth-core'

export {
  ADMIN_COOKIE,
  CUSTOMER_COOKIE,
  adminCookieOptions,
  authenticateAdmin,
  createAdminSessionValue,
  createCustomerSessionValue,
  customerCookieOptions,
  ensureSeedAdmin,
  hashPassword,
  parseAdminSessionValue,
  parseCustomerSessionValue,
  verifyPassword,
} from '@/lib/platform/auth-core'

export async function setAdminSession(email: string) {
  const store = await cookies()
  store.set(ADMIN_COOKIE, createAdminSessionValue(email), adminCookieOptions())
}

export async function clearAdminSession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  await connection()
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  if (!token) return null
  const local = parseAdminSessionValue(token)
  if (local) return local
  // The login cookie is signed by the API. This site does not have that signing secret.
  try {
    const response = await fetch(accordApiPath('/api/auth/me'), {
      headers: { cookie: `${ADMIN_COOKIE}=${token}` },
      cache: 'no-store',
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { success?: boolean; email?: string }
    if (!payload.success || !payload.email) return null
    return { email: payload.email }
  } catch {
    return null
  }
}

export async function getCustomerSession(): Promise<{ id: string; phone: string; name: string } | null> {
  const store = await cookies()
  return parseCustomerSessionValue(store.get(CUSTOMER_COOKIE)?.value)
}
