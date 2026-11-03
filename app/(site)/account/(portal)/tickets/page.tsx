import { TicketForm } from "@/components/account/ticket-form";
import { Badge } from "@/components/ui/badge";
import { getSampleTickets } from "@/lib/api/content";
import { formatIsoDate } from "@/lib/utils/format";

export const metadata = { title: "Tickets" };

export default async function TicketsPage() {
  const tickets = await getSampleTickets();
  return (
    <div>
      <h1 className="text-3xl">Tickets</h1>
      <p className="mt-2 text-sm text-muted">Sample service tickets: Open, In progress, Resolved.</p>
      <ul className="mt-6 space-y-3">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="rounded-md border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{ticket.reference}</p>
              <Badge>{ticket.status}</Badge>
            </div>
            <p className="mt-1">{ticket.subject}</p>
            <p className="mt-1 text-sm text-muted">Opened {formatIsoDate(ticket.openedAt)} · Updated {formatIsoDate(ticket.updatedAt)}</p>
          </li>
        ))}
      </ul>
      <section className="mt-8 max-w-xl rounded-md border border-line bg-surface p-4">
        <h2 className="text-lg">New ticket</h2>
        <div className="mt-3">
          <TicketForm />
        </div>
      </section>
    </div>
  );
}
