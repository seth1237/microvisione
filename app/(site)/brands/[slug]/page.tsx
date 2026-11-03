import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getBrandBySlug, getBrands, getProducts } from "@/lib/api/products";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: brand.name,
    description: brand.description,
    alternates: { canonical: `/brands/${brand.slug}` },
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
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();
  const products = (await getProducts()).filter((product) => product.brandId === brand.id);

  return (
    <Container className="py-8">
      <PageIntro eyebrow="Manufacturer" title={brand.name} lede={brand.description} />
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>Profile details are TBC.</PlaceholderNote>
      </div>
      <ul className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
