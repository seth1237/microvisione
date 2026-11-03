import { CertificationCarousel } from "@/components/home/certification-carousel";
import { HomeCatalogue } from "@/components/home/home-catalogue";
import { ManufacturerCarousel } from "@/components/home/manufacturer-carousel";
import { SiteGallery } from "@/components/home/site-gallery";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { liveCertifications } from "@/lib/api/certifications";
import { getCategories, getProducts } from "@/lib/api/products";
import { liveGallery, liveManufacturers } from "@/lib/api/site-media";
import { site, whatsAppHref } from "@/lib/site";

const why = [
  {
    title: "Catalogue brands",
    text: "Equipment is listed under the names used in the Microvision catalogue. Manufacturer authorisations are confirmed on request.",
  },
  {
    title: "Installation and training",
    text: "Setup and operator training can be requested with a quotation. A published training syllabus is still TBC.",
  },
  {
    title: "After-sales service",
    text: "Maintenance, calibration and biomedical support are available as separate service requests.",
  },
  {
    title: "Delivery in Kenya",
    text: "Delivery outside Nairobi is arranged per order. Coverage and lead times are confirmed on the quote, not published as a guarantee here.",
  },
];

export default async function HomePage() {
  const [categories, products, certifications, manufacturers, gallery] = await Promise.all([
    getCategories(),
    getProducts(),
    liveCertifications(),
    liveManufacturers(),
    liveGallery(),
  ]);
  const catalogue = [
    ...products.filter((product) => product.featured),
    ...products.filter((product) => !product.featured),
  ];
  return (
    <>
      <section id="products" className="bg-[#F8FAFC] py-4 sm:py-8" aria-labelledby="products-heading">
        <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 lg:px-8">
          <h1 id="products-heading" className="text-xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
            Products
          </h1>
          <HomeCatalogue categories={categories} products={catalogue} />
        </div>
      </section>

      <section className="bg-black py-12 text-on-dark" aria-labelledby="why-heading">
        <Container>
          <h2 id="why-heading" className="text-3xl">Why Microvision</h2>
          <p className="mt-3 max-w-2xl text-sm text-on-dark/80">Placeholder copy — replace with approved service descriptions. No client counts are shown.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {why.map((item) => (
              <li key={item.title} className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <h3 className="text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-on-dark/80">{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CertificationCarousel logos={certifications} />
      <ManufacturerCarousel items={manufacturers} />
      <SiteGallery photos={gallery} />

      <section className="bg-brand py-12 text-on-brand">
        <Container className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl">Talk to Microvision</h2>
            <p className="mt-2 max-w-xl text-on-brand/90">{site.address.full}. Phone {site.phoneDisplay}.</p>
          </div>
          <Button asChild variant="primary" size="lg">
            <a href={whatsAppHref("Hello Microvision Enterprises Ltd, I would like to enquire about equipment.")}>
              WhatsApp {site.phoneDisplay}
            </a>
          </Button>
        </Container>
      </section>
    </>
  );
}
