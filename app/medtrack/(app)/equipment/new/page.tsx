"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { GradientHeader, MtButton, MtInput, MtSelect, MtTextarea } from "@/components/medtrack/ui";
import type { Branch, Equipment } from "@/lib/medtrack/types";

export default function NewEquipmentPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    branchId: "",
    assetTag: "",
    name: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    department: "",
    location: "",
    nextServiceDue: "",
    notes: "",
  });

  useEffect(() => {
    mtFetch<Branch[]>("/branches").then((res) => {
      if (res.data?.length) {
        setBranches(res.data);
        setForm((f) => ({ ...f, branchId: String(res.data![0].id) }));
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await mtFetch<Equipment>("/equipment", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        branchId: Number(form.branchId),
        nextServiceDue: form.nextServiceDue || null,
      }),
    });
    setSaving(false);
    if (!res.ok || !res.data) {
      setError(res.message || "Could not register equipment");
      return;
    }
    router.push(`/medtrack/equipment/${res.data.id}`);
  }

  return (
    <>
      <GradientHeader
        eyebrow="Register"
        title="New equipment"
        description="Creates an unguessable public QR ID and append-only service history."
        actions={
          <Link href="/medtrack/equipment" className="text-sm font-medium text-[#0f766e]">
            Back to inventory
          </Link>
        }
      />

      <form
        onSubmit={onSubmit}
        className="max-w-3xl space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Branch</span>
            <MtSelect
              required
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </MtSelect>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Asset tag</span>
            <MtInput
              required
              value={form.assetTag}
              onChange={(e) => setForm({ ...form, assetTag: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Name</span>
            <MtInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Manufacturer</span>
            <MtInput
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Model</span>
            <MtInput value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Serial number</span>
            <MtInput
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Next service due</span>
            <MtInput
              type="date"
              value={form.nextServiceDue}
              onChange={(e) => setForm({ ...form, nextServiceDue: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Department</span>
            <MtInput
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">Location</span>
            <MtInput
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Notes</span>
            <MtTextarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <MtButton type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : "Create passport + QR"}
        </MtButton>
      </form>
    </>
  );
}
