import Link from "next/link";
import { ExpiryCountdown } from "@/components/home/expiry";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getOfferProducts, getOffers } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";

export const metadata = {
  title: "Offers",
  description: "Example product listings and quotation windows from Microvision Enterprises Ltd. Discounts are not published until approved.",
};

export default async function OffersPage() {
  const offers = await getOffers();
  const cards = await Promise.all(offers.map(async (offer) => ({ offer, products: await getOfferProducts(offer) })));

  return (
    <Container className="py-8">
      <PageIntro
        eyebrow="Promotions"
        title="Offers"
        lede="These cards show how a promotion will look. They are examples, not approved discounts."
      />
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>End dates and copy are placeholders.</PlaceholderNote>
      </div>
      <div className="mt-8 space-y-10">
        {cards.map(({ offer, products }) => (
          <article key={offer.id} id={offer.slug} className="rounded-md border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">Example offer</Badge>
              <span className="text-sm font-semibold text-accent">
                <ExpiryCountdown expiresAt={offer.expiresAt} />
              </span>
              <span className="text-sm text-muted">
                {formatIsoDate(offer.startsAt)}
                {offer.expiresAt ? ` – ${formatIsoDate(offer.expiresAt)}` : ""}
              </span>
            </div>
            <h2 className="mt-3 text-2xl">{offer.title}</h2>
            <p className="mt-2 max-w-3xl text-muted">{offer.summary}</p>
            <ul className="mt-6 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-8 text-sm">
        <Link href="/quote" className="font-semibold text-brand">Request a quote</Link> if you are planning a purchase around these listings.
      </p>
    </Container>
  );
}
