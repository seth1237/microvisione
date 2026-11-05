"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatIsoDate, formatKes } from "@/lib/utils/format";

export type AccountProfile = {
  name: string;
  facilityName: string;
  email: string;
  phone: string;
  location: string;
};

export type AccountOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type AccountOrder = {
  id: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  amount: number;
  items: AccountOrderItem[];
  mpesaReceipt: string;
  createdAt: string;
  location: string;
};

export type AccountPurchase = {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  lastBoughtAt: string;
};

type AccountPayload = {
  account: AccountProfile | null;
  orders: AccountOrder[];
  bought: AccountPurchase[];
  documentCount: number | null;
  error: string;
};

const empty: AccountPayload = {
  account: null,
  orders: [],
  bought: [],
  documentCount: null,
  error: "",
};

export function orderStatusLabel(status: AccountOrder["status"]) {
  if (status === "paid") return "Paid";
  if (status === "failed") return "Not completed";
  if (status === "cancelled") return "Cancelled";
  return "Waiting for M-Pesa";
}

export function orderStatusTone(status: AccountOrder["status"]): "success" | "warning" | "danger" | "neutral" {
  if (status === "paid") return "success";
  if (status === "failed") return "danger";
  if (status === "cancelled") return "neutral";
  return "warning";
}

export function displayPhone(phone: string) {
  if (phone.startsWith("254") && phone.length === 12) return `0${phone.slice(3)}`;
  return phone;
}

export function useAccountRecords() {
  const [data, setData] = useState<AccountPayload>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const [ordersResponse, documentsResponse] = await Promise.all([
        fetch("/api/account/orders", { cache: "no-store", credentials: "include" }).catch(() => null),
        fetch("/api/account/documents", { cache: "no-store", credentials: "include" }).catch(() => null),
      ]);
      if (!active) return;
      if (!ordersResponse?.ok) {
        setData({ ...empty, error: "This account could not be loaded." });
        setReady(true);
        return;
      }
      const ordersPayload = await ordersResponse.json().catch(() => null);
      const body = ordersPayload?.data || {};
      let documentCount: number | null = null;
      if (documentsResponse?.ok) {
        const documentsPayload = await documentsResponse.json().catch(() => null);
        documentCount = Array.isArray(documentsPayload?.data) ? documentsPayload.data.length : 0;
      }
      setData({
        account: body.account || null,
        orders: Array.isArray(body.orders) ? body.orders : [],
        bought: Array.isArray(body.bought) ? body.bought : [],
        documentCount,
        error: "",
      });
      setReady(true);
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  return { ...data, ready };
}

export function AccountOverview() {
  const { account, orders, bought, documentCount, error, ready } = useAccountRecords();
  if (!ready) return <p className="text-sm text-muted">Loading your account…</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  const facts = [
    ["Name", account?.name],
    ["Facility", account?.facilityName],
    ["Email", account?.email],
    ["Phone", account?.phone ? displayPhone(account.phone) : ""],
    ["Location", account?.location],
  ].filter(([, value]) => value);

  return (
    <div>
      <h1 className="text-3xl">Account</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Orders and documents recorded for this sign-in.</p>
      {facts.length ? (
        <dl className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-md border border-line bg-surface p-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <ul className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
        <li>
          <Link href="/account/orders" className="block rounded-md border border-line bg-surface p-4">
            <p className="text-sm text-muted">Orders</p>
            <p className="text-2xl font-semibold">{orders.length}</p>
          </Link>
        </li>
        <li>
          <Link href="/account/documents" className="block rounded-md border border-line bg-surface p-4">
            <p className="text-sm text-muted">Documents</p>
            <p className="text-2xl font-semibold">{documentCount ?? "—"}</p>
          </Link>
        </li>
      </ul>
      <section className="mt-8">
        <h2 className="text-lg">Recent orders</h2>
        <AccountOrderList orders={orders.slice(0, 5)} empty="No orders are recorded for this account." />
      </section>
      {bought.length ? (
        <section className="mt-8">
          <h2 className="text-lg">Products bought</h2>
          <ul className="mt-3 space-y-2">
            {bought.map((item) => (
              <li key={item.productId}>
                <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-brand">
                  {item.name}
                </Link>
                <p className="text-sm text-muted">Quantity {item.quantity}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function AccountOrders() {
  const { orders, error, ready } = useAccountRecords();
  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted">Checkout records for this account.</p>
      {!ready ? <p className="mt-6 text-sm text-muted">Loading orders…</p> : null}
      {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}
      {ready && !error ? <AccountOrderList orders={orders} empty="No orders are recorded for this account." /> : null}
    </div>
  );
}

export function AccountOrderDetail({ id }: { id: string }) {
  const { orders, error, ready } = useAccountRecords();
  if (!ready) return <p className="text-sm text-muted">Loading order…</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;
  const order = orders.find((item) => item.id === id || item.reference === id);
  if (!order) {
    return (
      <div>
        <h1 className="text-3xl">Order</h1>
        <p className="mt-2 text-sm text-muted">This order is not on this account.</p>
        <Link href="/account/orders" className="mt-4 inline-block text-sm font-semibold text-brand">Back to orders</Link>
      </div>
    );
  }
  return (
    <article>
      <h1 className="text-3xl">{order.reference}</h1>
      <div className="mt-3">
        <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
      </div>
      <dl className="mt-4 space-y-1 text-sm">
        <div>Placed {formatIsoDate(order.createdAt)}</div>
        <div>Amount {formatKes(order.amount)}</div>
        {order.mpesaReceipt ? <div>M-Pesa receipt {order.mpesaReceipt}</div> : null}
        {order.location ? <div>Location {order.location}</div> : null}
      </dl>
      <ul className="mt-4 space-y-2">
        {(order.items || []).map((item) => (
          <li key={`${item.productId}-${item.name}`} className="rounded-md border border-line bg-surface p-3 text-sm">
            {item.name} × {item.quantity}
            {item.unitPrice ? ` · ${formatKes(item.unitPrice)}` : ""}
          </li>
        ))}
      </ul>
    </article>
  );
}

function AccountOrderList({ orders, empty }: { orders: AccountOrder[]; empty: string }) {
  if (!orders.length) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-4 space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/account/orders/${order.id}`} className="block rounded-md border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{order.reference}</p>
              <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{formatIsoDate(order.createdAt)} · {formatKes(order.amount)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
