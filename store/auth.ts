"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistedStorage } from "@/store/storage";
import type { AccountUser } from "@/types";

interface AuthState {
  user: AccountUser | null;
  signIn: (user: AccountUser) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    { name: "mv-account", storage: persistedStorage<AuthState>(), skipHydration: true },
  ),
);
