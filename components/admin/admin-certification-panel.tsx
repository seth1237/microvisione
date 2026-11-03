"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CertificationLogo } from "@/lib/platform/content";

export function AdminCertificationPanel({ items }: { items: CertificationLogo[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!String(form.get("name") || "").trim()) {
      setMessage("Enter the company or institution name");
      return;
    }
    if (!(form.get("logo") instanceof File) || (form.get("logo") as File).size === 0) {
      setMessage("Choose a logo image");
      return;
    }
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/certifications", { method: "POST", body: form });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not save the logo");
      return;
    }
    setName("");
    setPurpose("");
    event.currentTarget.reset();
    setMessage("Logo added. It will show in the Certification carousel.");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/admin/certifications/${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not remove the logo");
      return;
    }
    setMessage("Logo removed.");
    router.refresh();
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Microvision Enterprises Ltd</span>
          <h1>Certification</h1>
          <p>Upload a certificate logo and the event or purpose. Both appear in the homepage carousel.</p>
        </div>
      </header>
      {message ? <p className="admin-message">{message}</p> : null}
      <form className="admin-editor" onSubmit={upload}>
        <label>
          Company or institution
          <input name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name shown with the logo" />
        </label>
        <label>
          Event or purpose
          <input name="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Training, award, partnership…" />
        </label>
        <label>
          Logo
          <input name="logo" type="file" accept="image/*" />
        </label>
        <button className="button button-primary button-compact" disabled={busy} type="submit">
          Add logo
        </button>
      </form>
      <ul className="admin-image-list">
        {items.map((item) => (
          <li key={item._id} className="admin-image-item">
            <div className="admin-thumb">
              {item.image?.secureUrl ? <img src={item.image.secureUrl} alt="" /> : null}
            </div>
            <p>{item.name}</p>
            {item.purpose ? <p className="text-muted-foreground">{item.purpose}</p> : null}
            <button type="button" disabled={busy} onClick={() => remove(item._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
