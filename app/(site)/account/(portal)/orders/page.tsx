import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getSampleOrders } from "@/lib/api/content";
import { formatIsoDate, formatKes } from "@/lib/utils/format";

export const metadata = { title: "Orders" };

const tone = {
  Received: "brand",
  Dispatched: "warning",
  Delivered: "success",
} as const;

export default async function OrdersPage() {
  const orders = await getSampleOrders();
  return (
    <div>
      <h1 className="text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted">Sample orders. Status is Received, Dispatched or Delivered.</p>
      <ul className="mt-6 space-y-3">
        {orders.length === 0 ? <li>No sample orders.</li> : null}
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${order.id}`} className="block rounded-md border border-line bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{order.reference}</p>
                <Badge tone={tone[order.status]}>{order.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{formatIsoDate(order.placedAt)} · {order.payment} · {order.shipTo}</p>
              {order.total != null ? <p className="mt-1 text-sm">{formatKes(order.total)} · example</p> : <p className="mt-1 text-sm">Quoted item</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
