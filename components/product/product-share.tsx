"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { postShopEvent } from "@/lib/analytics/shop";

export function ProductShare({
  title,
  url,
  productId,
  categoryId,
  categoryName,
}: {
  title: string;
  url: string;
  productId: string;
  categoryId: string;
  categoryName: string;
}) {
  const [copied, setCopied] = useState(false);

  function record() {
    postShopEvent("/api/products/share", { productId, productName: title, categoryId, categoryName });
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        record();
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      record();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
    >
      <Share2 size={16} aria-hidden="true" />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
