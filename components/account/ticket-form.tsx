"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { makeReference } from "@/lib/utils/format";

export function TicketForm() {
  const [subject, setSubject] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (reference) {
    return (
      <p className="rounded-md bg-success-soft px-3 py-3 text-sm text-success" role="status">
        Ticket {reference} noted in this browser only. It will disappear when you refresh.
      </p>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (subject.trim().length < 8) {
          setError("Describe the issue in at least a few words.");
          return;
        }
        setError("");
        setReference(makeReference("MVT"));
      }}
    >
      <label className="block text-sm font-semibold">
        What do you need?
        <textarea className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-2 text-sm" value={subject} onChange={(event) => setSubject(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm">Open a sample ticket</Button>
    </form>
  );
}
