import { accordApiPath } from "@/lib/platform/backend-url"
import { PARTNER_LOGO_PURPOSE, isPartnerLogo, partnerStorageName } from "@/lib/platform/partner-logos"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const contentType = request.headers.get("content-type") || ""
  const cookie = request.headers.get("cookie") || ""
  const bytes = await request.arrayBuffer()
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)
  if (contentType) headers.set("content-type", contentType)
  const primary = await fetch(accordApiPath(`/api/admin/manufacturers/${encodeURIComponent(id)}/logo`), {
    method: "POST",
    headers,
    body: bytes,
    cache: "no-store",
  })
  if (primary.status !== 404) {
    const type = primary.headers.get("content-type")
    return new Response(await primary.arrayBuffer(), {
      status: primary.status,
      headers: type ? { "content-type": type } : undefined,
    })
  }

  const form = await new Request("http://microvision.local/logo", {
    method: "POST",
    headers: { "content-type": contentType },
    body: bytes,
  }).formData()
  const logo = form.get("logo")
  if (!(logo instanceof File) || logo.size === 0) {
    return Response.json({ success: false, message: "Choose a logo image" }, { status: 400 })
  }
  const listed = await fetch(accordApiPath("/api/admin/certifications"), {
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  })
  const payload = listed.ok ? await listed.json().catch(() => ({})) as { data?: Array<{ _id?: string; name?: string; purpose?: string }> } : {}
  const existing = (payload.data || []).find((item) => item._id === id && isPartnerLogo(item))
  if (!existing?.name) {
    return Response.json({ success: false, message: "Could not save the logo" }, { status: 404 })
  }

  const fallback = new FormData()
  fallback.set("name", partnerStorageName(existing.name))
  fallback.set("purpose", PARTNER_LOGO_PURPOSE)
  fallback.set("logo", logo, logo.name || "logo")
  const saved = await fetch(accordApiPath("/api/admin/certifications"), {
    method: "POST",
    headers: cookie ? { cookie } : {},
    body: fallback,
    cache: "no-store",
  })
  if (!saved.ok) {
    const error = await saved.json().catch(() => ({})) as { message?: string }
    return Response.json({ success: false, message: error.message || "Could not save the logo" }, { status: saved.status })
  }
  await fetch(accordApiPath(`/api/admin/certifications/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  }).catch(() => undefined)
  return Response.json({ success: true })
}
