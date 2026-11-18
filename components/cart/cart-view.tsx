"use client";

import { useState } from "react";
import Link from "next/link";
import { QuantityControl } from "@/components/cart/quantity-control";
import { Button } from "@/components/ui/button";
import { isEmail } from "@/lib/utils/phone";
import { useCartStore } from "@/store/cart";

const control = "mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-sm";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    const nextLocation = location.trim();
    const nextEmail = email.trim();
    if (!nextName) {
      setError("Enter your name.");
      return;
    }
    if (!nextLocation) {
      setError("Enter your location.");
      return;
    }
    if (!isEmail(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (items.length === 0) {
      setError("Add products to the cart first.");
      return;
    }
    setBusy(true);
    setError("");
    const products = items.map((item) => `${item.name} × ${item.quantity}`).join(", ");
    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "quote",
        name: nextName,
        location: nextLocation,
        email: nextEmail,
        products,
      }),
    }).catch(() => null);
    const payload = await response?.json().catch(() => ({})) as { message?: string };
    setBusy(false);
    if (!response?.ok) {
      setError(payload.message || "Could not send the quote request. Try again or call 0790 669 988.");
      return;
    }
    clear();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md border border-success/30 bg-success-soft p-6" role="status">
        <h2 className="text-xl text-success">Quote request sent</h2>
        <p className="mt-2 text-ink">Sales has your name, location, email, and the products from this cart.</p>
        <Link href="/#products" className="mt-4 inline-flex font-semibold text-brand">Back to products</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-8">
        <h2 className="text-xl">Your cart is empty</h2>
        <p className="mt-2 text-muted">Add products from the catalogue, then send a quote request from here.</p>
        <Link href="/#products" className="mt-4 inline-flex font-semibold text-brand">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ul className="divide-y divide-line rounded-md border border-line bg-surface">
        {items.map((item) => (
          <li key={item.productId} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <Link href={`/product/${item.slug}`} className="font-semibold hover:text-brand">{item.name}</Link>
              <p className="mt-1 text-sm text-muted">Qty {item.quantity}</p>
            </div>
            <div className="flex items-center gap-3">
              <QuantityControl value={item.quantity} label={item.name} onChange={(quantity) => setQuantity(item.productId, quantity)} />
              <button type="button" className="text-sm font-semibold text-accent" onClick={() => remove(item.productId)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <form id="quote-form" className="h-fit scroll-mt-28 rounded-md border border-line bg-surface p-5" onSubmit={submit} noValidate>
        <h2 className="text-lg">Request a quote</h2>
        <p className="mt-1 text-sm text-muted">Name, location, email, and the products in this cart.</p>
        <label className="mt-4 block text-sm font-semibold">
          Name
          <input className={control} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Location
          <input className={control} value={location} onChange={(event) => setLocation(event.target.value)} autoComplete="address-level2" required />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          Email
          <input className={control} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
        </label>
        <div className="mt-4">
          <p className="text-sm font-semibold">Products</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink">
            {items.map((item) => (
              <li key={item.productId}>{item.name} × {item.quantity}</li>
            ))}
          </ul>
        </div>
        {error ? <p className="mt-3 text-sm text-danger" role="alert">{error}</p> : null}
        <Button type="submit" className="mt-4 w-full" disabled={busy}>{busy ? "Sending…" : "Send quote request"}</Button>
      </form>
    </div>
  );
}
