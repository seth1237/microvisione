import { notFound } from "next/navigation";
import { HomeCatalogue } from "@/components/home/home-catalogue";
import { Reveal } from "@/components/motion/reveal";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/api/products";
import { catalogueMetadata } from "@/lib/seo";

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
  const catalogue = [
    ...products.filter((product) => product.featured),
    ...products.filter((product) => !product.featured),
  ];

  return (
    <section className="bg-[#F8FAFC] py-4 sm:py-8" aria-labelledby="category-heading">
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
