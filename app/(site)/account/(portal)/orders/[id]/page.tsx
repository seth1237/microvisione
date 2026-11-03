import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getSampleOrder, getSampleOrders } from "@/lib/api/content";
import { formatIsoDate, formatKes } from "@/lib/utils/format";

export async function generateStaticParams() {
  const orders = await getSampleOrders();
  return orders.map((order) => ({ id: order.id }));
}

export const metadata = { title: "Order" };

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading order…</p>}>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getSampleOrder(id);
  if (!order) notFound();
  return (
    <article>
      <h1 className="text-3xl">{order.reference}</h1>
      <p className="mt-2 text-sm text-warning">Sample order — not a live delivery.</p>
      <div className="mt-3">
        <Badge>{order.status}</Badge>
      </div>
      <dl className="mt-4 space-y-1 text-sm">
        <div>Placed {formatIsoDate(order.placedAt)}</div>
        <div>Payment: {order.payment}</div>
        <div>Ship to: {order.shipTo}</div>
      </dl>
      <ul className="mt-4 space-y-2">
        {order.items.map((item) => (
          <li key={item.productId} className="rounded-md border border-line bg-surface p-3 text-sm">
            {item.name} × {item.quantity}
            {item.unitPrice != null ? ` · ${formatKes(item.unitPrice)} example` : ""}
          </li>
        ))}
      </ul>
    </article>
  );
}
