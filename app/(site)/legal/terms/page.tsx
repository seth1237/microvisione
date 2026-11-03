import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { site } from "@/lib/site";

export const metadata = {
  title: "Terms",
  description: "Website terms for Microvision Enterprises Ltd. A supply contract exists only when Microvision confirms it.",
};

export default function TermsPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Terms" lede="These notes govern use of this website. They are not a quotation." />
      <div className="mt-8 max-w-3xl space-y-4 text-sm leading-6">
        <p>
          The catalogue is published by {site.name}, {site.address.full}. Product names are the names used in the catalogue. Specifications marked TBC are not warranted.
        </p>
        <p>
          A price shown with the label “Example price” is not an offer to sell. Equipment marked “Request a quote” is priced only on a written quotation. A binding order exists when Microvision confirms it in writing, not when a form on this site shows a reference number.
        </p>
        <p>
          Checkout, including the M-Pesa demonstration and the invoice option, does not collect money and does not create a supply contract until a payment gateway and order system are connected.
        </p>
        <p>
          Installation, training, calibration and repair are separate services. Their scope, response time and charge are stated on the service quotation.
        </p>
        <p>
          You are responsible for checking that an instrument is suitable for your method before it is put into clinical or laboratory use, using the manufacturer’s instructions.
        </p>
      </div>
    </Container>
  );
}
