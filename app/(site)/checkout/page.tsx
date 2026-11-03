import { CheckoutWizard } from "@/components/cart/checkout-wizard";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Checkout",
  description: "Demonstration checkout with M-Pesa and institutional invoice options.",
  robots: utilityRobots,
};

export default function CheckoutPage() {
  return (
    <Container className="py-8">
      <PageIntro
        title="Checkout"
        lede="Details, delivery, a simulated M-Pesa prompt or an invoice option, then review. No payment is taken."
      />
      <div className="mt-8">
        <CheckoutWizard />
      </div>
    </Container>
  );
}
