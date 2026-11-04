import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/analytics/product-view";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductShare } from "@/components/product/product-share";
import { ProductFacts } from "@/components/product/product-facts";
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="flex-1 bg-white">
      <WhiteCanvas />
      <ProductContent params={params} />
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
  const brandName = brand && !/tbc/i.test(brand.name) ? brand.name : "";
  const maker = product.distributedFor || brandName;
  const url = absoluteUrl(`/product/${product.slug}`);
  const catalogueHref = catalogueDownloadHref({ id: product.id }, catalogues);

  return (
    <Container className="bg-white pt-6 pb-40 lg:py-10">
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
      <div className="mt-5 grid items-start gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          name={product.name}
          photos={product.photos?.length ? product.photos : product.photoUrl ? [{ url: product.photoUrl, caption: "" }] : []}
        />
        <div className="lg:sticky lg:top-24">
          {maker ? (
            <p className="text-sm text-slate-500">
              {product.distributedFor ? `Distributed for ${product.distributedFor}` : maker}
            </p>
          ) : null}
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">{product.name}</h1>
            <ProductShare
              title={product.name}
              url={url}
              productId={product.id}
              categoryId={category?.slug || product.categoryId}
              categoryName={category?.name || ""}
            />
          </div>
          {category ? (
            <p className="mt-2 text-sm">
              <Link href={`/category/${category.slug}`} className="font-semibold text-brand">{category.name}</Link>
            </p>
          ) : null}
          <div className="mt-5">
            <PurchasePanel product={product} brandName={maker} />
          </div>
        </div>
      </div>
      <ProductFacts product={product} catalogueHref={catalogueHref} />
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
