"use client";

import { createContext, useContext } from "react";
import type { CatalogueBundle } from "@/types";

const CatalogueContext = createContext<CatalogueBundle | null>(null);

export function CatalogueProvider({
  catalogue,
  children,
}: {
  catalogue: CatalogueBundle | null;
  children: React.ReactNode;
}) {
  return <CatalogueContext.Provider value={catalogue}>{children}</CatalogueContext.Provider>;
}

export function useCatalogue(): CatalogueBundle {
  const value = useContext(CatalogueContext);
  if (!value) throw new Error("useCatalogue must be used within CatalogueProvider");
  return value;
}
