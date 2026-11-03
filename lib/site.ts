/**
 * Public company facts.
 * Email and opening hours are placeholders until Microvision confirms them.
 * TODO: replace email and hours with approved details.
 */

export const site = {
  name: "Microvision Enterprises Ltd",
  shortName: "Microvision",
  positioning:
    "Trusted medical and laboratory equipment suppliers in Kenya, covering diagnostic and therapeutic devices, analyzers, microscopes, patient monitoring and lab solutions, sourced from leading global manufacturers, with after-sales service and support.",
  phoneDisplay: "0790 669 988",
  phoneTel: "+254790669988",
  whatsappUrl: "https://wa.me/254790669988",
  email: "enquiries@microvisione.com",
  emailIsPlaceholder: true,
  address: {
    line1: "Loipi Plaza, Lunga Lunga Road",
    locality: "Industrial Area, Nairobi, Kenya",
    full: "Loipi Plaza, Lunga Lunga Road, Industrial Area, Nairobi, Kenya",
    mapsHref:
      "https://www.google.com/maps/search/?api=1&query=Loipi%20Plaza%20Lunga%20Lunga%20Road%20Industrial%20Area%20Nairobi",
  },
  hours: [
    { label: "Monday–Friday", value: "8:00–17:00 EAT" },
    { label: "Saturday", value: "8:00–13:00 EAT" },
  ],
  hoursArePlaceholder: true,
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.microvisione.com",
  locale: "en_KE",
  currency: "KES" as const,
  /** Fixed as-of date for sample warranty flags. Not the live clock. */
  catalogueAsOf: "2026-10-29",
};

export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function whatsAppHref(message: string): string {
  return `${site.whatsappUrl}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(input: {
  name: string;
  quantity: number;
  path: string;
}): string {
  return `Hello Microvision Enterprises Ltd, I would like to order or enquire about ${input.name}. Quantity: ${input.quantity}. Link: ${absoluteUrl(input.path)}`;
}
