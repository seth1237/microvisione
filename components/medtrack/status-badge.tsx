import { cn } from "@/lib/utils/cn";
import {
  EQUIPMENT_STATUS_LABELS,
  type EquipmentStatus,
  type TicketStatus,
  type TicketType,
} from "@/lib/medtrack/types";

const equipmentTone: Record<EquipmentStatus, string> = {
  operational: "border-emerald-200 bg-emerald-50 text-emerald-800",
  maintenance_due: "border-amber-200 bg-amber-50 text-amber-800",
  under_maintenance: "border-sky-200 bg-sky-50 text-sky-800",
  out_of_service: "border-rose-200 bg-rose-50 text-rose-800",
  status_unverified: "border-amber-200 bg-amber-50 text-amber-800",
};

const ticketTone: Record<TicketStatus, string> = {
  open: "border-amber-200 bg-amber-50 text-amber-800",
  in_progress: "border-sky-200 bg-sky-50 text-sky-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  closed: "border-slate-200 bg-slate-50 text-slate-700",
};

export function EquipmentStatusBadge({
  status,
  className,
}: {
  status: EquipmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-semibold uppercase tracking-wide",
        equipmentTone[status],
        className,
      )}
    >
      {EQUIPMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-semibold uppercase tracking-wide",
        ticketTone[status],
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function TicketTypeBadge({ type }: { type: TicketType }) {
  const tone =
    type === "fault"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-sky-200 bg-sky-50 text-sky-800";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-semibold uppercase tracking-wide",
        tone,
      )}
    >
      {type === "fault" ? "Fault" : "Maintenance"}
    </span>
  );
}
