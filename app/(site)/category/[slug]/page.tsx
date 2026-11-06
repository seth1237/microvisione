import { notFound } from "next/navigation";
import { HomeCatalogue } from "@/components/home/home-catalogue";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/api/products";
import { catalogueMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category" };
  return catalogueMetadata({
    basePath: `/category/${category.slug}`,
    title: `${category.name} in Kenya`,
    description: category.description,
    searchParams: Promise.resolve({}),
    lockedCategory: category.slug,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories, products] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getProducts(),
  ]);
  if (!category) notFound();
  const inCategory = products.filter((product) => product.categoryId === category.id);
  const catalogue = [
    ...products.filter((product) => product.featured),
    ...products.filter((product) => !product.featured),
  ];

  const pageUrl = absoluteUrl(`/category/${category.slug}`);
  return (
    <section className="bg-[#F8FAFC] py-4 sm:py-8" aria-labelledby="category-heading">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${category.name} in Kenya`,
          description: category.description,
          url: pageUrl,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: category.name, item: pageUrl },
          ],
        }}
      />
      {inCategory.length ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: category.name,
            itemListElement: inCategory.slice(0, 30).map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: product.name,
              url: absoluteUrl(`/product/${product.slug}`),
            })),
          }}
        />
      ) : null}
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 lg:px-8">
        <Reveal>
          <h1 id="category-heading" className="text-xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
            {category.name}
          </h1>
        </Reveal>
        <HomeCatalogue
          categories={categories}
          products={catalogue}
          initialCategoryId={category.id}
          activeSlug={category.slug}
          categoryLinks
        />
      </div>
    </section>
  );
}
