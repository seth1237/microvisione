import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getBrands } from "@/lib/api/products";

export const metadata = {
  title: "Manufacturers",
  description: "Catalogue brand labels used by Microvision Enterprises Ltd. Manufacturer profiles are confirmed on request.",
};

export default async function BrandsPage() {
  const brands = await getBrands();
  return (
    <Container className="py-8">
      <PageIntro
        eyebrow="Brands"
        title="Manufacturers"
        lede="Each name is the label used on the product title. Country, authorisation and a company profile are still to be confirmed."
      />
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>Do not treat these entries as verified manufacturer pages.</PlaceholderNote>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link href={`/brands/${brand.slug}`} className="block h-full rounded-md border border-line bg-surface p-4 hover:border-brand">
              <h2 className="text-xl">{brand.name}</h2>
              <p className="mt-2 text-sm text-muted">{brand.description}</p>
              <p className="mt-3 text-sm font-semibold text-brand">{brand.count} products</p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
