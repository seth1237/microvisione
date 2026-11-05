"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  const router = useRouter();

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch("/api/account/me", { cache: "no-store", credentials: "include" }).catch(() => null);
      if (!active) return;
      if (!response || response.status === 401) {
        signOut();
        setState("out");
        router.replace("/account/login");
        return;
      }
      if (!response.ok) {
        setState("out");
        return;
      }
      const payload = await response.json().catch(() => null);
      const customer = payload?.data as { name?: string; facilityName?: string; email?: string; phone?: string } | undefined;
      if (!customer?.email && !customer?.phone) {
        signOut();
        setState("out");
        router.replace("/account/login");
        return;
      }
      signIn({
        name: customer.name || customer.email || "Client",
        organisation: customer.facilityName || "",
        role: "Client",
        email: customer.email || "",
        phone: customer.phone || "",
      });
      setState("in");
    }
    void load();
    return () => {
      active = false;
    };
  }, [router, signIn, signOut]);

  if (state !== "in") {
    return <p className="text-sm text-muted">{state === "loading" ? "Checking your account…" : "Sign in to open this account."}</p>;
  }

  return children;
}
