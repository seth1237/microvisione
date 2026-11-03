"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStorage } from "@/store/storage";
import type { CartItem, PlacedOrder } from "@/types";

interface CartState {
  items: CartItem[];
  lastOrder: PlacedOrder | null;
  add: (item: CartItem) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setLastOrder: (order: PlacedOrder | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      lastOrder: null,
      add: (item) =>
        set((state) => {
          const existing = state.items.find((line) => line.productId === item.productId);
          if (!existing) return { items: [...state.items, { ...item, quantity: clamp(item.quantity) }] };
          return {
            items: state.items.map((line) =>
              line.productId === item.productId
                ? { ...line, quantity: clamp(line.quantity + item.quantity) }
                : line,
            ),
          };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.productId === productId ? { ...line, quantity: clamp(quantity) } : line,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((line) => line.productId !== productId) })),
      clear: () => set({ items: [] }),
      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    { name: "mv-cart", storage: persistedStorage<CartState>(), skipHydration: true },
  ),
);

function clamp(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(99, Math.max(1, Math.round(quantity)));
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);
}
