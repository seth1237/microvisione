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

export function ProductFacts({ product, catalogueHref }: { product: Product; catalogueHref?: string }) {
  const overview = (product.longDescription || "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !isPlaceholderCopy(paragraph, product.name));
  const specs = product.features.filter((feature) => feature.trim() && !isPlaceholderCopy(feature, product.name));
  const steps = lines(product.howToUse || "", product.name);
  const parameters = lines(product.measuringParameters || "", product.name).map((line) => {
    const match = line.match(/^(.{2,48}?)\s*[:|]\s+(.+)$/);
    return match ? { label: match[1].trim(), value: match[2].trim() } : { label: "", value: line };
  });
  const installations = product.installations || [];
  if (!overview.length && !specs.length && !steps.length && !parameters.length && !installations.length && !catalogueHref) return null;

  return (
    <div className="mt-10 space-y-8 border-t border-slate-200 pt-8 sm:mt-14">
      {overview.length ? (
        <section aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-lg font-semibold text-[#111827]">Overview</h2>
          <div className="mt-3 max-w-3xl space-y-3 text-[15px] leading-7 text-[#111827]">
            {overview.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}
      {specs.length ? (
        <section aria-labelledby="specs-heading">
          <h2 id="specs-heading" className="text-lg font-semibold text-[#111827]">Key specs</h2>
          <ul className="mt-3 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
            {specs.map((spec) => (
              <li key={spec} className="bg-white px-4 py-3 text-sm text-[#111827]">{spec}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {steps.length ? (
        <section aria-labelledby="use-heading">
          <h2 id="use-heading" className="text-lg font-semibold text-[#111827]">How to use</h2>
          <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-[15px] leading-7 text-[#111827]">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}
      {parameters.length ? (
        <section aria-labelledby="measure-heading">
          <h2 id="measure-heading" className="text-lg font-semibold text-[#111827]">Measuring parameters</h2>
          {parameters.some((row) => row.label) ? (
            <dl className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
              {parameters.map((row) => (
                <div key={`${row.label}-${row.value}`} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <dt className="text-sm font-medium text-[#111827]">{row.label || row.value}</dt>
                  {row.label ? <dd className="text-sm text-[#111827]">{row.value}</dd> : null}
                </div>
              ))}
            </dl>
          ) : (
            <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-[15px] leading-7">
              {parameters.map((row) => (
                <li key={row.value}>{row.value}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {installations.length ? (
        <section aria-labelledby="install-heading">
          <h2 id="install-heading" className="text-lg font-semibold text-[#111827]">Recent installations</h2>
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
        <section aria-labelledby="catalogue-heading">
          <h2 id="catalogue-heading" className="text-lg font-semibold text-[#111827]">Catalogue</h2>
          <a href={catalogueHref} className="mt-3 inline-flex items-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-brand">
            Download PDF
          </a>
        </section>
      ) : null}
    </div>
  );
}
