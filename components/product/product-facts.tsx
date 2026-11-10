"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/types";

function isPlaceholderCopy(value: string, name: string) {
  const text = value.trim();
  if (!text || text === name) return true;
  const lowered = text.toLowerCase();
  return [
    "intentionally left as tbc",
    "nothing on this page should be read as a measured specification",
    "specifications and price are confirmed on request",
    "is listed in the microvision enterprises ltd catalogue",
    "verified feature list for this model is tbc",
    "from microvision enterprises ltd.",
    "details tbc",
    "can be requested with the quotation",
    "arranged under a separate service request",
    "scope is agreed per site",
    "not an invoice",
    "not published",
    "placeholder",
    "tbc",
  ].some((marker) => lowered.includes(marker));
}

function lines(value: string, name: string) {
  return value
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[\.\)]\s*/, "").trim())
    .filter((line) => line && !isPlaceholderCopy(line, name));
}

function StepsTable({ steps }: { steps: string[] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {steps.map((step, index) => (
          <tr key={step} className="border-b border-slate-200 last:border-b-0">
            <th scope="row" className="w-8 py-2 pr-3 text-left align-top font-medium text-slate-500">{index + 1}</th>
            <td className="py-2 text-[#111827]">{step}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function parameterRows(value: string, name: string) {
  return value.split(/\n+/).flatMap((line) => {
    const cleaned = line.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+[.)]\s*/, "").trim();
    if (!cleaned || isPlaceholderCopy(cleaned, name)) return [];
    if (!/[:|]/.test(cleaned) && /[,;]/.test(cleaned)) {
      return cleaned.split(/[,;]/).map((part) => part.trim()).filter((part) => part && !isPlaceholderCopy(part, name));
    }
    return [cleaned];
  }).map((line) => {
    const match = line.match(/^(.{1,48}?)\s*[:|]\s+(.+)$/);
    return match ? { label: match[1].trim(), value: match[2].trim() } : { label: "", value: line };
  });
}

function ParameterButtons({ rows, label = "Parameters" }: { rows: { label: string; value: string }[]; label?: string }) {
  const [open, setOpen] = useState<number | null>(rows.length === 1 && rows[0]?.label ? 0 : null);
  const selected = open === null ? null : rows[open];

  return (
    <section aria-label={label || undefined}>
      {label ? <h2 className="text-xs font-semibold text-slate-500">{label}</h2> : null}
      <ul className={`${label ? "mt-2" : ""} flex flex-wrap gap-1.5`}>
        {rows.map((row, index) => {
          const name = row.label || row.value;
          const selectedChip = open === index;
          const className = `rounded-md border px-2 py-1 text-xs font-medium leading-4 ${
            selectedChip ? "border-brand bg-brand text-white" : "border-slate-200 bg-[#F8FAFC] text-[#111827]"
          }`;
          if (!row.value || !row.label) {
            return (
              <li key={`${name}-${index}`}>
                <span className={className}>{name}</span>
              </li>
            );
          }
          return (
            <li key={`${name}-${index}`}>
              <button type="button" className={className} aria-pressed={selectedChip} onClick={() => setOpen(selectedChip ? null : index)}>
                {name}
              </button>
            </li>
          );
        })}
      </ul>
      {selected?.label && selected.value ? (
        <p className="mt-2 text-xs text-slate-600">{selected.label}: {selected.value}</p>
      ) : null}
    </section>
  );
}

function SpecsTable({ specs }: { specs: string[] }) {
  const rows = Math.ceil(specs.length / 2);
  return (
    <table className="w-full text-sm">
      <tbody>
        {Array.from({ length: rows }, (_, index) => {
          const left = specs[index * 2];
          const right = specs[index * 2 + 1];
          return (
            <tr key={left} className="border-b border-slate-200 last:border-b-0">
              <td className="w-1/2 py-2 pr-4 text-[#111827]">{left}</td>
              <td className="w-1/2 py-2 text-[#111827]">{right || ""}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OverviewCopy({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-2 text-sm leading-6 text-[#111827]">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

type Section = { id: string; title: string; wide?: boolean; content: ReactNode };

function PhoneFacts({ sections }: { sections: Section[] }) {
  const [openId, setOpenId] = useState(sections[0]?.id ?? "");

  return (
    <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 lg:hidden">
      {sections.map((section) => {
        const expanded = openId === section.id;
        return (
          <div key={section.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-[#111827]"
              aria-expanded={expanded}
              onClick={() => setOpenId(expanded ? "" : section.id)}
            >
              {section.title}
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            {expanded ? <div className="px-4 pb-4">{section.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

function DesktopFacts({ sections }: { sections: Section[] }) {
  return (
    <div className="mt-8 hidden items-start gap-x-8 gap-y-6 lg:grid lg:grid-cols-2 xl:grid-cols-3">
      {sections.map((section) => (
        <section key={section.id} className={section.wide ? "lg:col-span-2 xl:col-span-3" : undefined}>
          <h2 className="border-b border-slate-200 pb-2 text-sm font-semibold text-[#111827]">{section.title}</h2>
          <div className="mt-1">{section.content}</div>
        </section>
      ))}
    </div>
  );
}

export function ProductFacts({ product, catalogueHref }: { product: Product; catalogueHref?: string }) {
  const overview = (product.longDescription || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !isPlaceholderCopy(paragraph, product.name));
  const specs = product.features.filter((feature) => feature.trim() && !isPlaceholderCopy(feature, product.name));
  const steps = lines(product.howToUse || "", product.name);
  const parameters = parameterRows(product.measuringParameters || "", product.name);
  const installations = product.installations || [];
  const sections: Section[] = [];
  const suppliedTo = (product.distributedFor || "")
    .split(/\s{2,}|[,;\n|]/)
    .map((item) => item.trim())
    .filter((item) => item && !isPlaceholderCopy(item, product.name));
  if (overview.length) sections.push({ id: "overview", title: "Overview", content: <OverviewCopy paragraphs={overview} /> });
  if (steps.length === 1) sections.push({ id: "how-to-use", title: "How to use", content: <p className="pt-2 text-sm leading-6 text-[#111827]">{steps[0]}</p> });
  else if (steps.length) sections.push({ id: "how-to-use", title: "How to use", content: <StepsTable steps={steps} /> });
  if (suppliedTo.length > 1) sections.push({ id: "supplied-to", title: "Supplied to", content: <ParameterButtons label="" rows={suppliedTo.map((item) => ({ label: "", value: item }))} /> });
  if (specs.length) sections.push({ id: "specs", title: "Key specs", wide: true, content: <SpecsTable specs={specs} /> });
  if (!sections.length && !parameters.length && !installations.length && !catalogueHref) return null;

  return (
    <div>
      {parameters.length ? (
        <div className="mt-6">
          <ParameterButtons rows={parameters} />
        </div>
      ) : null}
      {sections.length ? (
        <>
          <PhoneFacts sections={sections} />
          <DesktopFacts sections={sections} />
        </>
      ) : null}
      {installations.length ? (
        <section className="mt-8" aria-labelledby="install-heading">
          <h2 id="install-heading" className="text-sm font-semibold text-[#111827]">Recent installations</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {installations.map((photo) => (
              <li key={photo.url} className="overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC]">
                <img src={photo.url} alt={photo.caption || `${product.name} installation`} className="aspect-[4/3] w-full object-cover" />
                {photo.caption ? <p className="px-3 py-2 text-sm text-slate-600">{photo.caption}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {catalogueHref ? (
        <p className="mt-8">
          <a href={catalogueHref} className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-brand">
            Download catalogue PDF
          </a>
        </p>
      ) : null}
    </div>
  );
}
