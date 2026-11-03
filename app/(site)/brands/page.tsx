import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getBrands } from "@/lib/api/products";

export const metadata = {
  title: "Manufacturers",
  description: "Manufacturers whose equipment is listed by Microvision Enterprises Ltd.",
};

export default async function BrandsPage() {
  const brands = (await getBrands()).filter((brand) => brand.name && !/tbc/i.test(brand.name));
  return (
    <Container className="py-8">
      <PageIntro
        title="Manufacturers"
        lede="Names used on the equipment in the catalogue."
      />
      {brands.length === 0 ? <p className="mt-8 text-sm text-muted">No manufacturers yet.</p> : null}
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link href={`/brands/${brand.slug}`} className="block h-full rounded-md border border-line bg-surface p-4 hover:border-brand">
              <h2 className="text-xl">{brand.name}</h2>
              <p className="mt-3 text-sm font-semibold text-brand">{brand.count} products</p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
