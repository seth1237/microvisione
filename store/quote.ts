"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStorage } from "@/store/storage";
import type { QuoteLine, QuoteRequest } from "@/types";

interface QuoteState {
  lines: QuoteLine[];
  lastRequest: QuoteRequest | null;
  add: (line: QuoteLine) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  setLastRequest: (request: QuoteRequest | null) => void;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      lines: [],
      lastRequest: null,
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((item) => item.productId === line.productId);
          if (!existing) return { lines: [...state.lines, { ...line, quantity: clamp(line.quantity) }] };
          return {
            lines: state.lines.map((item) =>
              item.productId === line.productId
                ? { ...item, quantity: clamp(item.quantity + line.quantity) }
                : item,
            ),
          };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.productId === productId ? { ...line, quantity: clamp(quantity) } : line,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),
      clear: () => set({ lines: [] }),
      setLastRequest: (request) => set({ lastRequest: request }),
    }),
    { name: "mv-quote", storage: persistedStorage<QuoteState>(), skipHydration: true },
  ),
);

function clamp(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(99, Math.max(1, Math.round(quantity)));
}

export function quoteCount(lines: QuoteLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
