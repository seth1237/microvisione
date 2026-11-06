/** Shared domain types. The UI should depend on these, not on a database schema. */

export type PurchaseMode = "quote" | "buy" | "both";

export type StockStatus = "in_stock" | "limited" | "on_request" | "unavailable";

export type CategoryIcon =
  | "flask"
  | "droplets"
  | "tubes"
  | "scan"
  | "heart"
  | "microscope"
  | "tube"
  | "activity"
  | "spark"
  | "centrifuge"
  | "gauge"
  | "wind"
  | "monitor";

export interface Spec {
  label: string;
  /** "TBC" until a verified figure is supplied. */
  value: string;
}

export interface ProductImage {
  /** Visual variant rendered by ProductVisual. Not a remote photo. */
  variant: "primary" | "detail";
  alt: string;
}

export interface ProductDocument {
  id: string;
  title: string;
  kind: "brochure" | "datasheet" | "ifu";
  href: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  categoryId: string;
  /** Optional catalogue grouping, used as subcategory chips. */
  line?: string;
  shortDescription: string;
  longDescription: string;
  images: ProductImage[];
  specs: Spec[];
  features: string[];
  purchaseMode: PurchaseMode;
  price?: number;
  /** When true, `price` is an example and must be labelled as such. */
  priceIsPlaceholder?: boolean;
  currency: "KES";
  stockStatus: StockStatus;
  stockIsPlaceholder?: boolean;
  documents: ProductDocument[];
  relatedIds: string[];
  accessoryNotes: string[];
  tags: string[];
  offerId?: string;
  featured?: boolean;
  faqs: ProductFaq[];
  /** Uploaded catalogue photo. Illustrations are used when this is absent. */
  photoUrl?: string;
  photos?: { url: string; caption: string }[];
  installations?: { url: string; caption: string }[];
  howToUse?: string;
  measuringParameters?: string;
  distributedFor?: string;
  /** Titles and descriptions entered in the admin SEO panel. */
  seo?: {
    title: string;
    description: string;
    keywords: string;
    imageAlt: string;
  };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parentId?: string;
  icon: CategoryIcon;
  description: string;
}

export interface CategoryWithCount extends Category {
  count: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  /** Catalogue label. Not a confirmed legal manufacturer profile. */
  description: string;
}

export interface BrandWithCount extends Brand {
  count: number;
}

export interface Offer {
  id: string;
  slug: string;
  title: string;
  summary: string;
  startsAt: string;
  expiresAt?: string;
  productIds: string[];
  bannerUrl?: string;
  isPlaceholder?: true;
}

export type EventCategory = "Event" | "Exhibition" | "Company news";

export interface CatalogueEvent {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  date: string;
  location: string;
  summary: string;
  body: string;
  coverUrl?: string;
  registrationUrl?: string;
  blocks?: import("@/lib/platform/event-body").EventBlock[];
  isPlaceholder?: true;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  reference: string;
  expiresAt?: string;
  isPlaceholder: true;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  closingDate: string;
  summary: string;
  responsibilities: string[];
  department?: string;
  description?: string;
  requirements?: string[];
  imageUrl?: string;
  isPlaceholder?: true;
}

export interface ServiceOffering {
  id: string;
  slug: string;
  name: string;
  summary: string;
  points: string[];
}

export interface QuoteLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  quantity: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  priceIsPlaceholder?: boolean;
  imageVariant: "primary";
  categoryId: string;
}

export interface AccountUser {
  name: string;
  organisation: string;
  role: string;
  email: string;
  phone: string;
}

export interface QuoteRequest {
  reference: string;
  name: string;
  organisation: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  notes: string;
  preferredDeliveryDate?: string;
  lines: QuoteLine[];
  createdAt: string;
}

export type PaymentStatus = "success" | "failed" | "timeout" | "invoice";

export interface PlacedOrder {
  reference: string;
  placedAt: string;
  paymentMethod: "mpesa" | "invoice";
  paymentStatus: PaymentStatus;
  mpesaReceipt?: string;
  name: string;
  organisation: string;
  role: string;
  phone: string;
  email: string;
  facility: string;
  town: string;
  notes: string;
  collection: boolean;
  lines: CartItem[];
  total: number;
  includesExamplePrices: boolean;
}

export type CatalogueSort =
  | "featured"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export interface CatalogueQuery {
  q?: string;
  category?: string;
  brand?: string;
  availability?: StockStatus;
  mode?: PurchaseMode;
  min?: number;
  max?: number;
  sort?: CatalogueSort;
  view?: "grid" | "list";
  page?: number;
  line?: string;
}

export interface SearchHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryId: string;
}

export interface CatalogueBundle {
  products: Product[];
  categories: CategoryWithCount[];
  brands: BrandWithCount[];
  offers: Offer[];
  events: CatalogueEvent[];
  searchIndex: SearchHit[];
  showPrices: boolean;
}
