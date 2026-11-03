import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogueBrowser } from "@/components/product/catalogue-browser";
import { ProductCardSkeleton } from "@/components/product/product-card";
import { getCategories, getCategoryBySlug } from "@/lib/api/products";
import { catalogueMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return catalogueMetadata({
    basePath: `/category/${category.slug}`,
    title: `${category.name} in Kenya`,
    description: category.description,
    searchParams,
    lockedCategory: category.slug,
  });
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5 px-3 py-8 sm:px-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      }
    >
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  return (
    <CatalogueBrowser
      searchParams={searchParams}
      lockedCategory={category.slug}
      heading={category.name}
      intro={category.description}
    />
  );
}
