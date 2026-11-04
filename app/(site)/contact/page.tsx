import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: `Contact Microvision Enterprises Ltd at ${site.address.full}, or call ${site.phoneDisplay}.`,
};

export default function ContactPage() {
  return (
    <Container className="py-8">
      <PageIntro title="Get in touch" lede={site.positioning} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal className="min-w-0 space-y-4">
          <div className="rounded-md border border-line bg-surface p-5">
            <h2 className="text-lg">Office</h2>
            <address className="mt-2 text-sm not-italic">
              {site.address.line1}
              <br />
              {site.address.locality}
            </address>
            <p className="mt-3 text-sm">
              <a className="font-semibold text-brand" href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
            </p>
            <p className="mt-1 text-sm">
              <a className="font-semibold text-brand" href={site.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </p>
            <p className="mt-1 text-sm">
              <a className="font-semibold text-brand" href={`mailto:${site.email}`}>{site.email}</a>
              {site.emailIsPlaceholder ? <span className="mt-1 block text-xs text-warning">Placeholder email — confirm before publishing.</span> : null}
            </p>
            <h3 className="mt-4 text-sm font-semibold">Hours</h3>
            <ul className="mt-1 text-sm text-muted">
              {site.hours.map((row) => (
                <li key={row.label}>{row.label}: {row.value}</li>
              ))}
            </ul>
            {site.hoursArePlaceholder ? <p className="mt-1 text-xs text-warning">Example hours — confirm before publishing.</p> : null}
          </div>
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="relative aspect-[4/3] w-full sm:aspect-video">
              <iframe
                title="Map of Loipi Plaza, Industrial Area, Nairobi"
                src={site.address.mapsEmbed}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={site.address.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 text-sm font-semibold text-brand"
            >
              Open the office in Google Maps
            </a>
          </div>
        </Reveal>
        <Reveal delay={70}>
        <section className="rounded-md border border-line bg-surface p-5" aria-labelledby="contact-form">
          <h2 id="contact-form" className="text-2xl">Send a message</h2>
          <div className="mt-4">
            <EnquiryForm kind="contact" />
          </div>
        </section>
        </Reveal>
      </div>
    </Container>
  );
}
