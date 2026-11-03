import { EnquiryForm } from "@/components/forms/enquiry-form";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getJobs } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";

export const metadata = {
  title: "Careers",
  description: "Example vacancies and a talent-pool form at Microvision Enterprises Ltd, Nairobi.",
};

export default async function CareersPage() {
  const jobs = await getJobs();
  return (
    <Container className="py-8">
      <PageIntro
        eyebrow="Careers"
        title="Work at Microvision"
        lede="Open roles are examples until a hiring manager publishes them. You can still leave a CV for the talent pool."
      />
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>Closing dates and duties are placeholders.</PlaceholderNote>
      </div>
      <ul className="mt-8 space-y-4">
        {jobs.map((job) => (
          <li key={job.id} id={job.slug} className="rounded-md border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="warning">Example vacancy</Badge>
              <span className="text-sm text-muted">Closes {formatIsoDate(job.closingDate)}</span>
            </div>
            <h2 className="mt-2 text-2xl">{job.title}</h2>
            <p className="text-sm text-muted">{job.location} · {job.type}</p>
            <p className="mt-3">{job.summary}</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted">
              {job.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <section className="mt-10 max-w-2xl rounded-md border border-line bg-surface p-5" aria-labelledby="apply">
        <h2 id="apply" className="text-2xl">Apply or join the talent pool</h2>
        <p className="mt-2 text-sm text-muted">Choose a listed role or “Talent pool”. The CV stays on this device and is not uploaded.</p>
        <div className="mt-4">
          <EnquiryForm kind="career" vacancies={jobs.map((job) => job.title)} />
        </div>
      </section>
    </Container>
  );
}
