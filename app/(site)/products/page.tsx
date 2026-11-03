import { Suspense } from "react";
import { CatalogueBrowser } from "@/components/product/catalogue-browser";
import { ProductCardSkeleton } from "@/components/product/product-card";
import { catalogueMetadata } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return catalogueMetadata({
    basePath: "/products",
    title: "Products",
    description:
      "Browse chemistry analyzers, hematology systems, microscopes, meters and other laboratory equipment from Microvision Enterprises Ltd in Kenya.",
    searchParams,
  });
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<CatalogueFallback />}>
      <CatalogueBrowser
        searchParams={searchParams}
        heading="Products"
        intro="Filter by category, brand, availability or whether an item is quoted or sold. Example prices are marked."
      />
    </Suspense>
  );
}

function CatalogueFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="h-10 w-48 animate-pulse rounded bg-paper-deep" />
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
