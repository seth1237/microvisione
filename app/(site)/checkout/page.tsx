import { CheckoutWizard } from "@/components/cart/checkout-wizard";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Checkout",
  description: "Checkout with M-Pesa STK push or an institutional invoice request.",
  robots: utilityRobots,
};

export default function CheckoutPage() {
  return (
    <Container className="py-8">
      <PageIntro
        title="Checkout"
        lede="Details, delivery, then an M-Pesa prompt or an invoice request. Money is taken only after Safaricom confirms the prompt."
      />
      <div className="mt-8">
        <CheckoutWizard />
      </div>
    </Container>
  );
}
