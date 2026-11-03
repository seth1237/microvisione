import type { PublicCertification } from "@/lib/api/certifications";

export function CertificationCarousel({ logos }: { logos: PublicCertification[] }) {
  const loop = logos.length > 1 ? [...logos, ...logos] : logos;

  return (
    <section className="bg-paper-deep py-12" aria-labelledby="certification-heading" id="certification">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 id="certification-heading" className="text-2xl">Certification</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Companies, institutions, and the event or purpose of each certificate.</p>
      </div>
      {logos.length ? (
        <div className="mt-6 overflow-hidden">
          <ul className={logos.length > 1 ? "certification-marquee flex w-max gap-4 px-4" : "flex justify-center gap-4 px-4"}>
            {loop.map((logo, index) => (
              <li key={`${logo.id}-${index}`} className="flex h-44 w-52 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white p-4 text-center">
                <img src={logo.imageUrl} alt="" className="h-16 w-full object-contain" />
                <p className="text-sm font-semibold text-ink">{logo.name}</p>
                {logo.purpose ? <p className="line-clamp-2 text-xs text-muted">{logo.purpose}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
