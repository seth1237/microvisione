"use client";

import { Reveal } from "@/components/motion/reveal";

export function PageIntro({
  title,
  lede,
}: {
  title: string;
  lede?: string;
}) {
  return (
    <Reveal>
      <header className="max-w-3xl">
        <h1 className="text-3xl text-ink sm:text-4xl">{title}</h1>
        {lede ? <p className="mt-3 text-base text-muted">{lede}</p> : null}
      </header>
    </Reveal>
  );
}
