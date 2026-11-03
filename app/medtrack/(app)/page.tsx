"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  QrCode,
} from "lucide-react";
import { mtFetch } from "@/lib/medtrack/client";
import { EquipmentStatusBadge, TicketStatusBadge, TicketTypeBadge } from "@/components/medtrack/status-badge";
import { EmptyState, FilterBar, GradientHeader, KpiCard, MtButton, MtSelect } from "@/components/medtrack/ui";
import type { Branch, MaintenanceSchedule, Ticket } from "@/lib/medtrack/types";

type Summary = {
  equipmentCount: number;
  openTickets: number;
  openFaults: number;
  schedulesDue: number;
  byStatus: Record<string, number>;
};

export default function MedTrackDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [error, setError] = useState("");

  async function load(nextBranch = branchId) {
    const params = nextBranch ? `?branchId=${nextBranch}` : "";
    const [dash, branchRes] = await Promise.all([
      mtFetch<{
        summary: Summary;
        openTickets: Ticket[];
        dueSchedules: MaintenanceSchedule[];
      }>(`/dashboard${params}`),
      branches.length
        ? Promise.resolve({ ok: true, data: branches })
        : mtFetch<Branch[]>("/branches"),
    ]);
    if (!dash.ok || !dash.data) {
      setError(dash.message || "Could not load dashboard");
      return;
    }
    setSummary(dash.data.summary);
    setTickets(dash.data.openTickets);
    setSchedules(dash.data.dueSchedules || []);
    if (branchRes.ok && branchRes.data && !branches.length) setBranches(branchRes.data);
    setError("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GradientHeader
        eyebrow="Today"
        title="Field dashboard"
        description="Open faults, maintenance due, and equipment that needs an engineer."
        actions={
          <Link href="/medtrack/equipment/new">
            <MtButton>Register equipment</MtButton>
          </Link>
        }
      />

      <FilterBar>
        <MtSelect
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="sm:max-w-[240px]"
        >
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </MtSelect>
        <MtButton type="button" variant="outline" onClick={() => load(branchId)}>
          Apply
        </MtButton>
      </FilterBar>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard
          label="Equipment"
          value={summary?.equipmentCount ?? "—"}
          icon={<QrCode className="h-4 w-4" />}
        />
        <KpiCard
          label="Open tickets"
          value={summary?.openTickets ?? "—"}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <KpiCard
          label="Open faults"
          value={summary?.openFaults ?? "—"}
          hint="Safety / withdrawn"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <KpiCard
          label="Schedules due"
          value={summary?.schedulesDue ?? "—"}
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <KpiCard
          label="Operational"
          value={summary?.byStatus?.operational ?? "—"}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Attention</h2>
          <Link href="/medtrack/tickets" className="text-sm font-medium text-[#0f766e]">
            All tickets
          </Link>
        </div>
        {!tickets.length ? (
          <EmptyState
            title="No open tickets"
            description="Faults and maintenance requests from public QR pages will appear here."
          />
        ) : (
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/medtrack/tickets/${ticket.id}`}
                className="block space-y-2 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{ticket.equipmentName}</p>
                    <p className="text-xs text-slate-500">{ticket.assetTag}</p>
                  </div>
                  <TicketTypeBadge type={ticket.type} />
                </div>
                <div className="flex items-center gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <span className="text-xs capitalize text-slate-500">{ticket.priority}</span>
                  <span className="text-xs text-slate-500">{ticket.branchName}</span>
                </div>
                <p className="line-clamp-2 text-sm text-slate-600">{ticket.reporterNote}</p>
              </Link>
            ))}
          </div>
        )}

        {tickets.length ? (
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="border-y bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Equipment</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/medtrack/tickets/${ticket.id}`}
                        className="font-medium text-[#0f766e]"
                      >
                        {ticket.equipmentName}
                      </Link>
                      <div className="text-xs text-slate-500">{ticket.assetTag}</div>
                    </td>
                    <td className="px-3 py-2">
                      <TicketTypeBadge type={ticket.type} />
                    </td>
                    <td className="px-3 py-2 capitalize text-slate-600">{ticket.priority}</td>
                    <td className="px-3 py-2">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-3 py-2 text-slate-600">{ticket.branchName}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-slate-600">
                      {ticket.reporterNote}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Preventive due</h2>
          <Link href="/medtrack/schedules" className="text-sm font-medium text-[#0f766e]">
            Schedules
          </Link>
        </div>
        {!schedules.length ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No preventive schedules due right now.
          </p>
        ) : (
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
            {schedules.map((schedule) => (
              <Link
                key={schedule.id}
                href={`/medtrack/equipment/${schedule.equipmentId}`}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{schedule.title}</p>
                  <p className="text-xs text-slate-500">
                    {schedule.equipmentName} · {schedule.assetTag}
                  </p>
                </div>
                <span className="text-xs font-semibold tabular-nums text-amber-700">
                  Due {schedule.nextDueDate}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {summary ? (
        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              "operational",
              "maintenance_due",
              "under_maintenance",
              "out_of_service",
              "status_unverified",
            ] as const
          ).map((status) => (
            <div
              key={status}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <EquipmentStatusBadge status={status} />
              <span className="tabular-nums text-sm font-semibold">
                {summary.byStatus[status] || 0}
              </span>
            </div>
          ))}
        </section>
      ) : null}
    </>
  );
}
