import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { PageIntro } from "@/components/ui/page-intro";
import { liveManufacturers } from "@/lib/api/site-media";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/api/products";
import type { Metadata } from "next";

export const instant = false;

function matchKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export async function generateStaticParams() {
  const [brands, manufacturers] = await Promise.all([
    getBrands(),
    liveManufacturers().catch(() => []),
  ]);
  const slugs = new Set(brands.map((brand) => brand.slug));
  for (const maker of manufacturers) slugs.add(matchKey(maker.name));
  return [...slugs].filter(Boolean).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [brand, manufacturers] = await Promise.all([
    getBrandBySlug(slug),
    liveManufacturers().catch(() => []),
  ]);
  const maker = manufacturers.find((item) => matchKey(item.name) === matchKey(slug));
  const name = brand?.name || maker?.name;
  if (!name) return { title: "Manufacturer" };
  return {
    title: name,
    description: brand?.description || `${name} equipment listed by Microvision Enterprises Ltd.`,
    alternates: { canonical: `/brands/${brand?.slug || slug}` },
  };
}

export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-muted">Loading brand…</div>}>
      <BrandContent params={params} />
    </Suspense>
  );
}

async function BrandContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [brand, manufacturers, products] = await Promise.all([
    getBrandBySlug(slug),
    liveManufacturers().catch(() => []),
    getProducts(),
  ]);
  const maker = manufacturers.find((item) => matchKey(item.name) === matchKey(slug) || matchKey(item.name) === matchKey(brand?.name || ""));
  if (!brand && !maker) notFound();
  const name = brand?.name || maker?.name || "";
  const listed = products.filter((product) => (brand ? product.brandId === brand.id : matchKey(product.brandId) === matchKey(name)));
  const lede = brand?.description && !/tbc/i.test(brand.description)
    ? brand.description
    : `${listed.length} ${listed.length === 1 ? "product" : "products"}`;

  return (
    <div className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {maker?.logoUrl ? (
          <img src={maker.logoUrl} alt="" className="mb-6 h-16 w-40 object-contain object-left" />
        ) : null}
        <PageIntro title={name} lede={lede} />
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
          {listed.map((product, index) => (
            <li key={product.id}>
              <ProductCard product={product} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
