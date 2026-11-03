import { Suspense } from "react";
import { ClientChrome } from "@/components/layout/client-chrome";
import { HeaderFallback } from "@/components/layout/header-fallback";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CatalogueProvider } from "@/components/providers/catalogue-provider";
import { getCatalogueBundle } from "@/lib/api/catalogue";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const catalogue = await getCatalogueBundle();

  return (
    <CatalogueProvider catalogue={catalogue}>
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col pb-16 outline-none lg:pb-0">
        {children}
      </main>
      <SiteFooter categories={catalogue.categories} />
      <ClientChrome />
    </CatalogueProvider>
  );
}
