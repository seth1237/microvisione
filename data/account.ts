import type { AccountDocument, Machine, SampleOrder, Ticket } from "@/types";

// TODO: replace with real data from the signed-in customer's account.
// Every record below is sample interface content, not a real order or machine.

export const sampleOrders: SampleOrder[] = [
  {
    id: "mvo-1042",
    reference: "MVO-2026-1042",
    placedAt: "2026-10-20",
    status: "Received",
    payment: "M-Pesa",
    shipTo: "Example clinic, Nairobi",
    total: 4500,
    items: [
      {
        productId: "arkray-glucocard",
        name: "Arkray Glucocard",
        quantity: 1,
        unitPrice: 4500,
        priceIsPlaceholder: true,
      },
    ],
    isSample: true,
  },
  {
    id: "mvo-0988",
    reference: "MVO-2026-0988",
    placedAt: "2026-10-08",
    status: "Dispatched",
    payment: "Invoice",
    shipTo: "Example laboratory, Kisumu",
    total: 8500,
    items: [
      {
        productId: "fastep-hb-meter",
        name: "Fastep Hb Meter",
        quantity: 1,
        unitPrice: 8500,
        priceIsPlaceholder: true,
      },
    ],
    isSample: true,
  },
  {
    id: "mvo-0901",
    reference: "MVO-2026-0901",
    placedAt: "2026-09-12",
    status: "Delivered",
    payment: "Invoice",
    shipTo: "Example hospital, Mombasa",
    items: [
      {
        productId: "chem-400",
        name: "Chem 400",
        quantity: 1,
      },
    ],
    isSample: true,
  },
];

export const sampleMachines: Machine[] = [
  {
    id: "mach-chem-400",
    model: "Chem 400",
    serial: "Serial TBC-001",
    installDate: "2025-06-01",
    warrantyUntil: "2026-06-01",
    site: "Example laboratory, Nairobi",
    isSample: true,
  },
  {
    id: "mach-mx21i",
    model: "MX21i Microscope",
    serial: "Serial TBC-014",
    installDate: "2026-02-11",
    warrantyUntil: "2027-02-11",
    site: "Example clinic, Nakuru",
    isSample: true,
  },
];

export const sampleTickets: Ticket[] = [
  {
    id: "t-441",
    reference: "MVT-2026-441",
    subject: "Example: installation visit for Chem 400",
    status: "Open",
    openedAt: "2026-10-18",
    updatedAt: "2026-10-18",
    isSample: true,
  },
  {
    id: "t-390",
    reference: "MVT-2026-390",
    subject: "Example: microscope lamp query",
    status: "In progress",
    openedAt: "2026-09-30",
    updatedAt: "2026-10-11",
    isSample: true,
  },
  {
    id: "t-210",
    reference: "MVT-2026-210",
    subject: "Example: training date request",
    status: "Resolved",
    openedAt: "2026-07-02",
    updatedAt: "2026-07-20",
    isSample: true,
  },
];

export const sampleDocuments: AccountDocument[] = [
  {
    id: "inv-1042",
    title: "Invoice MVO-2026-1042",
    kind: "Invoice",
    issuedAt: "2026-10-20",
    href: "/docs/sample-invoice.txt",
    isSample: true,
  },
  {
    id: "etr-1042",
    title: "ETR receipt MVO-2026-1042",
    kind: "ETR receipt",
    issuedAt: "2026-10-20",
    href: "/docs/sample-etr.txt",
    isSample: true,
  },
  {
    id: "stmt-oct",
    title: "Statement — October 2026",
    kind: "Statement",
    issuedAt: "2026-10-28",
    href: "/docs/sample-statement.txt",
    isSample: true,
  },
];
