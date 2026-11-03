"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useCompareStore } from "@/store/compare";
import { useQuoteStore } from "@/store/quote";
import { useWishlistStore } from "@/store/wishlist";

export function StoreHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useQuoteStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();
    void useCompareStore.persist.rehydrate();
    void useAuthStore.persist.rehydrate();
  }, []);
  return null;
}
