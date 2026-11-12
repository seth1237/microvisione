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
