"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import {
  EmptyState,
  FilterBar,
  GradientHeader,
  MtButton,
  MtInput,
  MtSelect,
} from "@/components/medtrack/ui";
import type { Equipment, MaintenanceSchedule } from "@/lib/medtrack/types";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [dueOnly, setDueOnly] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    equipmentId: "",
    title: "",
    intervalDays: "90",
    nextDueDate: "",
    notes: "",
  });

  async function load(nextDueOnly = dueOnly) {
    const params = new URLSearchParams();
    if (nextDueOnly) params.set("dueOnly", "1");
    const [schedRes, eqRes] = await Promise.all([
      mtFetch<MaintenanceSchedule[]>(`/schedules?${params}`),
      equipment.length
        ? Promise.resolve({ ok: true as const, data: equipment })
        : mtFetch<Equipment[]>("/equipment"),
    ]);
    if (!schedRes.ok || !schedRes.data) {
      setError(schedRes.message || "Could not load schedules");
      return;
    }
    setSchedules(schedRes.data);
    if (eqRes.data && !equipment.length) {
      setEquipment(eqRes.data);
      if (eqRes.data[0]) {
        setForm((f) => ({ ...f, equipmentId: String(eqRes.data![0].id) }));
      }
    }
    setError("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSchedule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await mtFetch("/schedules", {
      method: "POST",
      body: JSON.stringify({
        equipmentId: Number(form.equipmentId),
        title: form.title,
        intervalDays: Number(form.intervalDays),
        nextDueDate: form.nextDueDate,
        notes: form.notes,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.message || "Could not create schedule");
      return;
    }
    setForm((f) => ({ ...f, title: "", notes: "", nextDueDate: "" }));
    await load();
  }

  async function complete(id: number) {
    setBusy(true);
    const res = await mtFetch(`/schedules/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.message || "Could not complete schedule");
      return;
    }
    await load();
  }

  return (
    <>
      <GradientHeader
        eyebrow="Preventive plan"
        title="Maintenance schedules"
        description="Track recurring service intervals and roll next due dates after completion."
      />

      <FilterBar>
        <label className="flex min-h-11 items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={(e) => setDueOnly(e.target.checked)}
          />
          Due only
        </label>
        <MtButton type="button" variant="outline" onClick={() => load(dueOnly)}>
          Apply
        </MtButton>
      </FilterBar>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <form
        onSubmit={createSchedule}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-900">New schedule</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Equipment</span>
            <MtSelect
              required
              value={form.equipmentId}
              onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
            >
              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.assetTag})
                </option>
              ))}
            </MtSelect>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Title</span>
            <MtInput
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Quarterly PM"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Interval (days)</span>
            <MtInput
              required
              type="number"
              min={1}
              value={form.intervalDays}
              onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Next due</span>
            <MtInput
              required
              type="date"
              value={form.nextDueDate}
              onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Notes</span>
            <MtInput
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Checklist notes"
            />
          </label>
        </div>
        <MtButton type="submit" disabled={busy}>
          {busy ? "Saving…" : "Create schedule"}
        </MtButton>
      </form>

      {!schedules.length ? (
        <EmptyState
          title="No schedules yet"
          description="Create preventive intervals so due work appears on the field dashboard."
        />
      ) : (
        <>
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{schedule.title}</p>
                    <p className="text-xs text-slate-500">
                      {schedule.equipmentName} · {schedule.assetTag}
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-amber-700">
                    {schedule.nextDueDate}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/medtrack/equipment/${schedule.equipmentId}`} className="flex-1">
                    <MtButton variant="outline" className="w-full">
                      Open asset
                    </MtButton>
                  </Link>
                  <MtButton
                    className="flex-1"
                    disabled={busy}
                    onClick={() => complete(schedule.id)}
                  >
                    Complete
                  </MtButton>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="border-y bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Schedule</th>
                  <th className="px-3 py-2">Equipment</th>
                  <th className="px-3 py-2">Interval</th>
                  <th className="px-3 py-2">Next due</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{schedule.title}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/medtrack/equipment/${schedule.equipmentId}`}
                        className="text-[#0f766e]"
                      >
                        {schedule.equipmentName}
                      </Link>
                      <div className="text-xs text-slate-500">{schedule.assetTag}</div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{schedule.intervalDays}d</td>
                    <td className="px-3 py-2 tabular-nums">{schedule.nextDueDate}</td>
                    <td className="px-3 py-2">
                      <MtButton
                        type="button"
                        variant="outline"
                        disabled={busy}
                        onClick={() => complete(schedule.id)}
                      >
                        Complete
                      </MtButton>
                    </td>
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
