"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export function ProductGallery({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (!photoUrl) return null;

  return (
    <Dialog.Root>
      <div className="overflow-hidden rounded-md bg-white">
        <img src={photoUrl} alt={name} className="aspect-[4/3] w-full bg-white object-contain" />
      </div>
      <div className="mt-3 flex justify-end">
        <Dialog.Trigger className="text-sm font-semibold text-brand">Enlarge</Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(920px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-4 shadow-pop">
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="text-lg">{name}</Dialog.Title>
            <Dialog.Close className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line" aria-label="Close">
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{name}</Dialog.Description>
          <img src={photoUrl} alt="" className="mt-3 max-h-[70vh] w-full bg-white object-contain" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
