"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EquipmentStatusBadge } from "@/components/medtrack/status-badge";
import {
  DocumentSurface,
  MtButton,
  MtInput,
  MtTextarea,
} from "@/components/medtrack/ui";
import {
  EQUIPMENT_STATUS_LABELS,
  type Equipment,
  type ServiceHistoryEntry,
  type StatusHistoryEntry,
} from "@/lib/medtrack/types";
import "@/app/medtrack/medtrack.css";

type PublicPayload = {
  equipment: Equipment & { statusLabel: string };
  history: ServiceHistoryEntry[];
  statusHistory: StatusHistoryEntry[];
  distinctions: { fault: string; maintenance: string };
};

export default function PublicQrPage() {
  const params = useParams<{ publicQrId: string }>();
  const [data, setData] = useState<PublicPayload | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"idle" | "fault" | "maintenance">("idle");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [reporterNote, setReporterNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  async function load() {
    const res = await fetch(`/api/medtrack/public/${params.publicQrId}`, { cache: "no-store" });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      setError(payload.message || "Equipment not found");
      return;
    }
    setData(payload.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.publicQrId]);

  async function submit() {
    if (!reporterNote.trim()) return;
    setBusy(true);
    setDone("");
    const res = await fetch(`/api/medtrack/public/${params.publicQrId}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: mode === "fault" ? "fault" : "maintenance_request",
        reporterName,
        reporterContact,
        reporterNote,
      }),
    });
    const payload = await res.json();
    setBusy(false);
    if (!res.ok || !payload.success) {
      setError(payload.message || "Could not submit");
      return;
    }
    setDone(
      mode === "fault"
        ? "Fault reported. Designated staff have been notified by email."
        : "Maintenance request sent. Designated staff have been notified by email.",
    );
    setMode("idle");
    setReporterNote("");
    await load();
  }

  if (error && !data) {
    return (
      <div className="medtrack-root min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="medtrack-root flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700" />
      </div>
    );
  }

  const { equipment, history, statusHistory, distinctions } = data;

  return (
    <div className="medtrack-root min-h-screen bg-slate-50 px-3 py-4 pb-28 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e]">
            MedTrack QR
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {equipment.hospitalName || "Hospital equipment"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Public equipment passport · no login required</p>
        </div>

        <DocumentSurface>
          <div
            className="border-b px-4 py-3"
            style={{
              borderColor: "rgba(15, 118, 110, 0.18)",
              background: "linear-gradient(to right, rgba(15, 118, 110, 0.08), rgba(14, 165, 233, 0.08))",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0f766e]">
                  Equipment status
                </p>
                <h2 className="text-xl font-semibold text-slate-900">{equipment.name}</h2>
                <p className="text-sm text-slate-600">{equipment.assetTag}</p>
              </div>
              <EquipmentStatusBadge status={equipment.status} className="h-6 px-2 text-[11px]" />
            </div>
          </div>
          <div className="space-y-3 p-4 text-sm">
            <p className="text-slate-700">
              This device is currently{" "}
              <strong>{EQUIPMENT_STATUS_LABELS[equipment.status]}</strong>.
              {equipment.status === "maintenance_due"
                ? " Scheduled maintenance is due — this does not automatically mean the device is unsafe."
                : null}
              {equipment.status === "out_of_service"
                ? " Do not use until an authorized engineer returns it to service."
                : null}
              {equipment.status === "under_maintenance"
                ? " Work is in progress. Wait for return-to-service before clinical use."
                : null}
              {equipment.status === "status_unverified"
                ? " Status has not been verified by biomedical staff yet."
                : null}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last service
                </p>
                <p className="mt-1 tabular-nums">
                  {equipment.lastServiceAt
                    ? new Date(equipment.lastServiceAt).toLocaleDateString()
                    : "Not recorded"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Next due
                </p>
                <p className="mt-1 tabular-nums">{equipment.nextServiceDue || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </p>
                <p className="mt-1">
                  {equipment.department || "—"}
                  {equipment.location ? ` · ${equipment.location}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Branch
                </p>
                <p className="mt-1">{equipment.branchName || "—"}</p>
              </div>
            </div>
            {(equipment.manufacturer || equipment.model) && (
              <p className="text-xs text-slate-500">
                {[equipment.manufacturer, equipment.model].filter(Boolean).join(" · ")}
                {equipment.serialNumber ? ` · S/N ${equipment.serialNumber}` : ""}
              </p>
            )}
          </div>
        </DocumentSurface>

        {done ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            {done}
          </div>
        ) : null}

        {mode === "idle" ? (
          <div className="grid gap-2">
            <MtButton
              className="w-full"
              variant="danger"
              onClick={() => {
                setMode("fault");
                setDone("");
              }}
            >
              Report a fault
            </MtButton>
            <MtButton
              className="w-full"
              variant="outline"
              onClick={() => {
                setMode("maintenance");
                setDone("");
              }}
            >
              Request maintenance
            </MtButton>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {mode === "fault" ? "Report a fault" : "Request maintenance"}
            </h3>
            <p className="text-xs text-slate-600">
              {mode === "fault" ? distinctions.fault : distinctions.maintenance}
            </p>
            <MtInput
              placeholder="Your name (optional)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
            />
            <MtInput
              placeholder="Phone or email (optional)"
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
            />
            <MtTextarea
              placeholder={
                mode === "fault"
                  ? "Describe the fault or safety concern"
                  : "Describe the maintenance needed"
              }
              value={reporterNote}
              onChange={(e) => setReporterNote(e.target.value)}
              required
            />
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            <div className="flex gap-2">
              <MtButton variant="outline" className="flex-1" onClick={() => setMode("idle")}>
                Cancel
              </MtButton>
              <MtButton
                className="flex-1"
                variant={mode === "fault" ? "danger" : "primary"}
                disabled={busy || reporterNote.trim().length < 3}
                onClick={submit}
              >
                {busy ? "Sending…" : "Submit"}
              </MtButton>
            </div>
          </div>
        )}

        {statusHistory?.length ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">Status timeline</h3>
            <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
              {statusHistory.slice(0, 6).map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entry.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.fromStatus
                        ? `${EQUIPMENT_STATUS_LABELS[entry.fromStatus]} → `
                        : ""}
                      {EQUIPMENT_STATUS_LABELS[entry.toStatus]}
                    </p>
                  </div>
                  <p className="shrink-0 text-[11px] tabular-nums text-slate-500">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-900">Service history</h3>
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white">
            {history.length ? (
              history.map((entry) => (
                <div key={entry.id} className="p-3">
                  <p className="text-sm font-medium text-slate-900">{entry.summary}</p>
                  {entry.details ? (
                    <p className="mt-1 text-sm text-slate-600">{entry.details}</p>
                  ) : null}
                  {(entry.partsUsed || entry.testsPerformed) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.partsUsed ? `Parts: ${entry.partsUsed}` : null}
                      {entry.partsUsed && entry.testsPerformed ? " · " : null}
                      {entry.testsPerformed ? `Tests: ${entry.testsPerformed}` : null}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(entry.createdAt).toLocaleString()}
                    {entry.performedByName ? ` · ${entry.performedByName}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-slate-500">No history recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
