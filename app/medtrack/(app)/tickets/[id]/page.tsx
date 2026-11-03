"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { TicketStatusBadge, TicketTypeBadge } from "@/components/medtrack/status-badge";
import { GradientHeader, MtButton, MtSelect, MtTextarea, ProgressStrip } from "@/components/medtrack/ui";
import type { MedTrackUser, Ticket } from "@/lib/medtrack/types";

function ticketProgress(status: Ticket["status"]) {
  if (status === "open") return 0;
  if (status === "in_progress") return 1;
  return 2;
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [users, setUsers] = useState<MedTrackUser[]>([]);
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<Ticket["priority"]>("normal");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [res, userRes] = await Promise.all([
      mtFetch<Ticket>(`/tickets/${params.id}`),
      mtFetch<MedTrackUser[]>("/users"),
    ]);
    if (!res.ok || !res.data) {
      setError(res.message || "Not found");
      return;
    }
    setTicket(res.data);
    setAssignee(res.data.assignedToUserId ? String(res.data.assignedToUserId) : "");
    setPriority(res.data.priority);
    setNotes(res.data.engineerNotes || "");
    if (userRes.data) setUsers(userRes.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    const res = await mtFetch(`/tickets/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.message || "Update failed");
      return;
    }
    await load();
  }

  if (error && !ticket) return <p className="text-sm text-rose-700">{error}</p>;
  if (!ticket) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      </div>
    );
  }

  return (
    <>
      <GradientHeader
        eyebrow={`Ticket #${ticket.id}`}
        title={ticket.equipmentName || "Equipment ticket"}
        description={
          ticket.type === "fault"
            ? "Safety / fault report — only an engineer can return this asset to service."
            : "Scheduled maintenance request — not automatically a safety fault."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <TicketTypeBadge type={ticket.type} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <ProgressStrip
          steps={["Open", "In progress", "Resolved"]}
          current={ticketProgress(ticket.status)}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</p>
            <p className="font-medium">{ticket.assetTag}</p>
            <p className="text-slate-600">{ticket.branchName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reporter</p>
            <p className="font-medium">{ticket.reporterName || "Anonymous"}</p>
            <p className="text-slate-600">{ticket.reporterContact || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Opened</p>
            <p className="tabular-nums">{new Date(ticket.openedAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assignee</p>
            <p className="font-medium">{ticket.assignedToName || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Response time
            </p>
            <p className="tabular-nums">
              {ticket.responseHours != null ? `${ticket.responseHours} h` : "Pending first response"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Downtime</p>
            <p className="tabular-nums">
              {ticket.type === "fault"
                ? ticket.downtimeHours != null
                  ? `${ticket.downtimeHours} h`
                  : "Ongoing"
                : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Details</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{ticket.reporterNote}</p>
        </div>

        <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Assign engineer</span>
            <MtSelect value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </MtSelect>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Priority</span>
            <MtSelect
              value={priority}
              onChange={(e) => setPriority(e.target.value as Ticket["priority"])}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </MtSelect>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Engineer notes</span>
            <MtTextarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <MtButton
            type="button"
            variant="outline"
            disabled={busy}
            className="sm:col-span-2"
            onClick={() =>
              patch({
                assignedToUserId: assignee ? Number(assignee) : null,
                priority,
                engineerNotes: notes,
              })
            }
          >
            Save assignment & notes
          </MtButton>
        </div>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          {ticket.status === "open" ? (
            <MtButton
              disabled={busy}
              onClick={() => patch({ status: "in_progress", markFirstResponse: true })}
              className="flex-1"
            >
              Start work
            </MtButton>
          ) : null}
          {ticket.status === "in_progress" || ticket.status === "open" ? (
            <MtButton
              variant="outline"
              disabled={busy}
              onClick={() => patch({ status: "resolved" })}
              className="flex-1"
            >
              Mark resolved
            </MtButton>
          ) : null}
          <Link href={`/medtrack/equipment/${ticket.equipmentId}`} className="flex-1">
            <MtButton variant="outline" className="w-full">
              Open equipment
            </MtButton>
          </Link>
        </div>
        {ticket.type === "fault" ? (
          <p className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-900">
            Resolving the ticket does not by itself clear Out of Service. Use{" "}
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => router.push(`/medtrack/equipment/${ticket.equipmentId}`)}
            >
              Return to service
            </button>{" "}
            on the equipment passport.
          </p>
        ) : null}
      </div>
    </>
  );
}
