import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getCertificates } from "@/lib/api/content";
import { site } from "@/lib/site";
import { formatIsoDate, isPastIsoDate } from "@/lib/utils/format";

export const metadata = {
  title: "About",
  description: site.positioning,
};

const team = [
  { role: "Managing director", name: "Name to be confirmed" },
  { role: "Service lead", name: "Name to be confirmed" },
  { role: "Sales lead", name: "Name to be confirmed" },
];

export default async function AboutPage() {
  const certificates = await getCertificates();
  return (
    <Container className="py-8">
      <PageIntro eyebrow="Company" title="About Microvision" lede={site.positioning} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          <h2 className="text-2xl">Our story</h2>
          <PlaceholderNote>Approved company history is not on this page yet. Do not infer a founding year or a client list.</PlaceholderNote>
          <p>
            Microvision Enterprises Ltd supplies medical and laboratory equipment from {site.address.full}. Buyers are hospitals, clinics, laboratories, NGOs and other institutions.
          </p>
          <h2 className="pt-4 text-2xl">Mission</h2>
          <p className="text-muted">
            Placeholder: help facilities in Kenya specify, receive and keep diagnostic equipment in service, with quotations and after-sales support that match the instrument they actually buy.
          </p>
        </div>
        <aside className="rounded-md border border-line bg-surface p-5">
          <h2 className="text-xl">Team</h2>
          <ul className="mt-4 space-y-3">
            {team.map((person) => (
              <li key={person.role} className="border-b border-line pb-3">
                <p className="font-semibold">{person.role}</p>
                <p className="text-sm text-muted">{person.name}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <section className="mt-10" aria-labelledby="certs">
        <h2 id="certs" className="text-2xl">Certificates, licences and memberships</h2>
        <p className="mt-2 text-sm text-muted">Memberships are not listed because none have been confirmed for publication.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {certificates.map((certificate) => {
            const expired = certificate.expiresAt ? isPastIsoDate(certificate.expiresAt, site.catalogueAsOf) : false;
            return (
              <li key={certificate.id} className="rounded-md border border-line bg-surface p-4">
                <p className="font-semibold">{certificate.name}</p>
                <p className="text-sm text-muted">{certificate.issuer}</p>
                <p className="text-sm text-muted">{certificate.reference}</p>
                {certificate.expiresAt ? (
                  <p className="mt-2 text-sm font-semibold text-warning">
                    {expired ? "Expiry flag: past the sample date" : "Expiry"} {formatIsoDate(certificate.expiresAt)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
