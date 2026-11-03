"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStorage } from "@/store/storage";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (productId) => get().ids.includes(productId),
      toggle: (productId) => {
        const exists = get().ids.includes(productId);
        set({
          ids: exists ? get().ids.filter((id) => id !== productId) : [...get().ids, productId],
        });
        return !exists;
      },
    }),
    { name: "mv-wishlist", storage: persistedStorage<WishlistState>(), skipHydration: true },
  ),
);
