"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryPhoto } from "@/lib/platform/content";

export function AdminGalleryPanel({ items }: { items: GalleryPhoto[] }) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    if (!String(form.get("caption") || "").trim()) {
      setMessage("Enter a caption");
      return;
    }
    if (!(form.get("image") instanceof File) || (form.get("image") as File).size === 0) {
      setMessage("Choose an image");
      return;
    }
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/admin/gallery", { method: "POST", body: form });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not save the photo");
      return;
    }
    setCaption("");
    formEl.reset();
    setMessage("Photo added. It will show in the gallery.");
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/admin/gallery/${encodeURIComponent(id)}`, { method: "DELETE" });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setMessage(payload.message || "Could not remove the photo");
      return;
    }
    setMessage("Photo removed.");
    router.refresh();
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Microvision Enterprises Ltd</span>
          <h1>Gallery</h1>
          <p>Upload a photo and a caption. They appear together on the homepage gallery.</p>
        </div>
      </header>
      {message ? <p className="admin-message">{message}</p> : null}
      <form className="admin-editor" onSubmit={upload}>
        <label>
          Caption
          <input name="caption" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="What the photo shows" />
        </label>
        <label>
          Image
          <input name="image" type="file" accept="image/*" />
        </label>
        <button className="button button-primary button-compact" disabled={busy} type="submit">
          Add photo
        </button>
      </form>
      <ul className="admin-image-list">
        {items.map((item) => (
          <li key={item._id} className="admin-image-item">
            <div className="admin-thumb">
              {item.image?.secureUrl ? <img src={item.image.secureUrl} alt="" /> : null}
            </div>
            <p>{item.caption}</p>
            <button type="button" disabled={busy} onClick={() => remove(item._id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
