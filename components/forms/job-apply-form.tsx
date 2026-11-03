"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { JOB_DEPARTMENTS, JOB_WORKING_TERMS } from "@/lib/platform/jobs";

const control = "mt-1 h-11 w-full rounded-md border border-line bg-white px-3 text-sm";

export function JobApplyForm({
  job,
}: {
  job?: { id: string; title: string };
}) {
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    const cv = data.get("cv");
    if (!(cv instanceof File) || cv.size === 0) {
      setMessage("Choose a CV to upload.");
      return;
    }
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/jobs/apply", { method: "POST", body: data });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not send the application.");
      return;
    }
    formEl.reset();
    setDone(true);
  }

  if (done) {
    return (
      <p className="rounded-md border border-line bg-paper px-4 py-3 text-sm">
        Application received{job ? ` for ${job.title}` : ""}. Microvision has the CV.
      </p>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      {job ? <input type="hidden" name="jobId" value={job.id} /> : null}
      <label className="text-sm font-semibold">
        Full name
        <input name="fullName" required className={control} autoComplete="name" />
      </label>
      <label className="text-sm font-semibold">
        Email
        <input name="email" type="email" required className={control} autoComplete="email" />
      </label>
      <label className="text-sm font-semibold">
        Phone
        <input name="phone" required className={control} autoComplete="tel" />
      </label>
      {job ? null : (
        <>
          <label className="text-sm font-semibold">
            Department
            <select name="department" required className={control} defaultValue="">
              <option value="" disabled>Choose a department</option>
              {JOB_DEPARTMENTS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Working terms
            <select name="workingTerms" required className={control} defaultValue="">
              <option value="" disabled>Choose terms</option>
              {JOB_WORKING_TERMS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </>
      )}
      <label className="text-sm font-semibold">
        Note
        <textarea name="notes" rows={4} className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm" />
      </label>
      <label className="text-sm font-semibold">
        CV
        <input name="cv" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="mt-1 block w-full text-sm" />
      </label>
      {message ? <p className="text-sm text-accent">{message}</p> : null}
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : job ? "Submit application" : "Join the talent pool"}</Button>
    </form>
  );
}
