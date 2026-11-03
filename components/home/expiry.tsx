"use client";

import { useEffect, useState } from "react";
import { formatIsoDate } from "@/lib/utils/format";

export function ExpiryCountdown({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState(expiresAt ? `Ends ${formatIsoDate(expiresAt)}` : "No end date");

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const end = Date.parse(expiresAt);
      const diff = end - Date.now();
      if (!Number.isFinite(end)) return;
      if (diff <= 0) {
        setLabel("Ended");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      setLabel(`${days}d ${hours}h left`);
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return <span>{label}</span>;
}
