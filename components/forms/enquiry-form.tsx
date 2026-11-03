"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isEmail, isKenyanPhone, normalizeKenyanPhone } from "@/lib/utils/phone";
import { makeReference } from "@/lib/utils/format";
import type { QuoteLine } from "@/types";

export type EnquiryKind = "contact" | "service" | "career" | "quote";

interface Fields {
  name: string;
  organisation: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  notes: string;
  consent: boolean;
  website: string;
  deliveryDate: string;
  service: string;
  subject: string;
  vacancy: string;
  fileName: string;
}

const empty: Fields = {
  name: "",
  organisation: "",
  role: "",
  phone: "",
  email: "",
  location: "",
  notes: "",
  consent: false,
  website: "",
  deliveryDate: "",
  service: "",
  subject: "",
  vacancy: "",
  fileName: "",
};

const control = "mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-sm";

export function EnquiryForm({
  kind,
  services = [],
  vacancies = [],
  lines = [],
  onComplete,
}: {
  kind: EnquiryKind;
  services?: string[];
  vacancies?: string[];
  lines?: QuoteLine[];
  onComplete?: (result: { reference: string; fields: Fields }) => void;
}) {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function validate(current: Fields): Record<string, string> {
    const next: Record<string, string> = {};
    if (!current.name.trim()) next.name = "Enter your name.";
    if (!current.organisation.trim()) next.organisation = "Enter the organisation.";
    if (!current.role.trim()) next.role = "Enter your role.";
    if (!isKenyanPhone(current.phone)) {
      next.phone = "Use a Kenyan number: 07xx, 01xx, or +254.";
    }
    if (!isEmail(current.email)) next.email = "Enter a valid email address.";
    if (!current.location.trim()) next.location = "Enter the town or county.";
    if (!current.consent) next.consent = "Consent is required under the Kenya Data Protection Act.";
    if (kind === "service" && !current.service) next.service = "Choose a service.";
    if (kind === "contact" && !current.subject) next.subject = "Choose a subject.";
    if (kind === "career" && !current.vacancy) next.vacancy = "Choose a vacancy or the talent pool.";
    if (current.deliveryDate) {
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      if (current.deliveryDate < iso) next.deliveryDate = "Choose today or a later date.";
    }
    if (kind === "quote" && lines.length === 0 && !current.notes.trim()) {
      next.notes = "Add products to the basket or describe what you need.";
    }
    return next;
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = validate(fields);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    if (fields.website.trim()) {
      setReference(makeReference(kind === "quote" ? "MVQ" : kind === "career" ? "MVC" : "MVS"));
      return;
    }
    const ref = makeReference(kind === "quote" ? "MVQ" : kind === "career" ? "MVC" : "MVS");
    const phone = normalizeKenyanPhone(fields.phone) ?? fields.phone;
    setReference(ref);
    onComplete?.({ reference: ref, fields: { ...fields, phone } });
  }

  if (reference) {
    return (
      <div className="rounded-md border border-success/30 bg-success-soft p-5" role="status">
        <h2 className="text-xl text-success">Request received</h2>
        <p className="mt-2 text-ink">
          Reference <strong>{reference}</strong>. This is a demonstration — nothing was sent to a server or to WhatsApp.
        </p>
        <p className="mt-2 text-sm text-muted">Keep the reference if you call 0790 669 988.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {Object.keys(errors).length > 0 ? (
        <div role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          Check the highlighted fields and try again.
        </div>
      ) : null}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={(event) => set("website", event.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input id="name" className={control} value={fields.name} onChange={(event) => set("name", event.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field id="organisation" label="Organisation" error={errors.organisation}>
          <input id="organisation" className={control} value={fields.organisation} onChange={(event) => set("organisation", event.target.value)} autoComplete="organization" aria-invalid={Boolean(errors.organisation)} />
        </Field>
        <Field id="role" label="Role" error={errors.role}>
          <input id="role" className={control} value={fields.role} onChange={(event) => set("role", event.target.value)} aria-invalid={Boolean(errors.role)} />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone} hint="07xx, 01xx or +254">
          <input id="phone" className={control} inputMode="tel" autoComplete="tel" value={fields.phone} onChange={(event) => set("phone", event.target.value)} aria-invalid={Boolean(errors.phone)} />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" type="email" className={control} autoComplete="email" value={fields.email} onChange={(event) => set("email", event.target.value)} aria-invalid={Boolean(errors.email)} />
        </Field>
        <Field id="location" label="Town or county" error={errors.location}>
          <input id="location" className={control} value={fields.location} onChange={(event) => set("location", event.target.value)} aria-invalid={Boolean(errors.location)} />
        </Field>
      </div>
      {kind === "contact" ? (
        <Field id="subject" label="Subject" error={errors.subject}>
          <select id="subject" className={control} value={fields.subject} onChange={(event) => set("subject", event.target.value)} aria-invalid={Boolean(errors.subject)}>
            <option value="">Choose</option>
            <option>Product enquiry</option>
            <option>Service and support</option>
            <option>Careers</option>
            <option>Something else</option>
          </select>
        </Field>
      ) : null}
      {kind === "service" ? (
        <Field id="service" label="Service" error={errors.service}>
          <select id="service" className={control} value={fields.service} onChange={(event) => set("service", event.target.value)} aria-invalid={Boolean(errors.service)}>
            <option value="">Choose</option>
            {services.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </Field>
      ) : null}
      {kind === "career" ? (
        <>
          <Field id="vacancy" label="Vacancy" error={errors.vacancy}>
            <select id="vacancy" className={control} value={fields.vacancy} onChange={(event) => set("vacancy", event.target.value)} aria-invalid={Boolean(errors.vacancy)}>
              <option value="">Choose</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy}>{vacancy}</option>
              ))}
              <option>Talent pool — submit a CV</option>
            </select>
          </Field>
          <Field id="cv" label="CV" hint="PDF or Word, up to 5 MB. The file is not uploaded.">
            <input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              className="mt-1 block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  set("fileName", "");
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  setErrors((current) => ({ ...current, cv: "Choose a file under 5 MB." }));
                  event.target.value = "";
                  return;
                }
                setErrors((current) => {
                  const next = { ...current };
                  delete next.cv;
                  return next;
                });
                set("fileName", file.name);
              }}
            />
            {fields.fileName ? <p className="mt-1 text-sm text-muted">Selected: {fields.fileName}</p> : null}
            {errors.cv ? <p className="mt-1 text-sm text-danger">{errors.cv}</p> : null}
          </Field>
        </>
      ) : null}
      {kind === "quote" ? (
        <Field id="deliveryDate" label="Preferred delivery date" error={errors.deliveryDate} hint="Optional">
          <input id="deliveryDate" type="date" className={control} value={fields.deliveryDate} onChange={(event) => set("deliveryDate", event.target.value)} aria-invalid={Boolean(errors.deliveryDate)} />
        </Field>
      ) : null}
      <Field id="notes" label={kind === "career" ? "Cover note" : "Notes"} error={errors.notes}>
        <textarea id="notes" className="mt-1 min-h-28 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm" value={fields.notes} onChange={(event) => set("notes", event.target.value)} aria-invalid={Boolean(errors.notes)} />
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={fields.consent} onChange={(event) => set("consent", event.target.checked)} aria-invalid={Boolean(errors.consent)} />
        <span>
          I consent to Microvision Enterprises Ltd using these details to respond to this request, in line with the Kenya Data Protection Act, 2019. Read the{" "}
          <Link href="/legal/privacy" className="font-semibold text-brand">privacy notice</Link>.
        </span>
      </label>
      {errors.consent ? <p className="text-sm text-danger" role="alert">{errors.consent}</p> : null}
      <Button type="submit">{kind === "career" ? "Submit application" : kind === "quote" ? "Submit quote request" : "Send"}</Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
