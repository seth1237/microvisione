"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { formatIsoDate, formatKes } from "@/lib/utils/format";

export function ConfirmationView() {
  const order = useCartStore((state) => state.lastOrder);
  if (!order) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-8">
        <h2 className="text-xl">No order in this browser</h2>
        <p className="mt-2 text-muted">Complete checkout to see the confirmation.</p>
        <Link href="/#products" className="mt-4 inline-flex font-semibold text-brand">Browse priced items</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl rounded-md border border-success/30 bg-success-soft p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-success">{order.paymentStatus === "success" ? "Payment confirmed" : "Request recorded"}</p>
      <h2 className="mt-2 text-2xl text-ink">{order.paymentMethod === "invoice" ? "Invoice request" : `Reference ${order.reference}`}</h2>
      <p className="mt-2 text-sm text-muted">
        {formatIsoDate(order.placedAt)}.
        {order.paymentStatus === "success" ? " M-Pesa confirmed this payment." : " No M-Pesa payment was taken."}
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt>Payment</dt><dd>{order.paymentMethod === "invoice" ? "Invoice request" : `M-Pesa ${order.mpesaReceipt ?? ""}`}</dd></div>
        <div className="flex justify-between gap-4"><dt>Deliver to</dt><dd>{order.collection ? "Collection, Loipi Plaza" : `${order.facility}, ${order.town}`}</dd></div>
        <div className="flex justify-between gap-4"><dt>Total</dt><dd className="font-semibold">{formatKes(order.total)}</dd></div>
      </dl>
      {order.includesExamplePrices ? <p className="mt-3 text-sm text-warning">The total uses example prices.</p> : null}
      <ul className="mt-4 space-y-1 text-sm">
        {order.lines.map((line) => (
          <li key={line.productId}>{line.name} × {line.quantity}</li>
        ))}
      </ul>
      <Link href="/account/orders" className="mt-6 inline-flex font-semibold text-brand">View orders in the account</Link>
    </div>
  );
}
