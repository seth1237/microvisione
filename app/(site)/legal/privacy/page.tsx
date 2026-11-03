import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { site } from "@/lib/site";

export const metadata = {
  title: "Privacy",
  description: "How Microvision Enterprises Ltd handles enquiry details, in line with the Kenya Data Protection Act, 2019.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Privacy notice" lede="This notice describes the demonstration site. It will need a review before a live database is connected." />
      <div className="mt-8 max-w-3xl space-y-4 text-sm leading-6">
        <p>
          {site.name} is the organisation named on the enquiry forms. The phone number for privacy questions is {site.phoneDisplay}. The published email address is still a placeholder.
        </p>
        <h2 className="pt-2 text-xl">What the forms ask for</h2>
        <p>
          Quote, contact, service, career and checkout forms ask for your name, organisation, role, Kenyan phone number, email, location and notes. Career applications can include a file name. On this build the file is not uploaded to a server.
        </p>
        <h2 className="pt-2 text-xl">Kenya Data Protection Act, 2019</h2>
        <p>
          Forms ask for consent before the details are used to respond to the request. Consent is for that purpose. You can withhold it, in which case the form will not submit. To ask for access, correction or deletion, call {site.phoneDisplay} and quote any reference number the site showed you.
        </p>
        <h2 className="pt-2 text-xl">What stays in this browser</h2>
        <p>
          The quote basket, cart, wishlist, compare list, cookie choice and demonstration account are stored in local storage on your device. They are not sent to Microvision until a backend is connected. You can clear them in your browser settings.
        </p>
        <p>
          This build does not run advertising cookies and does not sell personal data. A future production site should record the actual processors, retention periods and cross-border transfers before it goes live.
        </p>
      </div>
    </Container>
  );
}
