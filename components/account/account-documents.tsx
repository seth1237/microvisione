"use client";

import { useEffect, useState } from "react";

type AccountDocument = {
  id: string;
  title: string;
  filename: string;
  createdAt: string;
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function AccountDocuments() {
  const [documents, setDocuments] = useState<AccountDocument[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch("/api/account/documents", { cache: "no-store" }).catch(() => null);
      if (!active) return;
      if (!response?.ok) {
        setError("Documents could not be loaded.");
        setDocuments([]);
        return;
      }
      const payload = await response.json().catch(() => null);
      setDocuments(Array.isArray(payload?.data) ? payload.data : []);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (!documents) return <p className="mt-6 text-sm text-muted">Loading documents…</p>;
  if (error) return <p className="mt-6 text-sm text-danger">{error}</p>;
  if (!documents.length) {
    return <p className="mt-6 text-sm text-muted">No documents yet.</p>;
  }

  return (
    <ul className="mt-6 divide-y divide-line rounded-md border border-line bg-surface">
      {documents.map((document) => (
        <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="font-semibold">{document.title}</p>
            <p className="truncate text-sm text-muted">
              {document.filename}
              {document.createdAt ? ` · ${formatWhen(document.createdAt)}` : ""}
            </p>
          </div>
          <a href={`/api/account/documents/${document.id}/file`} className="text-sm font-semibold text-brand">
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
