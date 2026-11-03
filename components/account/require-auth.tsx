"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      if (active) setReady(true);
    });
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (ready && !user) router.replace("/account/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <p className="text-sm text-muted">Checking the demonstration session…</p>;
  }

  return children;
}
