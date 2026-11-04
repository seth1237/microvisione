"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AccountDocument = {
  id: string;
  title: string;
  filename: string;
  createdAt: string;
  email?: string;
};

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminDocumentsPanel({ items }: { items: AccountDocument[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    if (!String(form.get("email") || "").includes("@")) {
      setMessage("Enter the client email");
      return;
    }
    if (!String(form.get("title") || "").trim()) {
      setMessage("Enter a document title");
      return;
    }
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setMessage("Choose a document");
      return;
    }
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/account-documents", { method: "POST", body: form });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not save the document");
      return;
    }
    setEmail("");
    setTitle("");
    formEl.reset();
    setMessage("Document added. The client can download it after signing in with that email.");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/admin/account-documents/${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not remove the document");
      return;
    }
    setMessage("Document removed.");
    router.refresh();
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Microvision Enterprises Ltd</span>
          <h1>Client documents</h1>
          <p>Upload a file for a client email. They sign in with that email and open it under Account, Documents.</p>
        </div>
      </header>
      {message ? <p className="admin-message">{message}</p> : null}
      <form className="admin-editor" onSubmit={upload}>
        <label>
          Client email
          <input name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="client@example.com" />
        </label>
        <label>
          Title
          <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Invoice, statement, or certificate" />
        </label>
        <label>
          Document
          <input name="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,image/*" />
        </label>
        <button className="button button-primary button-compact" disabled={busy} type="submit">
          Upload document
        </button>
      </form>
      {items.length ? (
        <ul className="admin-image-list">
          {items.map((item) => (
            <li key={item.id} className="admin-image-item">
              <div>
                <strong>{item.title}</strong>
                <p>{item.email}</p>
                <small>{item.filename}{item.createdAt ? ` · ${formatWhen(item.createdAt)}` : ""}</small>
              </div>
              <button type="button" className="button button-compact" disabled={busy} onClick={() => remove(item.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No client documents yet.</p>
      )}
    </>
  );
}
