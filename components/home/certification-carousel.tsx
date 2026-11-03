import type { PublicCertification } from "@/lib/api/certifications";

export function CertificationCarousel({ logos }: { logos: PublicCertification[] }) {
  if (!logos.length) return null;
  const loop = logos.length > 1 ? [...logos, ...logos] : logos;

  return (
    <section className="bg-paper-deep py-12" aria-labelledby="certification-heading" id="certification">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 id="certification-heading" className="text-2xl">Certification</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">Companies and institutions.</p>
      </div>
      <div className="mt-6 overflow-hidden">
        <ul className={logos.length > 1 ? "certification-marquee flex w-max gap-4 px-4" : "flex justify-center gap-4 px-4"}>
          {loop.map((logo, index) => (
            <li key={`${logo.id}-${index}`} className="flex h-28 w-44 shrink-0 items-center justify-center rounded-2xl border border-line bg-white p-4">
              <img src={logo.imageUrl} alt={logo.name} className="max-h-full max-w-full object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
