import type { PublicManufacturer } from "@/lib/api/site-media";

export function ManufacturerCarousel({ items }: { items: PublicManufacturer[] }) {
  if (!items.length) return null;
  const loop = items.length > 1 ? [...items, ...items] : items;

  return (
    <section className="bg-white py-12" aria-labelledby="manufacturers-heading" id="manufacturers">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 id="manufacturers-heading" className="text-2xl">Manufacturers</h2>
      </div>
      <div className="mt-6 overflow-hidden">
        <ul className={items.length > 1 ? "certification-marquee flex w-max gap-4 px-4" : "flex justify-center gap-4 px-4"}>
          {loop.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex h-40 w-48 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-paper p-4 text-center">
              <img src={item.logoUrl} alt="" className="h-16 w-full object-contain" />
              <p className="text-sm font-semibold text-ink">{item.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
