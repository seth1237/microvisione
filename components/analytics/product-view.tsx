"use client";

import { useEffect } from "react";
import { postShopEvent } from "@/lib/analytics/shop";

const seen = new Set<string>();

export function ProductView({
  productId,
  productName,
  categoryId,
  categoryName,
}: {
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
}) {
  useEffect(() => {
    if (!productId || seen.has(productId)) return;
    seen.add(productId);
    postShopEvent("/api/products/click", { productId, productName, categoryId, categoryName });
  }, [productId, productName, categoryId, categoryName]);

  return null;
}
