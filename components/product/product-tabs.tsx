"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Download } from "lucide-react";
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

export function ProductTabs({ product }: { product: Product }) {
  const overview = product.longDescription
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !isPlaceholderCopy(paragraph, product.name));
  const specs = product.specs.filter((spec) => spec.value.trim() && !isPlaceholderCopy(spec.value, product.name));
  const notes = product.accessoryNotes.filter((note) => !isPlaceholderCopy(note, product.name));
  const documents = product.documents.filter(
    (document) => !isPlaceholderCopy(document.title, product.name) && !isPlaceholderCopy(document.href, product.name),
  );
  const faqs = product.faqs.filter(
    (faq) => !isPlaceholderCopy(faq.question, product.name) && !isPlaceholderCopy(faq.answer, product.name),
  );
  const steps = (product.howToUse || "")
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[\.\)]\s*/, "").trim())
    .filter((line) => line && !isPlaceholderCopy(line, product.name));
  const parameters = (product.measuringParameters || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !isPlaceholderCopy(line, product.name))
    .map((line) => {
      const match = line.match(/^(.{2,48}?)\s*[:|]\s+(.+)$/);
      return match ? { label: match[1].trim(), value: match[2].trim() } : { label: "", value: line };
    });

  const sections = [
    overview.length ? "overview" : "",
    steps.length ? "how-to-use" : "",
    parameters.length ? "measuring" : "",
    specs.length ? "specifications" : "",
    notes.length ? "consumables" : "",
    documents.length ? "documents" : "",
    faqs.length ? "faqs" : "",
  ].filter(Boolean);

  if (!sections.length) return null;

  const labels: Record<string, string> = {
    overview: "Overview",
    "how-to-use": "How to use",
    measuring: "Measuring parameters",
    specifications: "Specifications",
    consumables: "Consumables and accessories",
    documents: "Documents",
    faqs: "FAQs",
  };

  return (
    <Tabs.Root defaultValue={sections[0]} className="mt-10 min-w-0 rounded-md border border-line bg-white">
      <Tabs.List className="flex gap-1 overflow-x-auto border-b border-line px-2" aria-label="Product information">
        {sections.map((value) => (
          <Tabs.Trigger
            key={value}
            value={value}
            className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-muted data-[state=active]:border-brand data-[state=active]:text-ink"
          >
            {labels[value]}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {sections.includes("overview") ? (
        <Tabs.Content value="overview" className="space-y-4 py-6">
          {overview.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="max-w-3xl px-5 text-ink">{paragraph}</p>
          ))}
        </Tabs.Content>
      ) : null}
      {sections.includes("how-to-use") ? (
        <Tabs.Content value="how-to-use" className="py-6">
          <ol className="max-w-3xl list-decimal space-y-3 px-5 pl-10 text-ink">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Tabs.Content>
      ) : null}
      {sections.includes("measuring") ? (
        <Tabs.Content value="measuring" className="py-6">
          {parameters.some((row) => row.label) ? (
            <dl className="divide-y divide-line">
              {parameters.map((row) => (
                <div key={`${row.label}-${row.value}`} className="grid gap-1 px-5 py-3 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="font-medium text-ink">{row.label || row.value}</dt>
                  {row.label ? <dd className="text-ink">{row.value}</dd> : <dd className="sr-only">{row.value}</dd>}
                </div>
              ))}
            </dl>
          ) : (
            <ul className="max-w-3xl list-disc space-y-2 px-5 pl-10">
              {parameters.map((row) => (
                <li key={row.value}>{row.value}</li>
              ))}
            </ul>
          )}
        </Tabs.Content>
      ) : null}
      {sections.includes("specifications") ? (
        <Tabs.Content value="specifications" className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <caption className="sr-only">Key specifications for {product.name}</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-4 font-semibold">Item</th>
                  <th scope="col" className="py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-line">
                    <th scope="row" className="py-3 pr-4 font-medium">{spec.label}</th>
                    <td className="py-3">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Content>
      ) : null}
      {sections.includes("consumables") ? (
        <Tabs.Content value="consumables" className="py-6">
          <ul className="max-w-3xl list-disc space-y-2 pl-5">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </Tabs.Content>
      ) : null}
      {sections.includes("documents") ? (
        <Tabs.Content value="documents" className="space-y-3 py-6">
          {documents.map((document) => (
            <a
              key={document.id}
              href={document.href}
              download
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-white px-4 py-3"
            >
              <span>
                <span className="block font-semibold">{document.title}</span>
                <span className="text-sm text-muted">{document.kind}</span>
              </span>
              <Download className="h-4 w-4 text-brand" aria-hidden="true" />
            </a>
          ))}
        </Tabs.Content>
      ) : null}
      {sections.includes("faqs") ? (
        <Tabs.Content value="faqs" className="divide-y divide-line py-2">
          {faqs.map((faq) => (
            <details key={faq.question} className="py-3">
              <summary className="cursor-pointer font-semibold">{faq.question}</summary>
              <p className="mt-2 max-w-3xl text-muted">{faq.answer}</p>
            </details>
          ))}
        </Tabs.Content>
      ) : null}
    </Tabs.Root>
  );
}
