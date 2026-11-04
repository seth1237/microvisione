"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

export type BrandCard = {
  id: string;
  slug: string;
  name: string;
  count: number;
  logoUrl?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0, 2) || "").toUpperCase();
  return letters;
}

export function BrandGrid({ brands }: { brands: BrandCard[] }) {
  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {brands.map((brand, index) => (
        <li key={brand.id}>
          <Reveal delay={(index % 4) * 50}>
            <Link
              href={`/brands/${brand.slug}`}
              className="group flex h-full flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-center transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="flex h-20 w-full items-center justify-center">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt=""
                    className="max-h-16 w-full object-contain transition-transform duration-[400ms] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-slate-200 bg-white text-lg font-semibold tracking-wide text-[#1211bb]">
                    {initials(brand.name)}
                  </span>
                )}
              </span>
              <h2 className="mt-4 text-sm font-semibold text-[#111827]">{brand.name}</h2>
              {brand.count > 0 ? (
                <p className="mt-1 text-xs text-slate-500">{brand.count} {brand.count === 1 ? "product" : "products"}</p>
              ) : null}
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
