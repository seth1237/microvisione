import type { CatalogueEvent } from "@/types";

// TODO: replace with real activities. Titles and venues are placeholders.

export const events: CatalogueEvent[] = [
  {
    id: "lab-showcase",
    slug: "nairobi-laboratory-showcase",
    title: "Laboratory equipment showcase",
    category: "Exhibition",
    date: "2026-11-18",
    location: "Nairobi — venue TBC",
    summary:
      "Example exhibition entry. Microvision expects to show selected analyzers. Stand number and hours are TBC.",
    body:
      "This listing is a placeholder so the events page has a realistic shape. It is not a confirmed invitation. When the exhibition is approved, this page should carry the venue, stand number, the instruments on display and a photo from the event.",
    isPlaceholder: true,
  },
  {
    id: "service-note",
    slug: "service-desk-note",
    title: "Service desk note",
    category: "Company news",
    date: "2026-10-02",
    location: "Loipi Plaza, Industrial Area",
    summary:
      "Example news item. How to book an installation or a service visit will be spelled out here once the process is approved.",
    body:
      "Placeholder copy. Customers can already call or WhatsApp 0790 669 988. A published service-desk process, including response targets, is TBC and should not be inferred from this note.",
    isPlaceholder: true,
  },
  {
    id: "user-morning",
    slug: "operator-morning",
    title: "Operator morning for laboratory staff",
    category: "Event",
    date: "2026-08-20",
    location: "Nairobi — venue TBC",
    summary:
      "Example past event. Attendance, photographs and the agenda are not on file for this page.",
    body:
      "Placeholder for a past training morning. Do not treat the date as a record of an event that has been verified for publication. Replace it with the approved activities archive.",
    isPlaceholder: true,
  },
];
