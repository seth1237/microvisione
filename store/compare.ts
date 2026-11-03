"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStorage } from "@/store/storage";

export const COMPARE_LIMIT = 4;

interface CompareState {
  ids: string[];
  add: (productId: string) => "added" | "exists" | "full";
  remove: (productId: string) => void;
  clear: () => void;
  has: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (productId) => get().ids.includes(productId),
      add: (productId) => {
        const ids = get().ids;
        if (ids.includes(productId)) return "exists";
        if (ids.length >= COMPARE_LIMIT) return "full";
        set({ ids: [...ids, productId] });
        return "added";
      },
      remove: (productId) => set({ ids: get().ids.filter((id) => id !== productId) }),
      clear: () => set({ ids: [] }),
    }),
    { name: "mv-compare", storage: persistedStorage<CompareState>(), skipHydration: true },
  ),
);
