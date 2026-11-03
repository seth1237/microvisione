"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function ProductGallery({
  name,
  photos,
}: {
  name: string;
  photos: { url: string; caption: string }[];
}) {
  const [active, setActive] = useState(0);
  if (!photos.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-line bg-surface px-6 text-center text-sm text-muted">
        No photograph yet
      </div>
    );
  }
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div>
      <figure className="overflow-hidden rounded-md bg-white">
        <img src={current.url} alt={current.caption || name} className="aspect-[4/3] w-full bg-white object-contain" />
        {current.caption ? <figcaption className="border-t border-line px-1 py-3 text-sm text-muted">{current.caption}</figcaption> : null}
      </figure>
      {photos.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white ${index === active ? "border-brand" : "border-line"}`}
              aria-label={photo.caption || `Photo ${index + 1}`}
            >
              <img src={photo.url} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Dialog.Root>
          <Dialog.Trigger className="text-sm font-semibold text-brand">Enlarge</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(920px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-4 shadow-pop">
              <div className="flex items-center justify-between gap-3">
                <Dialog.Title className="text-lg">{current.caption || name}</Dialog.Title>
                <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line" aria-label="Close">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">{current.caption || name}</Dialog.Description>
              <img src={current.url} alt="" className="mt-3 max-h-[70vh] w-full bg-white object-contain" />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
