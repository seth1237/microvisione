import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getServices } from "@/lib/api/content";

export const metadata = {
  title: "Services",
  description:
    "Installation, maintenance, calibration, training and biomedical support from Microvision Enterprises Ltd in Nairobi.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <Container className="py-8">
      <PageIntro
        title="Services and biomedical support"
        lede="Request installation, a service contract, calibration, training or technical support. Response times are agreed per site."
      />
      <ul className="mt-8 grid gap-4 lg:grid-cols-2">
        {services.map((service, index) => (
          <li key={service.id} id={service.slug} className="min-w-0">
            <Reveal delay={index * 70} className="h-full">
              <article className="h-full rounded-md border border-line bg-surface p-5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <h2 className="text-xl">{service.name}</h2>
                <p className="mt-2 text-muted">{service.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {service.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal>
      <section className="mt-10 max-w-2xl rounded-md border border-line bg-surface p-5" aria-labelledby="service-form">
        <h2 id="service-form" className="text-2xl">Request service</h2>
        <p className="mt-2 text-sm text-muted">Include the model and serial number in the notes if you already have the instrument.</p>
        <div className="mt-4">
          <EnquiryForm kind="service" services={services.map((service) => service.name)} />
        </div>
      </section>
      </Reveal>
    </Container>
  );
}
