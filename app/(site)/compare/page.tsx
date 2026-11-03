import { CompareView } from "@/components/product/saved-views";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { utilityRobots } from "@/lib/seo";

export const metadata = {
  title: "Compare",
  robots: utilityRobots,
};

export default function ComparePage() {
  return (
    <Container className="py-8">
      <PageIntro title="Compare" lede="Up to four products, side by side. Values marked TBC are not verified specifications." />
      <div className="mt-8">
        <CompareView />
      </div>
    </Container>
  );
}
