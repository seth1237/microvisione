import "server-only"

import { accordApiPath } from "@/lib/platform/backend-url"
import { rememberHiddenManufacturer } from "@/lib/api/hidden-manufacturers"
import { hiddenManufacturerDisplayName, isPartnerLogo } from "@/lib/platform/partner-logos"

export function isCatalogueManufacturerId(id: string) {
  return id.startsWith("catalogue:") || id.startsWith("catalogue-")
}

export async function deleteManufacturerRecord(request: Request, id: string) {
  const name = new URL(request.url).searchParams.get("name")?.trim() || ""
  const cookie = request.headers.get("cookie") || ""
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)

  if (id && !isCatalogueManufacturerId(id)) {
    await fetch(accordApiPath(`/api/admin/manufacturers/${encodeURIComponent(id)}`), {
      method: "DELETE",
      headers,
      cache: "no-store",
    }).catch(() => undefined)

    const listed = await fetch(accordApiPath("/api/admin/certifications"), {
      headers,
      cache: "no-store",
    })
    const payload = listed.ok
      ? await listed.json().catch(() => ({})) as { data?: Array<{ _id?: string; purpose?: string; name?: string }> }
      : {}
    const partner = (payload.data || []).find((item) => item._id === id && isPartnerLogo(item) && !hiddenManufacturerDisplayName(item.name))
    if (partner) {
      await fetch(accordApiPath(`/api/admin/certifications/${encodeURIComponent(id)}`), {
        method: "DELETE",
        headers,
        cache: "no-store",
      }).catch(() => undefined)
    }
  }

  if (!name) {
    return Response.json({ success: false, message: "Manufacturer name is required" }, { status: 400 })
  }
  const hidden = await rememberHiddenManufacturer(cookie, name)
  if (!hidden.ok) {
    return Response.json({ success: false, message: hidden.message || "Could not delete the manufacturer" }, { status: hidden.status || 500 })
  }
  return Response.json({ success: true })
}
