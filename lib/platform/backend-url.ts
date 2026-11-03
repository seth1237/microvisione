export const LOCAL_ACCORD_API_URL = 'http://127.0.0.1:4000'
export const DEPLOYED_ACCORD_API_URL = ''
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

export function accordApiUrl() {
  const fromEnv = envApiUrl()
  if (process.env.NODE_ENV === 'production') {
    if (fromEnv) {
      try {
        if (!isLocalHost(new URL(fromEnv).hostname)) return fromEnv
      } catch {
        return fromEnv
      }
    }
    return fromEnv || LOCAL_ACCORD_API_URL
  }
  return fromEnv || LOCAL_ACCORD_API_URL
}

export function accordApiPath(path: string) {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${accordApiUrl()}${suffix}`
}
