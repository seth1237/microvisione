import { ConfirmationView } from "@/components/cart/confirmation-view";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Order confirmation",
  robots: utilityRobots,
};

export default function ConfirmationPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Order confirmation" lede="This reference exists only in your browser." />
      <div className="mt-8">
        <ConfirmationView />
      </div>
    </Container>
  );
}
