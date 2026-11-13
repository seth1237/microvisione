import "server-only"

import { accordApiPath } from "@/lib/platform/backend-url"
import { hiddenManufacturerDisplayName, hiddenManufacturerStorageName, manufacturerKey } from "@/lib/platform/partner-logos"

const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
)

type CertificationRecord = { _id?: string; name?: string | null }

async function adminCertifications(cookie: string) {
  const response = await fetch(accordApiPath("/api/admin/certifications"), {
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  }).catch(() => null)
  if (!response?.ok) return []
  const payload = await response.json().catch(() => ({})) as { data?: CertificationRecord[] }
  return payload.data || []
}

export async function rememberHiddenManufacturer(cookie: string, name: string) {
  const companyName = name.trim()
  if (!companyName) return { ok: false, status: 400, message: "Manufacturer name is required" }
  const key = manufacturerKey(companyName)
  const existing = await adminCertifications(cookie)
  if (existing.some((item) => manufacturerKey(hiddenManufacturerDisplayName(item.name)) === key)) {
    return { ok: true, status: 200, message: "" }
  }
  const body = new FormData()
  body.set("name", hiddenManufacturerStorageName(companyName))
  body.set("purpose", "Hidden manufacturer")
  body.set("logo", new File([new Uint8Array(PIXEL)], "logo.png", { type: "image/png" }))
  const response = await fetch(accordApiPath("/api/admin/certifications"), {
    method: "POST",
    headers: cookie ? { cookie } : {},
    body,
    cache: "no-store",
  }).catch(() => null)
  if (!response) return { ok: false, status: 503, message: "Could not reach the catalogue API" }
  const payload = await response.json().catch(() => ({})) as { message?: string }
  return { ok: response.ok, status: response.status, message: payload.message || "" }
}

export async function clearHiddenManufacturer(cookie: string, name: string) {
  const key = manufacturerKey(name)
  if (!key) return
  const existing = await adminCertifications(cookie)
  await Promise.all(existing.flatMap((item) => {
    if (!item._id || manufacturerKey(hiddenManufacturerDisplayName(item.name)) !== key) return []
    return [fetch(accordApiPath(`/api/admin/certifications/${encodeURIComponent(item._id)}`), {
      method: "DELETE",
      headers: cookie ? { cookie } : {},
      cache: "no-store",
    }).catch(() => undefined)]
  }))
}
