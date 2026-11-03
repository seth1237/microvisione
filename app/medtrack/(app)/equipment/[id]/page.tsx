"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { EquipmentStatusBadge, TicketTypeBadge } from "@/components/medtrack/status-badge";
import {
  DocumentSurface,
  GradientHeader,
  MtButton,
  MtInput,
  MtSelect,
  MtTextarea,
  ProgressStrip,
} from "@/components/medtrack/ui";
import type {
  Branch,
  Equipment,
  MaintenanceSchedule,
  ServiceHistoryEntry,
  StatusHistoryEntry,
  Ticket,
} from "@/lib/medtrack/types";
import { EQUIPMENT_STATUS_LABELS } from "@/lib/medtrack/types";

type Detail = {
  equipment: Equipment;
  history: ServiceHistoryEntry[];
  statusHistory: StatusHistoryEntry[];
  schedules: MaintenanceSchedule[];
  tickets: Ticket[];
  publicUrl: string;
  qrImageUrl: string;
  permissions: {
    canRecordService: boolean;
    canReturnToService: boolean;
    canManageInventory: boolean;
  };
};

function progressIndex(status: Equipment["status"]) {
  if (status === "out_of_service" || status === "status_unverified") return 0;
  if (status === "under_maintenance" || status === "maintenance_due") return 1;
  return 2;
}

export default function EquipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [partsUsed, setPartsUsed] = useState("");
  const [testsPerformed, setTestsPerformed] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [transferBranchId, setTransferBranchId] = useState("");
  const [transferDept, setTransferDept] = useState("");
  const [transferLoc, setTransferLoc] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    assetTag: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    department: "",
    location: "",
    notes: "",
  });

  async function load() {
    const [res, branchRes] = await Promise.all([
      mtFetch<Detail>(`/equipment/${params.id}`),
      mtFetch<Branch[]>("/branches"),
    ]);
    if (!res.ok || !res.data) {
      setError(res.message || "Not found");
      return;
    }
    setDetail(res.data);
    setNextDue(res.data.equipment.nextServiceDue || "");
    setTransferBranchId(String(res.data.equipment.branchId));
    setTransferDept(res.data.equipment.department || "");
    setTransferLoc(res.data.equipment.location || "");
    setEditForm({
      name: res.data.equipment.name,
      assetTag: res.data.equipment.assetTag,
      manufacturer: res.data.equipment.manufacturer || "",
      model: res.data.equipment.model || "",
      serialNumber: res.data.equipment.serialNumber || "",
      department: res.data.equipment.department || "",
      location: res.data.equipment.location || "",
      notes: res.data.equipment.notes || "",
    });
    if (branchRes.data) setBranches(branchRes.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function submitService(returnToService: boolean) {
    if (!summary.trim()) {
      setMessage("Add a short service summary");
      return;
    }
    setBusy(true);
    setMessage("");
    const res = await mtFetch(`/equipment/${params.id}/service`, {
      method: "POST",
      body: JSON.stringify({
        summary,
        details,
        partsUsed,
        testsPerformed,
        nextServiceDue: nextDue || null,
        returnToService,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message || "Could not record service");
      return;
    }
    setSummary("");
    setDetails("");
    setPartsUsed("");
    setTestsPerformed("");
    setMessage(returnToService ? "Returned to service" : "Service recorded");
    await load();
  }

  async function saveEdit() {
    setBusy(true);
    setMessage("");
    const res = await mtFetch(`/equipment/${params.id}`, {
      method: "PATCH",
      body: JSON.stringify(editForm),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message || "Could not save");
      return;
    }
    setEditOpen(false);
    setMessage("Equipment updated");
    await load();
  }

  async function transfer() {
    setBusy(true);
    setMessage("");
    const res = await mtFetch(`/equipment/${params.id}/transfer`, {
      method: "POST",
      body: JSON.stringify({
        branchId: Number(transferBranchId),
        department: transferDept,
        location: transferLoc,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message || "Transfer failed");
      return;
    }
    setMessage("Equipment transferred");
    await load();
  }

  async function regenerateQr() {
    if (!confirm("Regenerate public QR? Existing printed labels will stop working.")) return;
    setBusy(true);
    const res = await mtFetch(`/equipment/${params.id}/regenerate-qr`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setMessage(res.message || "Could not regenerate QR");
      return;
    }
    setMessage("QR regenerated — reprint the label");
    await load();
  }

  if (error) return <p className="text-sm text-rose-700">{error}</p>;
  if (!detail) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      </div>
    );
  }

  const {
    equipment,
    history,
    statusHistory,
    schedules,
    tickets,
    publicUrl,
    qrImageUrl,
    permissions,
  } = detail;

  return (
    <>
      <GradientHeader
        eyebrow="Equipment passport"
        title={equipment.name}
        description={`${equipment.assetTag} · ${equipment.branchName || "Branch"}`}
        actions={<EquipmentStatusBadge status={equipment.status} className="h-6 px-2 text-[11px]" />}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <ProgressStrip
          steps={["Reported", "In service", "Operational"]}
          current={progressIndex(equipment.status)}
        />
      </div>

      <DocumentSurface className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">MedTrack</p>
            <h2 className="mt-1 text-2xl font-semibold uppercase tracking-tight text-[#0f766e]">
              Equipment passport
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Current status:{" "}
              <span className="font-semibold">{EQUIPMENT_STATUS_LABELS[equipment.status]}</span>
            </p>
          </div>
          <div className="space-y-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt="Public QR code" className="h-32 w-32" />
            </div>
            <a
              href={qrImageUrl}
              download={`${equipment.assetTag}-qr.png`}
              className="block text-center text-xs font-semibold text-[#0f766e]"
            >
              Download / print QR
            </a>
          </div>
        </div>
        <div className="grid gap-4 p-4 text-sm sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asset</p>
            <p className="mt-1 font-medium">{equipment.assetTag}</p>
            <p className="text-slate-600">
              {equipment.manufacturer} {equipment.model}
            </p>
            <p className="text-slate-600">S/N {equipment.serialNumber || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
            <p className="mt-1 font-medium">{equipment.department || "—"}</p>
            <p className="text-slate-600">{equipment.location || "—"}</p>
            <p className="text-slate-600">{equipment.branchName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last service</p>
            <p className="mt-1 tabular-nums">
              {equipment.lastServiceAt
                ? new Date(equipment.lastServiceAt).toLocaleString()
                : "Not recorded"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public URL</p>
            <a href={publicUrl} className="mt-1 break-all text-[#0f766e]" target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
          </div>
        </div>
      </DocumentSurface>

      {permissions.canManageInventory ? (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Lifecycle</h3>
            <div className="flex flex-wrap gap-2">
              <MtButton type="button" variant="outline" onClick={() => setEditOpen((v) => !v)}>
                {editOpen ? "Close edit" : "Edit details"}
              </MtButton>
              <MtButton type="button" variant="outline" disabled={busy} onClick={regenerateQr}>
                Regenerate QR
              </MtButton>
            </div>
          </div>

          {editOpen ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["assetTag", "Asset tag"],
                  ["name", "Name"],
                  ["manufacturer", "Manufacturer"],
                  ["model", "Model"],
                  ["serialNumber", "Serial"],
                  ["department", "Department"],
                  ["location", "Location"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">{label}</span>
                  <MtInput
                    value={editForm[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">Notes</span>
                <MtTextarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </label>
              <MtButton type="button" disabled={busy} onClick={saveEdit} className="sm:col-span-2">
                Save changes
              </MtButton>
            </div>
          ) : null}

          <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Transfer branch</span>
              <MtSelect
                value={transferBranchId}
                onChange={(e) => setTransferBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </MtSelect>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Department</span>
              <MtInput value={transferDept} onChange={(e) => setTransferDept(e.target.value)} />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-slate-600">Location</span>
              <MtInput value={transferLoc} onChange={(e) => setTransferLoc(e.target.value)} />
            </label>
            <MtButton type="button" variant="outline" disabled={busy} onClick={transfer} className="sm:col-span-3">
              Transfer branch / location
            </MtButton>
          </div>
        </section>
      ) : null}

      {permissions.canRecordService ? (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-slate-900">Record service</h3>
          <p className="text-xs text-slate-500">
            Technicians can record work. Only engineers, supervisors, or admins return equipment to
            service after a fault.
          </p>
          <MtInput
            placeholder="Service summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <MtTextarea
            placeholder="Work performed / observations"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <MtInput
              placeholder="Parts used"
              value={partsUsed}
              onChange={(e) => setPartsUsed(e.target.value)}
            />
            <MtInput
              placeholder="Tests performed"
              value={testsPerformed}
              onChange={(e) => setTestsPerformed(e.target.value)}
            />
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-600">Next service due</span>
            <MtInput type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
          </label>
          {message ? <p className="text-sm text-[#0f766e]">{message}</p> : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <MtButton
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => submitService(false)}
              className="flex-1"
            >
              Record service
            </MtButton>
            {permissions.canReturnToService ? (
              <MtButton
                type="button"
                disabled={busy}
                onClick={() => submitService(true)}
                className="flex-1"
              >
                Return to service
              </MtButton>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Preventive schedules</h3>
        {!schedules?.length ? (
          <p className="text-sm text-slate-500">No active schedules for this asset.</p>
        ) : (
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="text-sm font-medium">{schedule.title}</p>
                  <p className="text-xs text-slate-500">
                    Every {schedule.intervalDays} days · next {schedule.nextDueDate}
                  </p>
                </div>
                <Link href="/medtrack/schedules" className="text-xs font-semibold text-[#0f766e]">
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Open / recent tickets</h3>
        {!tickets.length ? (
          <p className="text-sm text-slate-500">No tickets for this asset.</p>
        ) : (
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
            {tickets.slice(0, 8).map((ticket) => (
              <Link
                key={ticket.id}
                href={`/medtrack/tickets/${ticket.id}`}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div>
                  <p className="text-sm font-medium">#{ticket.id}</p>
                  <p className="line-clamp-1 text-xs text-slate-500">{ticket.reporterNote}</p>
                </div>
                <TicketTypeBadge type={ticket.type} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Status history</h3>
        <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
          {(statusHistory || []).length ? (
            statusHistory.map((entry) => (
              <div key={entry.id} className="p-3">
                <p className="text-sm font-medium text-slate-900">{entry.summary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {entry.fromStatus
                    ? `${EQUIPMENT_STATUS_LABELS[entry.fromStatus]} → `
                    : ""}
                  {EQUIPMENT_STATUS_LABELS[entry.toStatus]} ·{" "}
                  {entry.performedByName || "System"} ·{" "}
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-slate-500">No status changes recorded.</p>
          )}
        </div>
      </section>

      <section className="space-y-2 pb-8">
        <h3 className="text-sm font-semibold text-slate-900">Service history</h3>
        <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
          {history.map((entry) => (
            <div key={entry.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{entry.summary}</p>
                <span className="shrink-0 text-[11px] uppercase tracking-wide text-slate-500">
                  {entry.kind.replaceAll("_", " ")}
                </span>
              </div>
              {entry.details ? <p className="mt-1 text-sm text-slate-600">{entry.details}</p> : null}
              {(entry.partsUsed || entry.testsPerformed) && (
                <p className="mt-1 text-xs text-slate-500">
                  {entry.partsUsed ? `Parts: ${entry.partsUsed}` : ""}
                  {entry.partsUsed && entry.testsPerformed ? " · " : ""}
                  {entry.testsPerformed ? `Tests: ${entry.testsPerformed}` : ""}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                {entry.performedByName || "System"} · {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {permissions.canRecordService ? (
        <div
          className="fixed inset-x-0 z-10 border-t border-slate-200 bg-white/95 p-3 backdrop-blur sm:hidden"
          style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
        >
          <MtButton
            className="h-10 w-full"
            disabled={busy}
            onClick={() =>
              submitService(
                equipment.status === "out_of_service" && permissions.canReturnToService,
              )
            }
          >
            {equipment.status === "out_of_service" && permissions.canReturnToService
              ? "Return to service"
              : "Record service"}
          </MtButton>
        </div>
      ) : null}
    </>
  );
}
