"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { TicketStatusBadge, TicketTypeBadge } from "@/components/medtrack/status-badge";
import { EmptyState, FilterBar, GradientHeader, MtButton, MtSelect } from "@/components/medtrack/ui";
import type { Ticket } from "@/lib/medtrack/types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("openish");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const params = new URLSearchParams({ status });
    if (type) params.set("type", type);
    const res = await mtFetch<Ticket[]>(`/tickets?${params}`);
    if (!res.ok || !res.data) {
      setError(res.message || "Could not load tickets");
      return;
    }
    setTickets(res.data);
    setError("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GradientHeader
        eyebrow="Work queue"
        title="Tickets"
        description="Faults are safety issues. Maintenance requests are scheduled work — not automatically unsafe."
      />

      <FilterBar>
        <MtSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-[200px]">
          <option value="openish">Open + in progress</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </MtSelect>
        <MtSelect value={type} onChange={(e) => setType(e.target.value)} className="sm:max-w-[200px]">
          <option value="">All types</option>
          <option value="fault">Faults</option>
          <option value="maintenance_request">Maintenance</option>
        </MtSelect>
        <MtButton type="button" variant="outline" onClick={load}>
          Apply
        </MtButton>
      </FilterBar>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {!tickets.length ? (
        <EmptyState
          title="No tickets in this view"
          description="Public QR fault and maintenance forms create tickets here and email designated accounts."
        />
      ) : (
        <>
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/medtrack/tickets/${ticket.id}`} className="block space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{ticket.equipmentName}</p>
                    <p className="text-xs text-slate-500">#{ticket.id}</p>
                  </div>
                  <TicketTypeBadge type={ticket.type} />
                </div>
                <TicketStatusBadge status={ticket.status} />
                <p className="line-clamp-2 text-sm text-slate-600">{ticket.reporterNote}</p>
              </Link>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="border-y bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Ticket</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Opened</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <Link href={`/medtrack/tickets/${ticket.id}`} className="font-medium text-[#0f766e]">
                        {ticket.equipmentName}
                      </Link>
                      <div className="text-xs text-slate-500">
                        #{ticket.id} · {ticket.assetTag}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <TicketTypeBadge type={ticket.type} />
                    </td>
                    <td className="px-3 py-2">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-600">
                      {new Date(ticket.openedAt).toLocaleString()}
                    </td>
                    <td className="max-w-sm truncate px-3 py-2 text-slate-600">{ticket.reporterNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
