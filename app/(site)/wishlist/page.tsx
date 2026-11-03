import { WishlistView } from "@/components/product/saved-views";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Wishlist",
  robots: utilityRobots,
};

export default function WishlistPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Wishlist" lede="Saved in this browser only." />
      <div className="mt-8">
        <WishlistView />
      </div>
    </Container>
  );
}
