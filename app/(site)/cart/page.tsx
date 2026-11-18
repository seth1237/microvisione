import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Cart",
  description: "Review products in your cart and send a quote request to Microvision Enterprises Ltd.",
  robots: utilityRobots,
};

export default function CartPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Cart" lede="Add products, then send a quote request with your name, location, and email." />
      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
