import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";

export const metadata = {
  title: "Returns and warranty",
  description: "How Microvision Enterprises Ltd handles returns and warranty. Periods are confirmed on each quotation.",
};

export default function ReturnsPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Returns and warranty" lede="A single returns window is not published here, because it depends on the instrument and the quotation." />
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>Replace this page with the approved warranty wording. Do not invent a day count.</PlaceholderNote>
      </div>
      <div className="mt-8 max-w-3xl space-y-4 text-sm leading-6">
        <p>Warranty length, what it covers, and who attends on site are stated on the quotation and, after supply, on the invoice. Those documents override this page.</p>
        <p>Report a fault with the model, serial number and a short description through the service form or by calling 0790 669 988. Inspection decides whether the work is warranty, a service visit or a replacement.</p>
        <p>Consumables, reagents and damage from use outside the manufacturer’s instructions are not assumed to be covered.</p>
        <p>
          <Link href="/services" className="font-semibold text-brand">Request service</Link>
        </p>
      </div>
    </Container>
  );
}
