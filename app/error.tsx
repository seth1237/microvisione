"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-3 text-muted">The page did not finish loading. You can try again. If it keeps failing, call 0790 669 988.</p>
      <Button type="button" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
