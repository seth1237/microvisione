"use client";

import Link from "next/link";
import { EnquiryForm } from "@/components/forms/enquiry-form";
import { QuantityControl } from "@/components/cart/quantity-control";
import { useQuoteStore } from "@/store/quote";
import type { QuoteRequest } from "@/types";

export function QuoteView() {
  const lines = useQuoteStore((state) => state.lines);
  const setQuantity = useQuoteStore((state) => state.setQuantity);
  const remove = useQuoteStore((state) => state.remove);
  const clear = useQuoteStore((state) => state.clear);
  const setLastRequest = useQuoteStore((state) => state.setLastRequest);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section aria-labelledby="basket-heading">
        <h2 id="basket-heading" className="text-xl">Quote basket</h2>
        {lines.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-line bg-surface p-6">
            <p className="text-ink">The basket is empty.</p>
            <p className="mt-2 text-sm text-muted">Add equipment from the catalogue, or describe a general requirement in the form.</p>
            <Link href="/products" className="mt-4 inline-flex font-semibold text-brand">Browse products</Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-surface">
            {lines.map((line) => (
              <li key={line.productId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/product/${line.slug}`} className="font-semibold hover:text-brand">{line.name}</Link>
                  <p className="text-sm text-muted">{line.brand}</p>
                </div>
                <div className="flex items-center gap-3">
                  <QuantityControl value={line.quantity} label={line.name} onChange={(quantity) => setQuantity(line.productId, quantity)} />
                  <button type="button" className="text-sm font-semibold text-accent" onClick={() => remove(line.productId)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section id="quote-form" aria-labelledby="quote-form-heading" className="scroll-mt-28 rounded-md border border-line bg-surface p-5">
        <h2 id="quote-form-heading" className="text-xl">Request a quote</h2>
        <p className="mt-2 text-sm text-muted">Tell us who to reply to. A reference number is created in this browser only.</p>
        <div className="mt-4">
          <EnquiryForm
            kind="quote"
            lines={lines}
            onComplete={({ reference, fields }) => {
              const request: QuoteRequest = {
                reference,
                name: fields.name,
                organisation: fields.organisation,
                role: fields.role,
                phone: fields.phone,
                email: fields.email,
                location: fields.location,
                notes: fields.notes,
                preferredDeliveryDate: fields.deliveryDate || undefined,
                lines,
                createdAt: new Date().toISOString(),
              };
              setLastRequest(request);
              clear();
              void fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: fields.name,
                  organisation: fields.organisation,
                  email: fields.email,
                  phone: fields.phone,
                  location: fields.location,
                  notes: fields.notes,
                  reference,
                  products: lines.map((line) => line.name).join(", "),
                }),
              }).catch(() => undefined);
            }}
          />
        </div>
      </section>
    </div>
  );
}
