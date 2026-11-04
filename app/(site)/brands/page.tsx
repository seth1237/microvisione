import { BrandGrid, type BrandCard } from "@/components/brands/brand-grid";
import { PageIntro } from "@/components/ui/page-intro";
import { liveManufacturers } from "@/lib/api/site-media";
import { getBrands } from "@/lib/api/products";

export const instant = false;

export const metadata = {
  title: "Manufacturers",
  description: "Manufacturers whose equipment is listed by Microvision Enterprises Ltd.",
};

function matchKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export default async function BrandsPage() {
  const [brands, manufacturers] = await Promise.all([
    getBrands(),
    liveManufacturers().catch(() => []),
  ]);
  const logos = new Map(manufacturers.map((item) => [matchKey(item.name), item.logoUrl]));
  const cards: BrandCard[] = brands
    .filter((brand) => brand.name && !/tbc/i.test(brand.name))
    .map((brand) => ({
      id: brand.id,
      slug: brand.slug,
      name: brand.name,
      count: brand.count,
      logoUrl: logos.get(matchKey(brand.name)),
    }));
  for (const maker of manufacturers) {
    if (cards.some((card) => matchKey(card.name) === matchKey(maker.name))) continue;
    cards.push({
      id: maker.id,
      slug: matchKey(maker.name),
      name: maker.name,
      count: 0,
      logoUrl: maker.logoUrl,
    });
  }
  cards.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <PageIntro title="Manufacturers" lede="Makers of the equipment in the catalogue." />
        {cards.length === 0 ? <p className="mt-8 text-sm text-muted">No manufacturers yet.</p> : <BrandGrid brands={cards} />}
      </div>
    </div>
  );
}
