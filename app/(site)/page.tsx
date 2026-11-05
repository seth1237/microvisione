import { WhySection } from "@/components/home/why-section";
import { Reveal } from "@/components/motion/reveal";
import { HomeCatalogue } from "@/components/home/home-catalogue";
import { ManufacturerCarousel } from "@/components/home/manufacturer-carousel";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCategories, getProducts } from "@/lib/api/products";
import { liveManufacturers } from "@/lib/api/site-media";
import { site, whatsAppHref } from "@/lib/site";

export default async function HomePage() {
  const [categories, products, manufacturers] = await Promise.all([
    getCategories(),
    getProducts(),
    liveManufacturers(),
  ]);
  const catalogue = [
    ...products.filter((product) => product.featured),
    ...products.filter((product) => !product.featured),
  ];
  return (
    <>
      <section id="products" className="bg-[#F8FAFC] py-4 sm:py-8" aria-labelledby="products-heading">
        <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 lg:px-8">
          <Reveal>
            <h1 id="products-heading" className="text-xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
              Products
            </h1>
          </Reveal>
          <HomeCatalogue categories={categories} products={catalogue} />
        </div>
      </section>

      <WhySection />
      <ManufacturerCarousel items={manufacturers} />

      <section className="bg-brand py-12 text-on-brand -mb-16 lg:mb-0">
        <Container>
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl">Talk to Microvision</h2>
                <p className="mt-2 max-w-xl text-on-brand/90">{site.address.full}. Phone {site.phoneDisplay}.</p>
              </div>
              <Button asChild variant="primary" size="lg">
                <a href={whatsAppHref("Hello Microvision Enterprises Ltd, I would like to enquire about equipment.")}>
                  WhatsApp {site.phoneDisplay}
                </a>
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
