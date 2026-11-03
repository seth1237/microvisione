export const instant = false

import Link from "next/link";
import { JobApplyForm } from "@/components/forms/job-apply-form";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/ui/page-intro";
import { getJobs } from "@/lib/api/content";

export const metadata = {
  title: "Careers",
  description: "Open roles and the talent pool at Microvision Enterprises Ltd, Nairobi.",
};

export default async function CareersPage() {
  const jobs = await getJobs();
  return (
    <Container className="py-8">
      <PageIntro
        title="Work at Microvision"
        lede="Open a role to send your CV, or join the talent pool if you want to be considered for later openings."
      />
      {jobs.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No open roles right now.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href={`/careers/${job.slug}`} className="block rounded-md border border-line bg-surface p-5 hover:border-brand">
                <h2 className="text-2xl">{job.title}</h2>
                <p className="mt-1 text-sm text-muted">{[job.location, job.type].filter(Boolean).join(" · ")}</p>
                {job.summary ? <p className="mt-3">{job.summary}</p> : null}
                <p className="mt-3 text-sm font-semibold text-brand">View role</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <section className="mt-10 max-w-2xl rounded-md border border-line bg-surface p-5" aria-labelledby="talent-pool">
        <h2 id="talent-pool" className="text-2xl">Talent pool</h2>
        <p className="mt-2 text-sm text-muted">Send a CV when there is no open role that fits. It is kept with the other applications.</p>
        <div className="mt-4">
          <JobApplyForm />
        </div>
      </section>
    </Container>
  );
}
