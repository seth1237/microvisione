import { brands } from "@/data/brands";
import { categories } from "@/data/categories";
import type { Product, ProductFaq, PurchaseMode, Spec, StockStatus } from "@/types";

// TODO: replace with real data — specs, features, prices, stock and documents are placeholders.
// `featured` products are the admin selection for the home page. Keep that set to 18.

const SPEC_LABELS = [
  "Sample type",
  "Throughput",
  "Dimensions",
  "Power",
  "Display",
  "Weight",
];

interface Seed {
  slug: string;
  name: string;
  brandId: string;
  categoryId: string;
  mode?: PurchaseMode;
  price?: number;
  stock?: StockStatus;
  featured?: boolean;
  line?: string;
  offerId?: string;
}

const seeds: Seed[] = [
  { slug: "ams-liasys", name: "AMS Liasys", brandId: "ams", categoryId: "chemistry", featured: true, line: "Wet chemistry", offerId: "year-end-quote" },
  { slug: "ams-sat450", name: "AMS SAT450", brandId: "ams", categoryId: "chemistry", line: "Wet chemistry" },
  { slug: "arkray-glucocard", name: "Arkray Glucocard", brandId: "arkray", categoryId: "glucose", mode: "both", price: 4500, stock: "in_stock", featured: true, offerId: "meters" },
  { slug: "aution-11", name: "Aution 11", brandId: "aution", categoryId: "urine", featured: true },
  { slug: "blood-glucose-meter-bioland", name: "Bioland Blood Glucose Meter", brandId: "bioland", categoryId: "glucose", mode: "both", price: 2800, stock: "in_stock", offerId: "meters" },
  { slug: "blood-sugar-machine", name: "Blood Sugar Machine", brandId: "tbc", categoryId: "glucose", mode: "buy", price: 3200, stock: "in_stock", offerId: "meters" },
  { slug: "chem-100", name: "Chem 100", brandId: "chem", categoryId: "chemistry" },
  { slug: "chem-200", name: "Chem 200", brandId: "chem", categoryId: "chemistry", line: "Wet chemistry" },
  { slug: "chem-400", name: "Chem 400", brandId: "chem", categoryId: "chemistry", featured: true, offerId: "year-end-quote" },
  { slug: "coag-2d", name: "COAG 2D", brandId: "coag", categoryId: "coagulation", line: "Wet coagulation" },
  { slug: "coag-4d", name: "COAG 4D", brandId: "coag", categoryId: "coagulation", featured: true, line: "Wet coagulation", offerId: "year-end-quote" },
  { slug: "dus-60", name: "DUS 60", brandId: "dus", categoryId: "ultrasound", featured: true },
  { slug: "dus-r300", name: "DUS R300", brandId: "dus", categoryId: "urine" },
  { slug: "dus-r50s-semi-automatic-urine-analyzer", name: "DUS R50S", brandId: "dus", categoryId: "urine" },
  { slug: "eaglenos", name: "Eaglenos Electrolyte Analyzer", brandId: "eaglenos", categoryId: "electrolyte", featured: true },
  { slug: "eagnos-blood-gas-analyzer", name: "Eagnos Blood Gas Analyzer", brandId: "eagnos", categoryId: "bloodgas", featured: true },
  { slug: "edan-ax3", name: "Edan AX3", brandId: "edan", categoryId: "ultrasound", featured: true },
  { slug: "fastep-hb-meter", name: "Fastep Hb Meter", brandId: "fastep", categoryId: "hemoglobin", mode: "both", price: 8500, stock: "in_stock", featured: true, offerId: "hemoglobin" },
  { slug: "fluorecare", name: "Fluorecare", brandId: "fluorecare", categoryId: "immunofluorescence", stock: "limited", featured: true },
  { slug: "hb-meter", name: "HB Meter", brandId: "tbc", categoryId: "hemoglobin", mode: "both", price: 6200, stock: "in_stock", offerId: "hemoglobin" },
  { slug: "icon-magnus", name: "Icon Magnus", brandId: "icon", categoryId: "microscopes" },
  { slug: "iflash-1800", name: "Iflash 1800", brandId: "iflash", categoryId: "chemiluminescence", featured: true },
  { slug: "iflash1200", name: "Iflash 1200", brandId: "iflash", categoryId: "chemiluminescence" },
  { slug: "imteg4", name: "IMTEG4", brandId: "imteg", categoryId: "coagulation", line: "Hemostasis" },
  { slug: "iteg2", name: "ITEG2+", brandId: "iteg", categoryId: "coagulation", line: "Hemostasis" },
  { slug: "lia-labo", name: "Lia Labo", brandId: "lia", categoryId: "centrifuges", featured: true },
  { slug: "lia-mini", name: "Lia Mini", brandId: "lia", categoryId: "centrifuges", stock: "limited" },
  { slug: "loreena", name: "Loreena", brandId: "loreena", categoryId: "centrifuges" },
  { slug: "mx21i-microscope", name: "MX21i Microscope", brandId: "mx", categoryId: "microscopes", featured: true },
  { slug: "mythic-18", name: "Mythic 18", brandId: "mythic", categoryId: "hematology", featured: true, offerId: "year-end-quote" },
  { slug: "mythic-22al", name: "Mythic 22AL", brandId: "mythic", categoryId: "chemistry" },
  { slug: "mythic-3crp", name: "Mythic 3CRP", brandId: "mythic", categoryId: "hematology" },
  { slug: "mythic-60", name: "Mythic 60", brandId: "mythic", categoryId: "hematology", featured: true },
  { slug: "mythic-70", name: "Mythic 70", brandId: "mythic", categoryId: "hematology", stock: "unavailable" },
  { slug: "piccolo-chem", name: "PICCOLO CHEM", brandId: "piccolo", categoryId: "chemistry", line: "Wet chemistry" },
  { slug: "qlabs-3", name: "Qlabs", brandId: "qlabs", categoryId: "coagulation", line: "Dry coagulation" },
  { slug: "qlabs-3-pro", name: "Qlabs 3-pro", brandId: "qlabs", categoryId: "coagulation", line: "Dry coagulation" },
  { slug: "spotchem-d-concept", name: "Spotchem D Concept", brandId: "spotchem", categoryId: "chemistry", line: "Dry chemistry" },
  { slug: "spotchem-el", name: "Spotchem EL", brandId: "spotchem", categoryId: "electrolyte", line: "Dry electrolyte" },
  { slug: "spotchem-ez", name: "Spotchem EZ", brandId: "spotchem", categoryId: "chemistry", line: "Dry chemistry", featured: true },
  { slug: "theia-microscope", name: "Theia Microscope", brandId: "theia", categoryId: "microscopes", featured: true },
];

function mustFind<T extends { id: string }>(list: T[], id: string, label: string): T {
  const found = list.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown ${label}: ${id}`);
  return found;
}

function specs(): Spec[] {
  return SPEC_LABELS.map((label) => ({ label, value: "TBC" }));
}

function faqs(name: string): ProductFaq[] {
  return [
    {
      question: `What should I confirm before ordering the ${name}?`,
      answer:
        "Ask Microvision to confirm the specification, consumable compatibility, installation needs, warranty and delivery to your facility. Those details are not published as verified figures on this page yet.",
    },
    {
      question: "How do I use it?",
      answer:
        "Step-by-step instructions are not published here yet. Request the manufacturer instructions for use before the instrument is put into service.",
    },
    {
      question: "Can you install and train staff?",
      answer:
        "Installation, training and after-sales support can be requested with the quotation. The scope is agreed per site.",
    },
    {
      question: "Is the price on this page final?",
      answer:
        "Equipment is quoted. Where an example price is shown on a meter, it is marked as an example and is not an invoice.",
    },
  ];
}

function build(seed: Seed): Product {
  const category = mustFind(categories, seed.categoryId, "category");
  mustFind(brands, seed.brandId, "brand");
  const mode = seed.mode ?? "quote";
  const stock = seed.stock ?? "on_request";
  const priced = seed.price != null;

  return {
    id: seed.slug,
    slug: seed.slug,
    name: seed.name,
    brandId: seed.brandId,
    categoryId: seed.categoryId,
    line: seed.line,
    shortDescription: `${seed.name} — ${category.name} from Microvision Enterprises Ltd in Kenya. Specifications and price are confirmed on request.`,
    longDescription: `${seed.name} is listed in the Microvision Enterprises Ltd catalogue under ${category.name}. Hospitals, clinics, laboratories, NGOs and other institutions in Kenya can request a quotation, ask about installation and training, or send an order note on WhatsApp.\n\nThroughput, sample types, dimensions, power and reagent details are intentionally left as TBC. They will be replaced when the manufacturer data is confirmed. Nothing on this page should be read as a measured specification.`,
    images: [
      { variant: "primary", alt: `Illustration placeholder for ${seed.name}` },
      { variant: "detail", alt: `Second illustration placeholder for ${seed.name}` },
    ],
    specs: specs(),
    features: [
      "Verified feature list for this model is TBC.",
      "Installation and user training can be requested with the quotation.",
      "After-sales support is arranged under a separate service request.",
    ],
    purchaseMode: mode,
    price: seed.price,
    priceIsPlaceholder: priced ? true : undefined,
    currency: "KES",
    stockStatus: stock,
    stockIsPlaceholder: true,
    documents: [
      {
        id: `${seed.slug}-brochure`,
        title: "Brochure (placeholder)",
        kind: "brochure",
        href: "/docs/brochure-placeholder.txt",
      },
      {
        id: `${seed.slug}-datasheet`,
        title: "Datasheet (placeholder)",
        kind: "datasheet",
        href: "/docs/brochure-placeholder.txt",
      },
    ],
    relatedIds: [],
    accessoryNotes: [
      "Reagents or consumables — details TBC",
      "Controls and calibrators — details TBC",
      "Accessories — details TBC",
    ],
    tags: [category.slug, seed.brandId, seed.line?.toLowerCase() ?? ""].filter(Boolean),
    offerId: seed.offerId,
    featured: seed.featured,
    faqs: faqs(seed.name),
  };
}

export const products: Product[] = seeds.map(build);

for (const product of products) {
  product.relatedIds = products
    .filter((other) => other.categoryId === product.categoryId && other.id !== product.id)
    .slice(0, 3)
    .map((other) => other.id);
}
