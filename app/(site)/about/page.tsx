import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getCertificates, getCompanyProfilePages } from "@/lib/api/content";
import { site } from "@/lib/site";
import { formatIsoDate, isPastIsoDate } from "@/lib/utils/format";

export const metadata = {
  title: "About",
  description:
    "Microvision Enterprises Limited is a registered private company in Kenya, importing and trading medical equipment and hospital supplies since 2008.",
};

export default async function AboutPage() {
  const [certificates, profilePages] = await Promise.all([getCertificates(), getCompanyProfilePages()]);
  return (
    <Container className="py-8">
      <PageIntro title="About Microvision" />
      <Reveal>
      <div className="mt-8 max-w-3xl space-y-4 text-ink">
        <p>
          Microvision Enterprises Limited is a duly registered private company in Kenya since year 2008 with a key objective as importer and trader in medical equipment and related hospital supplies. We are stockists and distributors of mainly Laboratory and other categories of surgical and medical Equipment consumables. We procure quality and relevant equipment from reliable manufacturers worldwide.
        </p>
        <p>
          We are appointed sole agents for many reputable manufacturers in specialist fields. All our products come with after sales service and warranty. Deliveries are done on time and customer service offers timely advice in case of queries. Our clients include private clinics, medium and large hospitals. We also participate in public and private tenders. We are able to source products under short notice through our international network.
        </p>
        <h2 className="pt-4 text-2xl">Mission</h2>
        <p>
          Microvision Enterprises Limited exists to provide affordable high quality medical equipment to our clients coupled with excellent customer service and long term client relationship.
        </p>
        <h2 className="pt-4 text-2xl">Vision</h2>
        <p>
          We see ourselves as the preferred suppliers of hospital equipment in the East Africa region and beyond with a large clientele of very satisfied customers that we share mutual benefit in business and as partners.
        </p>
      </div>
      </Reveal>
      {profilePages.length ? (
        <Reveal>
          <section className="mt-10 max-w-3xl space-y-8" aria-label="Company profile">
            {profilePages.map((page) => (
              <article key={page.id}>
                <h2 className="text-2xl">{page.title}</h2>
                {page.imageUrl ? <img src={page.imageUrl} alt="" className="mt-4 w-full rounded-md object-cover" /> : null}
                {page.body ? <p className="mt-3 whitespace-pre-line">{page.body}</p> : null}
              </article>
            ))}
          </section>
        </Reveal>
      ) : null}
      <Reveal>
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
      </Reveal>
    </Container>
  );
}
