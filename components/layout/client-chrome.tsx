"use client";

import { Suspense } from "react";
import { Toaster } from "sonner";
import { CompareTray } from "@/components/layout/compare-tray";
import { ConsentBanner } from "@/components/layout/consent-banner";
import { MobileDock } from "@/components/layout/mobile-dock";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { StoreHydrator } from "@/store/hydrate";

export function ClientChrome() {
  return (
    <>
      <StoreHydrator />
      <Suspense fallback={null}>
        <MobileDock />
      </Suspense>
      <WhatsAppButton />
      <CompareTray />
      <ConsentBanner />
      <Toaster position="top-center" />
    </>
  );
}
