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
import { CategorySidebar } from "@/components/home/home-catalogue";
import { liveCatalogues, liveProductBySlug } from "@/lib/api/live-catalogue";
import { catalogueDownloadHref } from "@/lib/platform/content";
import { getBrands, getCategories, getProductBySlug, getProducts, getRelatedProducts } from "@/lib/api/products";
import { getPriceVisibility } from "@/lib/platform/site-data";
import { keywordList, metaText } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
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
  const written = product.seo?.title?.trim();
  const title = written || product.name;
  const branded = Boolean(written && /microvision/i.test(written));
  const description = metaText(product.seo?.description || product.shortDescription);
  const keywords = keywordList(product.seo?.keywords);
  const image = product.photoUrl;
  const alt = product.seo?.imageAlt || product.name;
  return {
    title: branded ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, alt }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
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
  const [brands, categories, catalogue, related, catalogues, showPrices] = await Promise.all([
    getBrands(),
    getCategories(),
    getProducts(),
    getRelatedProducts(product),
    liveCatalogues(),
    getPriceVisibility(),
  ]);
  const brand = brands.find((item) => item.id === product.brandId);
  const category = categories.find((item) => item.id === product.categoryId || item.slug === product.categoryId);
  const brandName = brand && !/tbc/i.test(brand.name) ? brand.name : "";
  const maker = brandName;
  const url = absoluteUrl(`/product/${product.slug}`);
  const catalogueHref = catalogueDownloadHref({ id: product.id }, catalogues);

  return (
    <div className="mx-auto w-full max-w-[1600px] bg-white px-3 pt-6 pb-4 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid items-start gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-6">
        <CategorySidebar
          categories={categories}
          products={catalogue}
          activeId={category?.id ?? null}
          activeSlug={category?.slug || ""}
          currentSlug={product.slug}
          linkCategories
          className="sticky top-36 hidden lg:block"
        />
        <div className="min-w-0">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: metaText(product.seo?.description || product.shortDescription, 500),
          sku: product.id,
          category: category?.name,
          image: product.photoUrl ? [absoluteUrl(product.photoUrl)] : undefined,
          ...(maker ? { brand: { "@type": "Brand", name: maker } } : {}),
          url,
          offers: showPrices && product.price
            ? {
                "@type": "Offer",
                priceCurrency: "KES",
                price: product.price,
                availability:
                  product.stockStatus === "in_stock"
                    ? "https://schema.org/InStock"
                    : "https://schema.org/PreOrder",
                url,
                seller: { "@type": "Organization", name: site.name },
              }
            : undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            ...(category
              ? [{ "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(`/category/${category.slug}`) }]
              : []),
            {
              "@type": "ListItem",
              position: category ? 3 : 2,
              name: product.name,
              item: url,
            },
          ],
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
          alt={product.seo?.imageAlt}
          photos={product.photos?.length ? product.photos : product.photoUrl ? [{ url: product.photoUrl, caption: "" }] : []}
        />
        <div className="lg:sticky lg:top-24">
          {brandName ? <p className="text-sm text-slate-500">{brandName}</p> : null}
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
      <ProductFacts key={product.id} product={product} catalogueHref={catalogueHref} />
      {related.length > 0 ? (
        <section className="mt-8" aria-labelledby="related-heading">
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
        </div>
      </div>
      <ProductView
        productId={product.id}
        productName={product.name}
        categoryId={category?.slug || product.categoryId}
        categoryName={category?.name || ""}
      />
    </div>
  );
}
