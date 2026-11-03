import type { Offer } from "@/types";

// TODO: replace with real promotions. These are example offers so the UI can show expiry.

export const offers: Offer[] = [
  {
    id: "meters",
    slug: "point-of-care-meters",
    title: "Point-of-care meters — example listing",
    summary:
      "Glucose meters currently shown with example prices. This is not a published discount. Ask for a quotation before you buy.",
    startsAt: "2026-10-01",
    expiresAt: "2026-12-20",
    productIds: ["arkray-glucocard", "blood-glucose-meter-bioland", "blood-sugar-machine"],
    isPlaceholder: true,
  },
  {
    id: "hemoglobin",
    slug: "hemoglobin-meters",
    title: "Hemoglobin meters — example prices",
    summary:
      "Fastep and HB Meter are listed with placeholder prices so the buy flow can be demonstrated. Confirm the figure on your quote or invoice.",
    startsAt: "2026-10-01",
    expiresAt: "2026-11-30",
    productIds: ["fastep-hb-meter", "hb-meter"],
    isPlaceholder: true,
  },
  {
    id: "year-end-quote",
    slug: "year-end-quotation",
    title: "Year-end quotation window",
    summary:
      "Example call for institutions planning analyzer purchases. No percentage saving is stated because none has been approved.",
    startsAt: "2026-10-15",
    expiresAt: "2027-01-15",
    productIds: ["chem-400", "ams-liasys", "mythic-18", "coag-4d"],
    isPlaceholder: true,
  },
];
