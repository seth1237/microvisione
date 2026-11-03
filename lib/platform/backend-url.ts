export const LOCAL_ACCORD_API_URL = 'http://127.0.0.1:4000'
export const DEPLOYED_ACCORD_API_URL = 'https://micro.codewithseth.co.ke'
export const DEFAULT_ACCORD_API_URL = LOCAL_ACCORD_API_URL

function isLocalHost(hostname: string) {
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
}

function normalizeApiUrl(url: string) {
  const trimmed = url.trim().replace(/\/$/, '')
  if (!trimmed) return ''
  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname === 'localhost' || parsed.hostname === '::1') {
      parsed.hostname = '127.0.0.1'
    }
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return trimmed
  }
}

function envApiUrl() {
  return normalizeApiUrl(process.env.MICROVISION_API_URL || process.env.ACCORD_API_URL || '')
}

function productionRuntime() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
}

export function accordApiUrl() {
  const fromEnv = envApiUrl()
  if (fromEnv) {
    try {
      if (!(productionRuntime() && isLocalHost(new URL(fromEnv).hostname))) return fromEnv
    } catch {
      return fromEnv
    }
  }
  return productionRuntime() ? DEPLOYED_ACCORD_API_URL : LOCAL_ACCORD_API_URL
}

/** The public site reads the catalogue from the API. MySQL on this process is not required. */
export function catalogueApiSelected() {
  if (process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE) return true
  try {
    return !isLocalHost(new URL(accordApiUrl()).hostname)
  } catch {
    return false
  }
}

export function publicAssetUrl(value: string | null | undefined) {
  const url = String(value || '').trim()
  if (!url) return undefined
  if (/^(https?:|data:|blob:)/i.test(url)) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${accordApiUrl()}${url}`
  return url
}

export function accordApiPath(path: string) {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${accordApiUrl()}${suffix}`
}
