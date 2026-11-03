/** Kenyan mobile numbers: 07xx / 01xx, or +254 / 254 equivalents. */

export function normalizeKenyanPhone(input: string): string | null {
  const compact = input.replace(/[\s()-]/g, "");
  const match = compact.match(/^(?:\+?254|0)([71]\d{8})$/);
  if (!match) return null;
  return `+254${match[1]}`;
}

export function isKenyanPhone(input: string): boolean {
  return normalizeKenyanPhone(input) !== null;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
