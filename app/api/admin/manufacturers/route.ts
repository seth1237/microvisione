import { accordApiPath } from "@/lib/platform/backend-url"
import { PARTNER_LOGO_PURPOSE, isPartnerLogo, partnerStorageName } from "@/lib/platform/partner-logos"

async function passThrough(response: Response) {
  const headers = new Headers()
  const type = response.headers.get("content-type")
  if (type) headers.set("content-type", type)
  return new Response(await response.arrayBuffer(), { status: response.status, headers })
}

async function forward(request: Request, path: string, body?: ArrayBuffer) {
  const headers = new Headers()
  const cookie = request.headers.get("cookie")
  const contentType = request.headers.get("content-type")
  if (cookie) headers.set("cookie", cookie)
  if (body && contentType) headers.set("content-type", contentType)
  return fetch(accordApiPath(path), {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  })
}

export async function GET(request: Request) {
  return passThrough(await forward(request, "/api/admin/manufacturers"))
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  const bytes = await request.arrayBuffer()
  const primary = await forward(request, "/api/admin/manufacturers", bytes)
  if (primary.status !== 404) return passThrough(primary)

  const form = await new Request("http://microvision.local/manufacturers", {
    method: "POST",
    headers: { "content-type": contentType },
    body: bytes,
  }).formData()
  const companyName = String(form.get("companyName") || "").trim()
  const logo = form.get("logo")
  if (!companyName) return Response.json({ success: false, message: "Enter the manufacturer name" }, { status: 400 })
  if (!(logo instanceof File) || logo.size === 0) return Response.json({ success: false, message: "Choose a logo image" }, { status: 400 })

  const fallback = new FormData()
  fallback.set("name", partnerStorageName(companyName))
  fallback.set("purpose", PARTNER_LOGO_PURPOSE)
  fallback.set("logo", logo, logo.name || "logo")
  const headers = new Headers()
  const cookie = request.headers.get("cookie")
  if (cookie) headers.set("cookie", cookie)
  const saved = await fetch(accordApiPath("/api/admin/certifications"), {
    method: "POST",
    headers,
    body: fallback,
    cache: "no-store",
  })
  const payload = await saved.json().catch(() => ({})) as { message?: string }
  if (!saved.ok) {
    return Response.json({ success: false, message: payload.message || "Could not add the manufacturer" }, { status: saved.status })
  }
  return Response.json({ success: true, data: payload })
}

export async function PATCH(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  const bytes = await request.arrayBuffer()
  const primary = await forward(request, "/api/admin/manufacturers", bytes)
  if (primary.status !== 404) return passThrough(primary)

  const form = await new Request("http://microvision.local/manufacturers", {
    method: "POST",
    headers: { "content-type": contentType },
    body: bytes,
  }).formData()
  const id = String(form.get("id") || "")
  const status = String(form.get("status") || "")
  const cookie = request.headers.get("cookie") || ""
  const existing = await partnerLogo(cookie, id)
  if (!existing) return passThrough(primary)
  if (status === "rejected") {
    const removed = await fetch(accordApiPath(`/api/admin/certifications/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers: { cookie },
      cache: "no-store",
    })
    if (!removed.ok) return Response.json({ success: false, message: "Could not update" }, { status: removed.status })
  }
  return Response.json({ success: true })
}

async function partnerLogo(cookie: string, id: string) {
  if (!cookie || !id) return null
  const response = await fetch(accordApiPath("/api/admin/certifications"), {
    headers: { cookie },
    cache: "no-store",
  })
  if (!response.ok) return null
  const payload = await response.json().catch(() => ({})) as { data?: Array<{ _id?: string; purpose?: string; name?: string }> }
  const item = (payload.data || []).find((entry) => entry._id === id)
  return item && isPartnerLogo(item) ? item : null
}
