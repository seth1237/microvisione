import { createJSONStorage } from "zustand/middleware";

/**
 * localStorage wrapped so private mode, quota errors and SSR do not throw.
 * Stores call `persist.rehydrate()` after mount.
 */
const memory = new Map<string, string>();

export const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return memory.get(name) ?? null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name: string, value: string) => {
    memory.set(name, value);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* ignore quota and privacy-mode failures */
    }
  },
  removeItem: (name: string) => {
    memory.delete(name);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export function persistedStorage<T>() {
  return createJSONStorage<T>(() => safeLocalStorage);
}
