const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Format a number as Kenyan shillings, e.g. KSh 12,500. Deterministic, no Intl. */
export function formatKes(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `KSh ${sign}${formatted}`;
}

/** Format an ISO date (YYYY-MM-DD or full ISO) without using the system clock. */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  const label = MONTHS[Number(month) - 1];
  if (!year || !label || !day) return iso;
  return `${Number(day)} ${label} ${year}`;
}

export function isPastIsoDate(iso: string, asOf: string): boolean {
  return iso.slice(0, 10) < asOf.slice(0, 10);
}

export function makeReference(prefix: "MVQ" | "MVO" | "MVS" | "MVT" | "MVC"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${suffix}`;
}
