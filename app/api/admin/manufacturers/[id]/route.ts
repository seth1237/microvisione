import { accordApiPath } from "@/lib/platform/backend-url"
import { isPartnerLogo } from "@/lib/platform/partner-logos"

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const cookie = request.headers.get("cookie") || ""
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)
  const primary = await fetch(accordApiPath(`/api/admin/manufacturers/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers,
    cache: "no-store",
  })
  if (primary.status !== 404) {
    const type = primary.headers.get("content-type")
    return new Response(await primary.arrayBuffer(), {
      status: primary.status,
      headers: type ? { "content-type": type } : undefined,
    })
  }

  const listed = await fetch(accordApiPath("/api/admin/certifications"), {
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  })
  const payload = listed.ok
    ? await listed.json().catch(() => ({})) as { data?: Array<{ _id?: string; purpose?: string; name?: string }> }
    : {}
  const partner = (payload.data || []).find((item) => item._id === id && isPartnerLogo(item))
  if (!partner) {
    const type = primary.headers.get("content-type")
    return new Response(await primary.arrayBuffer(), {
      status: primary.status,
      headers: type ? { "content-type": type } : undefined,
    })
  }
  const removed = await fetch(accordApiPath(`/api/admin/certifications/${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: cookie ? { cookie } : {},
    cache: "no-store",
  })
  if (!removed.ok) return Response.json({ success: false, message: "Could not delete the manufacturer" }, { status: removed.status })
  return Response.json({ success: true })
}
