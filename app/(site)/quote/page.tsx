import { QuoteView } from "@/components/cart/quote-view";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Quote basket",
  description: "Request a quotation for laboratory and medical equipment from Microvision Enterprises Ltd.",
  robots: utilityRobots,
};

export default function QuotePage() {
  return (
    <Container className="py-8">
      <PageIntro
        eyebrow="B2B"
        title="Request a quote"
        lede="Add equipment to the basket, then send your organisation details. You will get a reference number in this browser. Nothing is emailed yet."
      />
      <div className="mt-8">
        <QuoteView />
      </div>
    </Container>
  );
}
