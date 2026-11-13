export const PARTNER_LOGO_PURPOSE = "Manufacturer logo"

const MARK = "\u2060"

export function partnerStorageName(name: string) {
  const trimmed = name.trim()
  return trimmed.startsWith(MARK) ? trimmed : `${MARK}${trimmed}`
}

export function partnerDisplayName(name: string) {
  return name.startsWith(MARK) ? name.slice(MARK.length).trim() : name.trim()
}

export function isPartnerLogo(record: { purpose?: string | null; name?: string | null } | string | null | undefined) {
  if (!record) return false
  if (typeof record === "string") return record === PARTNER_LOGO_PURPOSE || record.startsWith(MARK)
  return record.purpose === PARTNER_LOGO_PURPOSE || (record.name || "").startsWith(MARK)
}

const HIDDEN = "deleted:"

export function manufacturerKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

export function hiddenManufacturerStorageName(name: string) {
  return `${MARK}${HIDDEN}${name.trim()}`
}

export function hiddenManufacturerDisplayName(stored?: string | null) {
  if (!stored) return ""
  const display = partnerDisplayName(stored)
  return display.toLowerCase().startsWith(HIDDEN) ? display.slice(HIDDEN.length).trim() : ""
}
