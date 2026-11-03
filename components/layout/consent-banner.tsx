"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const KEY = "mv-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setVisible(window.localStorage.getItem(KEY) !== "accepted");
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!visible) return null;

  function accept() {
    try {
      window.localStorage.setItem(KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-surface p-3 shadow-pop lg:inset-x-auto lg:bottom-6 lg:left-4 lg:max-w-sm lg:rounded-md lg:border" role="dialog" aria-label="Cookie notice">
      <p className="text-sm text-ink">
        This browser stores your quote basket, cart, wishlist and this consent choice. No advertising cookies are set. See the{" "}
        <Link href="/legal/privacy" className="font-semibold text-brand">privacy notice</Link>.
      </p>
      <Button type="button" size="sm" className="mt-3" onClick={accept}>
        Accept
      </Button>
    </div>
  );
}
