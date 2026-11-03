import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Cart",
  description: "Review priced items before the demonstration checkout.",
  robots: utilityRobots,
};

export default function CartPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Cart" lede="Only items with a buy option appear here. Analyzers stay in the quote basket." />
      <div className="mt-8">
        <CartView />
      </div>
    </Container>
  );
}
