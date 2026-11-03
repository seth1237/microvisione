"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { EquipmentStatusBadge } from "@/components/medtrack/status-badge";
import { EmptyState, FilterBar, GradientHeader, KpiCard, MtButton, MtInput, MtSelect } from "@/components/medtrack/ui";
import {
  EQUIPMENT_STATUSES,
  EQUIPMENT_STATUS_LABELS,
  type Branch,
  type Equipment,
} from "@/lib/medtrack/types";

export default function EquipmentListPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [error, setError] = useState("");

  async function load(nextQ = q, nextStatus = status, nextBranch = branchId) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    if (nextBranch) params.set("branchId", nextBranch);
    const [res, branchRes] = await Promise.all([
      mtFetch<Equipment[]>(`/equipment?${params.toString()}`),
      branches.length
        ? Promise.resolve({ ok: true as const, data: branches })
        : mtFetch<Branch[]>("/branches"),
    ]);
    if (!res.ok || !res.data) {
      setError(res.message || "Could not load equipment");
      return;
    }
    setItems(res.data);
    if (branchRes.data && !branches.length) setBranches(branchRes.data);
    setError("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const outOfService = items.filter((i) => i.status === "out_of_service").length;
  const due = items.filter((i) => i.status === "maintenance_due").length;

  return (
    <>
      <GradientHeader
        eyebrow="Inventory"
        title="Equipment"
        description="Hospital assets with unguessable public QR passports."
        actions={
          <Link href="/medtrack/equipment/new">
            <MtButton>Register</MtButton>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="In view" value={items.length} />
        <KpiCard label="Out of service" value={outOfService} />
        <KpiCard label="Maintenance due" value={due} />
        <KpiCard
          label="Operational"
          value={items.filter((i) => i.status === "operational").length}
        />
      </div>

      <FilterBar>
        <MtInput
          placeholder="Search name, tag, serial…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
        <MtSelect
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="sm:max-w-[220px]"
        >
          <option value="">All statuses</option>
          {EQUIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {EQUIPMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </MtSelect>
        <MtSelect
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="sm:max-w-[220px]"
        >
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </MtSelect>
        <MtButton type="button" variant="outline" onClick={() => load()}>
          Apply
        </MtButton>
      </FilterBar>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {!items.length ? (
        <EmptyState
          title="No equipment yet"
          description="Register a machine to generate its public QR passport."
          action={
            <Link href="/medtrack/equipment/new">
              <MtButton>Register equipment</MtButton>
            </Link>
          }
        />
      ) : (
        <>
          <div className="divide-y overflow-hidden rounded-xl border border-slate-200 bg-white md:hidden">
            {items.map((item) => (
              <Link key={item.id} href={`/medtrack/equipment/${item.id}`} className="block space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.assetTag}</p>
                  </div>
                  <EquipmentStatusBadge status={item.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <span>{item.branchName}</span>
                  <span>{item.department || "—"}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="border-y bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Asset</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Next service</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <Link href={`/medtrack/equipment/${item.id}`} className="font-medium text-[#0f766e]">
                        {item.name}
                      </Link>
                      <div className="text-xs text-slate-500">{item.assetTag}</div>
                    </td>
                    <td className="px-3 py-2">
                      <EquipmentStatusBadge status={item.status} />
                    </td>
                    <td className="px-3 py-2">{item.branchName}</td>
                    <td className="px-3 py-2">{item.department || "—"}</td>
                    <td className="px-3 py-2 tabular-nums">{item.nextServiceDue || "—"}</td>
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
