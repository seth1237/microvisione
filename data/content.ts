import type { Certificate, Job, ServiceOffering } from "@/types";

// TODO: replace with real data — services copy, vacancies, and certificates are placeholders.

export const services: ServiceOffering[] = [
  {
    id: "installation",
    slug: "installation",
    name: "Installation and commissioning",
    summary: "Placement, setup and handover of equipment at your facility.",
    points: [
      "Site requirements are confirmed before delivery.",
      "Commissioning steps are agreed per model — a standard checklist is TBC.",
      "User handover is arranged with the installing engineer.",
    ],
  },
  {
    id: "maintenance",
    slug: "maintenance",
    name: "Maintenance and service contracts",
    summary: "Planned visits and breakdown cover for laboratories that want a contract.",
    points: [
      "Contract length and response times are quoted per site.",
      "Parts availability depends on the manufacturer — lead times are TBC.",
      "Cover can be requested for equipment Microvision supplied.",
    ],
  },
  {
    id: "calibration",
    slug: "calibration",
    name: "Calibration",
    summary: "Calibration arranged against the method the manufacturer specifies.",
    points: [
      "Intervals are confirmed per instrument, not published as a single rule.",
      "Certificates of calibration are issued when the work is completed.",
      "On-site or workshop calibration is agreed on the service request.",
    ],
  },
  {
    id: "training",
    slug: "training",
    name: "Training",
    summary: "Operator training for the team that will run the instrument.",
    points: [
      "Sessions can be requested with installation or booked later.",
      "Course outlines are TBC until the manufacturer material is approved.",
      "Training is aimed at laboratory and clinical staff, not the general public.",
    ],
  },
  {
    id: "biomedical",
    slug: "biomedical-support",
    name: "Biomedical engineering support",
    summary: "After-sales technical support for equipment in the Microvision catalogue.",
    points: [
      "Fault reporting starts with the model, serial number and a short description.",
      "Repair versus replacement is confirmed after inspection.",
      "This page does not publish uptime or response statistics.",
    ],
  },
];

export const certificates: Certificate[] = [
  {
    id: "incorporation",
    name: "Certificate of incorporation",
    issuer: "Registrar — details TBC",
    reference: "Reference TBC",
    isPlaceholder: true,
  },
  {
    id: "permit",
    name: "County business permit",
    issuer: "Nairobi City County — details TBC",
    reference: "Reference TBC",
    expiresAt: "2027-03-31",
    isPlaceholder: true,
  },
  {
    id: "licence",
    name: "Regulatory licence",
    issuer: "Issuing authority TBC",
    reference: "Reference TBC",
    expiresAt: "2026-06-30",
    isPlaceholder: true,
  },
  {
    id: "authorisation",
    name: "Manufacturer authorisation",
    issuer: "Manufacturer TBC",
    reference: "Reference TBC",
    isPlaceholder: true,
  },
];

export const jobs: Job[] = [
  {
    id: "service-engineer",
    slug: "biomedical-service-engineer",
    title: "Biomedical service engineer",
    location: "Nairobi, with travel in Kenya",
    type: "Full-time",
    closingDate: "2026-12-15",
    summary:
      "Example vacancy. Install, service and support laboratory equipment. The full job description is TBC.",
    responsibilities: [
      "Responsibility list TBC",
      "Qualifications TBC",
      "Reporting line TBC",
    ],
    isPlaceholder: true,
  },
  {
    id: "sales-executive",
    slug: "medical-sales-executive",
    title: "Medical equipment sales executive",
    location: "Nairobi",
    type: "Full-time",
    closingDate: "2027-01-10",
    summary:
      "Example vacancy. Speak with hospitals, labs and institutions about the catalogue. Targets and package are TBC.",
    responsibilities: [
      "Responsibility list TBC",
      "Territory TBC",
      "Experience requirements TBC",
    ],
    isPlaceholder: true,
  },
];
