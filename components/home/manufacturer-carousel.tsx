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
    <section className="bg-white py-5 lg:py-7" aria-labelledby="partners-heading" id="partners">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <h2 id="partners-heading" className="text-xl">Partners</h2>
      </div>
      <ul className="mt-3 flex gap-4 overflow-x-auto px-4 [scrollbar-width:none] lg:hidden" aria-label="Partners">
        {items.map((item) => (
          <li key={item.id} className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center">
            <img src={item.logoUrl} alt="" className="h-10 w-full object-contain" />
            <p className="mt-1 text-center text-xs font-semibold text-ink">{item.name}</p>
          </li>
        ))}
      </ul>
      <div className="partners-fade relative mt-4 hidden overflow-hidden lg:block">
        <ul
          className="partners-marquee flex w-max items-center gap-8"
          style={{ animationDuration: `${Math.max(base.length, 2) * 12}s` }}
          aria-label="Partners"
        >
          {track.map((item, index) => (
            <li key={`${item.id}-${index}`} className="flex w-[300px] shrink-0 flex-col items-center justify-center" aria-hidden={index >= base.length}>
              <img src={item.logoUrl} alt={index >= base.length ? "" : item.name} className="h-[100px] w-[300px] object-contain" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
