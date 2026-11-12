"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type ProfilePage = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
};

export function ProfileBook({ pages }: { pages: ProfilePage[] }) {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<"next" | "prev" | "">("");
  const page = pages[Math.min(index, pages.length - 1)];
  if (!page) return null;

  function go(next: number) {
    if (next < 0 || next >= pages.length || next === index) return;
    setTurn(next > index ? "next" : "prev");
    setIndex(next);
  }

  return (
    <div className="mt-4">
      <style>{`
        @keyframes mv-flip-next { from { transform: perspective(1400px) rotateY(-16deg); opacity: .55 } to { transform: none; opacity: 1 } }
        @keyframes mv-flip-prev { from { transform: perspective(1400px) rotateY(16deg); opacity: .55 } to { transform: none; opacity: 1 } }
        .mv-flip-next { animation: mv-flip-next 280ms ease }
        .mv-flip-prev { animation: mv-flip-prev 280ms ease }
      `}</style>
      <div
        className="mx-auto max-w-3xl"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(index + 1);
          if (event.key === "ArrowLeft") go(index - 1);
        }}
      >
        <article
          key={page.id}
          className={`overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] ${turn === "next" ? "mv-flip-next" : ""} ${turn === "prev" ? "mv-flip-prev" : ""}`}
          aria-label={`Company profile, page ${index + 1} of ${pages.length}`}
        >
          {page.imageUrl ? (
            <img src={page.imageUrl} alt="" className="max-h-[78vh] w-full bg-[#F8FAFC] object-contain" />
          ) : null}
          {page.body ? <p className="whitespace-pre-line px-5 py-4 text-sm leading-6">{page.body}</p> : null}
        </article>
        {pages.length > 1 ? (
          <div className="mt-3 mb-4 flex items-center justify-between gap-3 lg:mb-0">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-semibold text-[#111827] disabled:opacity-40"
              onClick={() => go(index - 1)}
              disabled={index === 0}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <p className="text-sm text-slate-500">{index + 1} / {pages.length}</p>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-200 px-3 text-sm font-semibold text-[#111827] disabled:opacity-40"
              onClick={() => go(index + 1)}
              disabled={index === pages.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
