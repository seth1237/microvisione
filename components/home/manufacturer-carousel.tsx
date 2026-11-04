"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicManufacturer } from "@/lib/api/site-media";

export function ManufacturerCarousel({ items }: { items: PublicManufacturer[] }) {
  const scroller = useRef<HTMLUListElement>(null);

  function move(direction: number) {
    const list = scroller.current;
    if (!list) return;
    const card = list.querySelector("li");
    const distance = card ? card.getBoundingClientRect().width + 16 : 240;
    const max = list.scrollWidth - list.clientWidth;
    const next = list.scrollLeft + direction * distance;
    if (next > max + 4) list.scrollTo({ left: 0, behavior: "smooth" });
    else if (next < 0) list.scrollTo({ left: max, behavior: "smooth" });
    else list.scrollBy({ left: direction * distance, behavior: "smooth" });
  }

  useEffect(() => {
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => move(1), 4000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <section className="bg-white py-12" aria-labelledby="partners-heading" id="partners">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="partners-heading" className="text-2xl">Partners</h2>
          {items.length > 1 ? (
            <div className="flex gap-2">
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white" aria-label="Previous partners" onClick={() => move(-1)}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white" aria-label="Next partners" onClick={() => move(1)}>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
        <ul ref={scroller} className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none]" aria-label="Partners">
          {items.map((item) => (
            <li key={item.id} className="flex h-40 w-48 shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-paper p-4 text-center">
              <img src={item.logoUrl} alt="" className="h-16 w-full object-contain" />
              <p className="text-sm font-semibold text-ink">{item.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
