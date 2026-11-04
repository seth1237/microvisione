import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/analytics/product-view";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductShare } from "@/components/product/product-share";
import { ProductTabs } from "@/components/product/product-tabs";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { WhiteCanvas } from "@/components/product/white-canvas";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { liveCatalogues, liveProductBySlug } from "@/lib/api/live-catalogue";
import { catalogueDownloadHref } from "@/lib/platform/content";
import { getBrands, getCategories, getProductBySlug, getProducts, getRelatedProducts } from "@/lib/api/products";
import { absoluteUrl } from "@/lib/site";
import type { Metadata } from "next";

export const instant = false;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

async function loadProduct(slug: string) {
  return (await liveProductBySlug(slug)) || (await getProductBySlug(slug));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `/product/${product.slug}`,
    },
  };
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="flex-1 bg-white">
      <WhiteCanvas />
      <Suspense fallback={<div className="mx-auto max-w-6xl bg-white px-4 py-10 text-sm text-muted">Loading product…</div>}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();
  const [brands, categories, related, catalogues] = await Promise.all([
    getBrands(),
    getCategories(),
    getRelatedProducts(product),
    liveCatalogues(),
  ]);
  const brand = brands.find((item) => item.id === product.brandId);
  const category = categories.find((item) => item.id === product.categoryId);
  const url = absoluteUrl(`/product/${product.slug}`);
  const catalogueHref = catalogueDownloadHref({ id: product.id }, catalogues);

  return (
    <Container className="bg-white pt-8 pb-44 lg:py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription,
          sku: product.id,
          category: category?.name,
          brand: { "@type": "Brand", name: brand?.name ?? "Manufacturer TBC" },
          url,
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          ...(category ? [{ href: `/category/${category.slug}`, label: category.name }] : []),
          { label: product.name },
        ]}
      />
      <div className="mt-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl text-ink sm:text-4xl">{product.name}</h1>
          {category ? (
            <p className="mt-2 text-sm text-muted">
              <Link href={`/category/${category.slug}`} className="font-semibold text-brand">{category.name}</Link>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {catalogueHref ? (
            <a href={catalogueHref} className="inline-flex items-center rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand">
              View Catalogue
            </a>
          ) : null}
          <ProductShare
            title={product.name}
            url={url}
            productId={product.id}
            categoryId={category?.slug || product.categoryId}
            categoryName={category?.name || ""}
          />
        </div>
      </div>
      {product.features.filter((feature) => feature.trim() && !/tbc|placeholder/i.test(feature)).length ? (
        <ul className="mt-4 flex gap-2 overflow-x-auto">
          {product.features.filter((feature) => feature.trim() && !/tbc|placeholder/i.test(feature)).map((feature) => (
            <li key={feature} className="shrink-0 rounded-full border border-line bg-white px-3 py-1 text-sm text-ink">
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ProductGallery
          name={product.name}
          photos={product.photos?.length ? product.photos : product.photoUrl ? [{ url: product.photoUrl, caption: "" }] : []}
        />
        <div className="lg:sticky lg:top-24">
          <PurchasePanel product={product} brandName={brand && !/tbc/i.test(brand.name) ? brand.name : ""} />
        </div>
      </div>
      <ProductTabs product={product} />
      {related.length > 0 ? (
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl">Related products</h2>
          <ul className="mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
            {related.map((item, index) => (
              <li key={item.id}>
                <ProductCard product={item} index={index} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ProductView
        productId={product.id}
        productName={product.name}
        categoryId={category?.slug || product.categoryId}
        categoryName={category?.name || ""}
      />
      <p className="mt-8 text-sm text-muted">
        <Link href="/legal/returns" className="font-semibold text-brand">Returns and warranty</Link>
      </p>
    </Container>
  );
}
