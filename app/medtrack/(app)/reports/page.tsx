"use client";

import { useEffect, useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { EquipmentStatusBadge } from "@/components/medtrack/status-badge";
import { FilterBar, GradientHeader, KpiCard, MtButton, MtSelect } from "@/components/medtrack/ui";
import type { Branch, MedTrackReport, ReportPeriod } from "@/lib/medtrack/types";
import { Clock3, Download, ShieldCheck, TimerReset, TriangleAlert } from "lucide-react";

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [report, setReport] = useState<MedTrackReport | null>(null);
  const [error, setError] = useState("");

  async function load(nextPeriod = period, nextBranch = branchId) {
    const params = new URLSearchParams({ period: nextPeriod });
    if (nextBranch) params.set("branchId", nextBranch);
    const [res, branchRes] = await Promise.all([
      mtFetch<MedTrackReport>(`/reports?${params}`),
      branches.length
        ? Promise.resolve({ ok: true as const, data: branches })
        : mtFetch<Branch[]>("/branches"),
    ]);
    if (!res.ok || !res.data) {
      setError(res.message || "Could not load report");
      return;
    }
    setReport(res.data);
    if (branchRes.data && !branches.length) setBranches(branchRes.data);
    setError("");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportCsv() {
    const params = new URLSearchParams({ period, format: "csv" });
    if (branchId) params.set("branchId", branchId);
    window.open(`/api/medtrack/reports?${params}`, "_blank");
  }

  return (
    <>
      <GradientHeader
        eyebrow="Compliance snapshot"
        title="Response & downtime"
        description="Weekly and monthly KPIs for open faults, response time, downtime, and schedule compliance."
        actions={
          <MtButton type="button" variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </MtButton>
        }
      />

      <FilterBar>
        <MtSelect
          value={period}
          onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
          className="sm:max-w-[200px]"
        >
          <option value="weekly">This week</option>
          <option value="monthly">This month</option>
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
          Refresh
        </MtButton>
      </FilterBar>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {report ? (
        <>
          <p className="text-xs text-slate-500">
            Window {new Date(report.from).toLocaleDateString()} –{" "}
            {new Date(report.to).toLocaleDateString()}
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <KpiCard
              label="Open faults"
              value={report.openFaults}
              icon={<TriangleAlert className="h-4 w-4" />}
            />
            <KpiCard
              label="Open maintenance"
              value={report.openMaintenanceRequests}
            />
            <KpiCard
              label="Avg response (h)"
              value={report.avgResponseHours ?? "—"}
              hint="Open → first response"
              icon={<Clock3 className="h-4 w-4" />}
            />
            <KpiCard
              label="Avg downtime (h)"
              value={report.avgDowntimeHours ?? "—"}
              hint="Fault downtime ended"
              icon={<TimerReset className="h-4 w-4" />}
            />
            <KpiCard
              label="Compliance %"
              value={report.complianceRate ?? "—"}
              hint="Operational share"
              icon={<ShieldCheck className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Tickets opened" value={report.ticketsOpened} />
            <KpiCard label="Tickets resolved" value={report.ticketsResolved} />
            <KpiCard
              label="Resolved in window"
              value={report.resolvedTickets}
              hint="Same period"
            />
            <KpiCard label="Schedules due" value={report.schedulesDue} />
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">Fleet status now</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {(Object.keys(report.equipmentByStatus) as Array<keyof typeof report.equipmentByStatus>).map(
                (status) => (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <EquipmentStatusBadge status={status} />
                    <span className="tabular-nums text-sm font-semibold">
                      {report.equipmentByStatus[status]}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
