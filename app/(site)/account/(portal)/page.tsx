import Link from "next/link";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getSampleDocuments, getSampleMachines, getSampleOrders, getSampleTickets } from "@/lib/api/content";

export const metadata = { title: "Account overview" };

export default async function AccountHomePage() {
  const [orders, machines, tickets, documents] = await Promise.all([
    getSampleOrders(),
    getSampleMachines(),
    getSampleTickets(),
    getSampleDocuments(),
  ]);
  const cards = [
    ["/account/orders", "Orders", orders.length],
    ["/account/machines", "Machines", machines.length],
    ["/account/tickets", "Tickets", tickets.length],
    ["/account/documents", "Documents", documents.length],
  ] as const;

  return (
    <div>
      <h1 className="text-3xl">Account</h1>
      <p className="mt-2 max-w-2xl text-muted">Sample records for the interface. They are not your organisation’s orders.</p>
      <div className="mt-4 max-w-2xl">
        <PlaceholderNote>Delivery statuses shown are Received, Dispatched and Delivered on the sample orders.</PlaceholderNote>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([href, label, count]) => (
          <li key={href}>
            <Link href={href} className="block rounded-md border border-line bg-surface p-4">
              <p className="text-sm text-muted">{label}</p>
              <p className="text-2xl font-semibold">{count}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
