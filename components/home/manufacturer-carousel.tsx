"use client";

import type { PublicManufacturer } from "@/lib/api/site-media";

function marqueeItems(items: PublicManufacturer[]) {
  const base = [...items];
  while (base.length < 4) base.push(...items);
  return base;
}

export function ManufacturerCarousel({ items }: { items: PublicManufacturer[] }) {
  if (!items.length) return null;
  const base = marqueeItems(items);
  const track = [...base, ...base];

  return (
    <section className="bg-white py-10 lg:py-14" aria-labelledby="partners-heading" id="partners">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <h2 id="partners-heading" className="text-2xl">Partners</h2>
      </div>
      <ul className="mt-6 flex gap-8 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden" aria-label="Partners">
        {items.map((item) => (
          <li key={item.id} className="flex w-44 shrink-0 flex-col items-center justify-center">
            <img src={item.logoUrl} alt="" className="h-20 w-full object-contain" />
            <p className="mt-2 text-center text-sm font-semibold text-ink">{item.name}</p>
          </li>
        ))}
      </ul>
      <div className="partners-fade relative mt-8 hidden overflow-hidden lg:block">
        <ul
          className="partners-marquee flex w-max items-center gap-16"
          style={{ animationDuration: `${Math.max(base.length, 2) * 12}s` }}
          aria-label="Partners"
        >
          {track.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex w-[600px] shrink-0 flex-col items-center justify-center" aria-hidden={index >= base.length}>
              <img src={item.logoUrl} alt={index >= base.length ? "" : item.name} className="h-[200px] w-[600px] object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
