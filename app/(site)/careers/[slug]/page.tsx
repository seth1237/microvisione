export const instant = false

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobApplyForm } from "@/components/forms/job-apply-form";
import { Container } from "@/components/ui/container";
import { getJobBySlug, getJobs } from "@/lib/api/content";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return { title: "Role" };
  return { title: job.title, description: job.summary, alternates: { canonical: `/careers/${job.slug}` } };
}

export default function CareerRolePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-muted">Loading role…</div>}>
      <RoleContent params={params} />
    </Suspense>
  );
}

async function RoleContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();
  const duties = job.responsibilities.filter((item) => item.trim());
  const requirements = (job.requirements || []).filter((item) => item.trim());

  return (
    <Container className="py-8">
      <p className="text-sm">
        <Link href="/careers" className="font-semibold text-brand">Careers</Link>
      </p>
      <h1 className="mt-3 text-3xl text-ink sm:text-4xl">{job.title}</h1>
      <p className="mt-2 text-muted">{[job.location, job.type, job.department].filter(Boolean).join(" · ")}</p>
      {job.imageUrl ? (
        <img src={job.imageUrl} alt="" className="mt-6 aspect-[16/7] w-full max-w-3xl rounded-md object-cover" />
      ) : null}
      {job.summary ? <p className="mt-6 max-w-3xl">{job.summary}</p> : null}
      {job.description && job.description !== job.summary ? (
        <div className="mt-4 max-w-3xl space-y-3">
          {job.description.split(/\n{2,}/).map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          ))}
        </div>
      ) : duties.length > 0 ? (
        <ul className="mt-4 max-w-3xl list-disc space-y-1 pl-5 text-sm">
          {duties.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {requirements.length > 0 ? (
        <div className="mt-6 max-w-3xl">
          <h2 className="text-xl">Requirements</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <section className="mt-10 max-w-2xl rounded-md border border-line bg-surface p-5" aria-labelledby="apply">
        <h2 id="apply" className="text-2xl">Apply</h2>
        <p className="mt-2 text-sm text-muted">Upload a PDF or Word CV. It is filed under this role.</p>
        <div className="mt-4">
          <JobApplyForm job={{ id: job.id, title: job.title }} />
        </div>
      </section>
    </Container>
  );
}
