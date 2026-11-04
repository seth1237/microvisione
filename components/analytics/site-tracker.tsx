"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { postShopEvent, visitorId } from "@/lib/analytics/shop";

const recent = new Map<string, number>();

export function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const now = Date.now();
    if (now - (recent.get(pathname) || 0) < 1200) return;
    recent.set(pathname, now);
    const id = visitorId();
    if (!id) return;
    postShopEvent("/api/analytics/visit", { visitorId: id, path: pathname });
  }, [pathname]);

  return null;
}
