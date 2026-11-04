"use client";

import { useEffect, useState } from "react";
import { visitorId } from "@/lib/analytics/shop";

type Comment = { _id: string; name: string; body: string; createdAt: string };
type Engagement = { likes: number; liked: boolean; comments: Comment[] };

export function EventDiscussion({ slug }: { slug: string }) {
  const [data, setData] = useState<Engagement>({ likes: 0, liked: false, comments: [] });
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const id = visitorId();
    void fetch(`/api/events/${encodeURIComponent(slug)}/engagement?visitorId=${encodeURIComponent(id)}`)
      .then((response) => response.json())
      .then((payload: { data?: Engagement }) => {
        if (payload.data) setData(payload.data);
      })
      .catch(() => undefined);
  }, [slug]);

  async function like() {
    const id = visitorId();
    if (!id) return;
    const response = await fetch(`/api/events/${encodeURIComponent(slug)}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: id }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (payload?.data) setData(payload.data);
  }

  async function comment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const id = visitorId();
    const response = await fetch(`/api/events/${encodeURIComponent(slug)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: id, name, body, website: "" }),
    }).catch(() => null);
    const payload = response ? await response.json().catch(() => null) : null;
    if (!response?.ok || !payload?.data) {
      setMessage(payload?.message || "Could not post that comment.");
      return;
    }
    setData(payload.data);
    setBody("");
  }

  return (
    <section className="mt-10 max-w-3xl" aria-labelledby="event-comments">
      <div className="flex items-center justify-between gap-3">
        <h2 id="event-comments" className="text-2xl">Comments</h2>
        <button type="button" onClick={like} className="rounded-md border border-line px-3 py-2 text-sm font-semibold" aria-pressed={data.liked}>
          {data.liked ? "Liked" : "Like"} · {data.likes}
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {data.comments.map((item) => (
          <li key={item._id} className="rounded-md border border-line bg-surface p-3">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="mt-1 text-sm">{item.body}</p>
          </li>
        ))}
        {data.comments.length === 0 ? <li className="text-sm text-muted">No comments yet.</li> : null}
      </ul>
      <form onSubmit={comment} className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm font-semibold">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} className="h-11 rounded-md border border-line px-3 text-base font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Comment
          <textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={1000} rows={4} className="rounded-md border border-line px-3 py-2 text-base font-normal" />
        </label>
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        {message ? <p className="text-sm text-warning">{message}</p> : null}
        <button type="submit" className="h-11 w-fit rounded-md bg-brand px-4 text-sm font-semibold text-white">Post comment</button>
      </form>
    </section>
  );
}
