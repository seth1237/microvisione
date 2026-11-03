import { randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { createMedTrackUser } from "@/lib/medtrack/auth";
import { dateOnly, isoDate, mtExecute, mtQuery, nowSql } from "@/lib/medtrack/db";
import { sendTicketNotification } from "@/lib/medtrack/mail";
import type {
  Branch,
  Equipment,
  EquipmentStatus,
  Hospital,
  MaintenanceSchedule,
  MedTrackReport,
  ReportPeriod,
  ServiceHistoryEntry,
  ServiceHistoryKind,
  StatusHistoryEntry,
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketType,
} from "@/lib/medtrack/types";
import { EQUIPMENT_STATUSES } from "@/lib/medtrack/types";

function parseEmails(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function publicBaseUrl() {
  return (
    process.env.MEDTRACK_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://127.0.0.1:3000"
  ).replace(/\/$/, "");
}

export function makePublicQrId() {
  return randomBytes(18).toString("base64url");
}

type HospitalRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  notification_emails: string;
  created_at: Date;
  updated_at: Date;
};

type BranchRow = RowDataPacket & {
  id: number;
  hospital_id: number;
  name: string;
  code: string;
  created_at: Date;
};

type EquipmentRow = RowDataPacket & {
  id: number;
  hospital_id: number;
  branch_id: number;
  public_qr_id: string;
  asset_tag: string;
  name: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  department: string;
  location: string;
  status: EquipmentStatus;
  last_service_at: Date | null;
  next_service_due: Date | string | null;
  notes: string;
  created_at: Date;
  updated_at: Date;
  branch_name?: string;
  hospital_name?: string;
};

type HistoryRow = RowDataPacket & {
  id: number;
  equipment_id: number;
  hospital_id: number;
  kind: ServiceHistoryKind;
  summary: string;
  details: string;
  parts_used: string;
  tests_performed: string;
  performed_by_user_id: number | null;
  performed_by_name: string;
  created_at: Date;
};

type StatusHistoryRow = RowDataPacket & {
  id: number;
  equipment_id: number;
  hospital_id: number;
  from_status: EquipmentStatus | null;
  to_status: EquipmentStatus;
  summary: string;
  performed_by_user_id: number | null;
  performed_by_name: string;
  created_at: Date;
};

type ScheduleRow = RowDataPacket & {
  id: number;
  hospital_id: number;
  equipment_id: number;
  branch_id: number;
  title: string;
  interval_days: number;
  next_due_date: Date | string;
  last_completed_at: Date | null;
  active: number;
  notes: string;
  created_at: Date;
  updated_at: Date;
  equipment_name?: string;
  asset_tag?: string;
  branch_name?: string;
};

type TicketRow = RowDataPacket & {
  id: number;
  hospital_id: number;
  equipment_id: number;
  branch_id: number;
  type: TicketType;
  status: TicketStatus;
  reporter_name: string;
  reporter_contact: string;
  reporter_note: string;
  engineer_notes: string;
  priority: TicketPriority;
  assigned_to_user_id: number | null;
  assigned_to_name?: string | null;
  opened_at: Date;
  first_response_at: Date | null;
  resolved_at: Date | null;
  downtime_started_at: Date | null;
  downtime_ended_at: Date | null;
  created_at: Date;
  updated_at: Date;
  equipment_name?: string;
  asset_tag?: string;
  branch_name?: string;
  public_qr_id?: string;
};

function mapHospital(row: HospitalRow): Hospital {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    notificationEmails: parseEmails(row.notification_emails || ""),
    createdAt: isoDate(row.created_at) || "",
    updatedAt: isoDate(row.updated_at) || "",
  };
}

function mapBranch(row: BranchRow): Branch {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    name: row.name,
    code: row.code,
    createdAt: isoDate(row.created_at) || "",
  };
}

function mapEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    branchId: row.branch_id,
    publicQrId: row.public_qr_id,
    assetTag: row.asset_tag,
    name: row.name,
    manufacturer: row.manufacturer,
    model: row.model,
    serialNumber: row.serial_number,
    department: row.department,
    location: row.location,
    status: row.status,
    lastServiceAt: isoDate(row.last_service_at),
    nextServiceDue: dateOnly(row.next_service_due),
    notes: row.notes || "",
    createdAt: isoDate(row.created_at) || "",
    updatedAt: isoDate(row.updated_at) || "",
    branchName: row.branch_name,
    hospitalName: row.hospital_name,
  };
}

function mapHistory(row: HistoryRow): ServiceHistoryEntry {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    hospitalId: row.hospital_id,
    kind: row.kind,
    summary: row.summary,
    details: row.details || "",
    partsUsed: row.parts_used || "",
    testsPerformed: row.tests_performed || "",
    performedByUserId: row.performed_by_user_id,
    performedByName: row.performed_by_name || "",
    createdAt: isoDate(row.created_at) || "",
  };
}

function mapStatusHistory(row: StatusHistoryRow): StatusHistoryEntry {
  return {
    id: row.id,
    equipmentId: row.equipment_id,
    hospitalId: row.hospital_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    summary: row.summary,
    performedByUserId: row.performed_by_user_id,
    performedByName: row.performed_by_name || "",
    createdAt: isoDate(row.created_at) || "",
  };
}

function mapSchedule(row: ScheduleRow): MaintenanceSchedule {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    equipmentId: row.equipment_id,
    branchId: row.branch_id,
    title: row.title,
    intervalDays: row.interval_days,
    nextDueDate: dateOnly(row.next_due_date) || "",
    lastCompletedAt: isoDate(row.last_completed_at),
    active: Boolean(row.active),
    notes: row.notes || "",
    createdAt: isoDate(row.created_at) || "",
    updatedAt: isoDate(row.updated_at) || "",
    equipmentName: row.equipment_name,
    assetTag: row.asset_tag,
    branchName: row.branch_name,
  };
}

function hoursBetween(a: Date | string | null | undefined, b: Date | string | null | undefined) {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  return Math.round((ms / 3_600_000) * 10) / 10;
}

function mapTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    equipmentId: row.equipment_id,
    branchId: row.branch_id,
    type: row.type,
    status: row.status,
    reporterName: row.reporter_name,
    reporterContact: row.reporter_contact,
    reporterNote: row.reporter_note,
    engineerNotes: row.engineer_notes || "",
    priority: row.priority,
    assignedToUserId: row.assigned_to_user_id,
    assignedToName: row.assigned_to_name ?? null,
    openedAt: isoDate(row.opened_at) || "",
    firstResponseAt: isoDate(row.first_response_at),
    resolvedAt: isoDate(row.resolved_at),
    downtimeStartedAt: isoDate(row.downtime_started_at),
    downtimeEndedAt: isoDate(row.downtime_ended_at),
    createdAt: isoDate(row.created_at) || "",
    updatedAt: isoDate(row.updated_at) || "",
    equipmentName: row.equipment_name,
    assetTag: row.asset_tag,
    branchName: row.branch_name,
    publicQrId: row.public_qr_id,
    responseHours: hoursBetween(row.opened_at, row.first_response_at),
    downtimeHours: hoursBetween(
      row.downtime_started_at,
      row.downtime_ended_at || row.resolved_at,
    ),
  };
}

export async function getHospital(id: number) {
  const rows = await mtQuery<HospitalRow[]>(`SELECT * FROM mt_hospitals WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ? mapHospital(rows[0]) : null;
}

export async function listBranches(hospitalId: number) {
  const rows = await mtQuery<BranchRow[]>(
    `SELECT * FROM mt_branches WHERE hospital_id = ? ORDER BY name ASC`,
    [hospitalId],
  );
  return rows.map(mapBranch);
}

export async function getBranchForHospital(branchId: number, hospitalId: number) {
  const rows = await mtQuery<BranchRow[]>(
    `SELECT * FROM mt_branches WHERE id = ? AND hospital_id = ? LIMIT 1`,
    [branchId, hospitalId],
  );
  return rows[0] ? mapBranch(rows[0]) : null;
}

export async function createHospital(input: {
  name: string;
  slug: string;
  notificationEmails: string[];
}) {
  const now = nowSql();
  const result = await mtExecute(
    `INSERT INTO mt_hospitals (name, slug, notification_emails, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [input.name.trim(), input.slug.trim().toLowerCase(), input.notificationEmails.join(", "), now, now],
  );
  return getHospital(Number(result.insertId));
}

export async function createBranch(input: { hospitalId: number; name: string; code: string }) {
  const result = await mtExecute(
    `INSERT INTO mt_branches (hospital_id, name, code, created_at) VALUES (?, ?, ?, ?)`,
    [input.hospitalId, input.name.trim(), input.code.trim().toUpperCase(), nowSql()],
  );
  const rows = await mtQuery<BranchRow[]>(`SELECT * FROM mt_branches WHERE id = ?`, [result.insertId]);
  return rows[0] ? mapBranch(rows[0]) : null;
}

export async function appendServiceHistory(input: {
  equipmentId: number;
  hospitalId: number;
  kind: ServiceHistoryKind;
  summary: string;
  details?: string;
  partsUsed?: string;
  testsPerformed?: string;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const result = await mtExecute(
    `INSERT INTO mt_service_history
      (equipment_id, hospital_id, kind, summary, details, parts_used, tests_performed,
       performed_by_user_id, performed_by_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.equipmentId,
      input.hospitalId,
      input.kind,
      input.summary.trim(),
      input.details?.trim() || "",
      input.partsUsed?.trim() || "",
      input.testsPerformed?.trim() || "",
      input.performedByUserId ?? null,
      input.performedByName?.trim() || "",
      nowSql(),
    ],
  );
  const rows = await mtQuery<HistoryRow[]>(`SELECT * FROM mt_service_history WHERE id = ?`, [
    result.insertId,
  ]);
  return rows[0] ? mapHistory(rows[0]) : null;
}

export async function appendStatusHistory(input: {
  equipmentId: number;
  hospitalId: number;
  fromStatus: EquipmentStatus | null;
  toStatus: EquipmentStatus;
  summary: string;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const result = await mtExecute(
    `INSERT INTO mt_status_history
      (equipment_id, hospital_id, from_status, to_status, summary,
       performed_by_user_id, performed_by_name, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.equipmentId,
      input.hospitalId,
      input.fromStatus,
      input.toStatus,
      input.summary.trim(),
      input.performedByUserId ?? null,
      input.performedByName?.trim() || "",
      nowSql(),
    ],
  );
  const rows = await mtQuery<StatusHistoryRow[]>(`SELECT * FROM mt_status_history WHERE id = ?`, [
    result.insertId,
  ]);
  return rows[0] ? mapStatusHistory(rows[0]) : null;
}

export async function listServiceHistory(equipmentId: number, hospitalId?: number, limit = 50) {
  const rows = await mtQuery<HistoryRow[]>(
    hospitalId
      ? `SELECT * FROM mt_service_history WHERE equipment_id = ? AND hospital_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`
      : `SELECT * FROM mt_service_history WHERE equipment_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`,
    hospitalId ? [equipmentId, hospitalId, limit] : [equipmentId, limit],
  );
  return rows.map(mapHistory);
}

export async function listStatusHistory(equipmentId: number, hospitalId: number, limit = 50) {
  const rows = await mtQuery<StatusHistoryRow[]>(
    `SELECT * FROM mt_status_history
     WHERE equipment_id = ? AND hospital_id = ?
     ORDER BY created_at DESC, id DESC LIMIT ?`,
    [equipmentId, hospitalId, limit],
  );
  return rows.map(mapStatusHistory);
}

const equipmentSelect = `
  SELECT e.*, b.name AS branch_name, h.name AS hospital_name
  FROM mt_equipment e
  JOIN mt_branches b ON b.id = e.branch_id AND b.hospital_id = e.hospital_id
  JOIN mt_hospitals h ON h.id = e.hospital_id
`;

export async function getEquipmentByPublicQrId(publicQrId: string) {
  const rows = await mtQuery<EquipmentRow[]>(
    `${equipmentSelect} WHERE e.public_qr_id = ? LIMIT 1`,
    [publicQrId],
  );
  return rows[0] ? mapEquipment(rows[0]) : null;
}

export async function getEquipmentById(id: number, hospitalId?: number) {
  const rows = await mtQuery<EquipmentRow[]>(
    hospitalId
      ? `${equipmentSelect} WHERE e.id = ? AND e.hospital_id = ? LIMIT 1`
      : `${equipmentSelect} WHERE e.id = ? LIMIT 1`,
    hospitalId ? [id, hospitalId] : [id],
  );
  return rows[0] ? mapEquipment(rows[0]) : null;
}

export async function listEquipment(input: {
  hospitalId: number;
  branchId?: number | null;
  status?: EquipmentStatus | null;
  department?: string | null;
  q?: string;
}) {
  const where = ["e.hospital_id = ?"];
  const params: unknown[] = [input.hospitalId];
  if (input.branchId) {
    where.push("e.branch_id = ?");
    params.push(input.branchId);
  }
  if (input.status) {
    where.push("e.status = ?");
    params.push(input.status);
  }
  if (input.department?.trim()) {
    where.push("e.department = ?");
    params.push(input.department.trim());
  }
  if (input.q?.trim()) {
    where.push("(e.name LIKE ? OR e.asset_tag LIKE ? OR e.serial_number LIKE ? OR e.department LIKE ? OR e.location LIKE ?)");
    const like = `%${input.q.trim()}%`;
    params.push(like, like, like, like, like);
  }
  const rows = await mtQuery<EquipmentRow[]>(
    `${equipmentSelect} WHERE ${where.join(" AND ")} ORDER BY e.updated_at DESC LIMIT 500`,
    params,
  );
  return rows.map(mapEquipment);
}

export async function registerEquipment(input: {
  hospitalId: number;
  branchId: number;
  assetTag: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  department?: string;
  location?: string;
  status?: EquipmentStatus;
  nextServiceDue?: string | null;
  notes?: string;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const branch = await getBranchForHospital(input.branchId, input.hospitalId);
  if (!branch) throw new Error("Branch not found for this hospital");

  const now = nowSql();
  const publicQrId = makePublicQrId();
  const status = input.status || "status_unverified";
  const result = await mtExecute(
    `INSERT INTO mt_equipment
      (hospital_id, branch_id, public_qr_id, asset_tag, name, manufacturer, model, serial_number,
       department, location, status, last_service_at, next_service_due, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
    [
      input.hospitalId,
      input.branchId,
      publicQrId,
      input.assetTag.trim(),
      input.name.trim(),
      input.manufacturer?.trim() || "",
      input.model?.trim() || "",
      input.serialNumber?.trim() || "",
      input.department?.trim() || "",
      input.location?.trim() || "",
      status,
      input.nextServiceDue || null,
      input.notes?.trim() || "",
      now,
      now,
    ],
  );
  const equipment = await getEquipmentById(Number(result.insertId), input.hospitalId);
  if (equipment) {
    await appendServiceHistory({
      equipmentId: equipment.id,
      hospitalId: equipment.hospitalId,
      kind: "commissioned",
      summary: "Equipment registered",
      details: `Asset ${equipment.assetTag} registered with public QR passport.`,
      performedByUserId: input.performedByUserId,
      performedByName: input.performedByName,
    });
    await appendStatusHistory({
      equipmentId: equipment.id,
      hospitalId: equipment.hospitalId,
      fromStatus: null,
      toStatus: status,
      summary: "Initial registration status",
      performedByUserId: input.performedByUserId,
      performedByName: input.performedByName,
    });
  }
  return equipment;
}

export async function updateEquipment(input: {
  equipmentId: number;
  hospitalId: number;
  assetTag?: string;
  name?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  department?: string;
  location?: string;
  nextServiceDue?: string | null;
  notes?: string;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const existing = await getEquipmentById(input.equipmentId, input.hospitalId);
  if (!existing) return null;

  await mtExecute(
    `UPDATE mt_equipment
     SET asset_tag = COALESCE(?, asset_tag),
         name = COALESCE(?, name),
         manufacturer = COALESCE(?, manufacturer),
         model = COALESCE(?, model),
         serial_number = COALESCE(?, serial_number),
         department = COALESCE(?, department),
         location = COALESCE(?, location),
         next_service_due = COALESCE(?, next_service_due),
         notes = COALESCE(?, notes),
         updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [
      input.assetTag?.trim() ?? null,
      input.name?.trim() ?? null,
      input.manufacturer?.trim() ?? null,
      input.model?.trim() ?? null,
      input.serialNumber?.trim() ?? null,
      input.department?.trim() ?? null,
      input.location?.trim() ?? null,
      input.nextServiceDue === undefined ? null : input.nextServiceDue,
      input.notes?.trim() ?? null,
      nowSql(),
      input.equipmentId,
      input.hospitalId,
    ],
  );

  await appendServiceHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    kind: "note",
    summary: "Equipment details updated",
    details: "Passport fields edited by authorized staff.",
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });

  return getEquipmentById(input.equipmentId, input.hospitalId);
}

export async function transferEquipment(input: {
  equipmentId: number;
  hospitalId: number;
  branchId: number;
  department?: string;
  location?: string;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const existing = await getEquipmentById(input.equipmentId, input.hospitalId);
  if (!existing) return null;
  const branch = await getBranchForHospital(input.branchId, input.hospitalId);
  if (!branch) throw new Error("Branch not found for this hospital");

  await mtExecute(
    `UPDATE mt_equipment
     SET branch_id = ?, department = COALESCE(?, department), location = COALESCE(?, location), updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [
      input.branchId,
      input.department?.trim() ?? null,
      input.location?.trim() ?? null,
      nowSql(),
      input.equipmentId,
      input.hospitalId,
    ],
  );

  await appendServiceHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    kind: "transfer",
    summary: `Transferred to ${branch.name}`,
    details: [
      existing.branchName ? `From ${existing.branchName}` : null,
      input.department ? `Department: ${input.department}` : null,
      input.location ? `Location: ${input.location}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });

  return getEquipmentById(input.equipmentId, input.hospitalId);
}

export async function regenerateEquipmentQr(input: {
  equipmentId: number;
  hospitalId: number;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const existing = await getEquipmentById(input.equipmentId, input.hospitalId);
  if (!existing) return null;
  const publicQrId = makePublicQrId();
  await mtExecute(
    `UPDATE mt_equipment SET public_qr_id = ?, updated_at = ? WHERE id = ? AND hospital_id = ?`,
    [publicQrId, nowSql(), input.equipmentId, input.hospitalId],
  );
  await appendServiceHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    kind: "qr_regenerated",
    summary: "Public QR regenerated",
    details: `Previous QR id replaced. Reprint labels that used ${existing.publicQrId}.`,
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });
  return getEquipmentById(input.equipmentId, input.hospitalId);
}

export async function updateEquipmentStatus(input: {
  equipmentId: number;
  hospitalId: number;
  status: EquipmentStatus;
  summary: string;
  details?: string;
  performedByUserId?: number | null;
  performedByName?: string;
  setLastService?: boolean;
}) {
  const existing = await getEquipmentById(input.equipmentId, input.hospitalId);
  if (!existing) return null;
  const now = nowSql();
  await mtExecute(
    `UPDATE mt_equipment
     SET status = ?, updated_at = ?, last_service_at = IF(?, ?, last_service_at)
     WHERE id = ? AND hospital_id = ?`,
    [input.status, now, input.setLastService ? 1 : 0, now, input.equipmentId, input.hospitalId],
  );
  await appendServiceHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    kind: "status_change",
    summary: input.summary,
    details: input.details,
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });
  await appendStatusHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    fromStatus: existing.status,
    toStatus: input.status,
    summary: input.summary,
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });
  return getEquipmentById(input.equipmentId, input.hospitalId);
}

export async function recordService(input: {
  equipmentId: number;
  hospitalId: number;
  summary: string;
  details?: string;
  partsUsed?: string;
  testsPerformed?: string;
  nextServiceDue?: string | null;
  returnToService?: boolean;
  performedByUserId: number;
  performedByName: string;
  canReturnToService: boolean;
}) {
  const now = nowSql();
  const equipment = await getEquipmentById(input.equipmentId, input.hospitalId);
  if (!equipment) return null;

  if (input.returnToService && !input.canReturnToService) {
    throw new Error("Only engineers, supervisors, or admins can return equipment to service");
  }

  const nextStatus: EquipmentStatus = input.returnToService
    ? "operational"
    : equipment.status === "out_of_service"
      ? "out_of_service"
      : "under_maintenance";

  await mtExecute(
    `UPDATE mt_equipment
     SET last_service_at = ?, next_service_due = COALESCE(?, next_service_due),
         status = ?, updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [now, input.nextServiceDue || null, nextStatus, now, input.equipmentId, input.hospitalId],
  );

  await appendServiceHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    kind: input.returnToService ? "fault_cleared" : "service",
    summary: input.summary,
    details: input.details,
    partsUsed: input.partsUsed,
    testsPerformed: input.testsPerformed,
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });

  if (nextStatus !== equipment.status) {
    await appendStatusHistory({
      equipmentId: input.equipmentId,
      hospitalId: input.hospitalId,
      fromStatus: equipment.status,
      toStatus: nextStatus,
      summary: input.returnToService ? "Returned to service" : "Status after service record",
      performedByUserId: input.performedByUserId,
      performedByName: input.performedByName,
    });
  }

  if (input.returnToService) {
    await mtExecute(
      `UPDATE mt_tickets
       SET status = 'resolved', resolved_at = ?, downtime_ended_at = COALESCE(downtime_ended_at, ?),
           first_response_at = COALESCE(first_response_at, ?), updated_at = ?
       WHERE equipment_id = ? AND hospital_id = ? AND status IN ('open', 'in_progress')`,
      [now, now, now, now, input.equipmentId, input.hospitalId],
    );
  }

  if (input.nextServiceDue) {
    await mtExecute(
      `UPDATE mt_maintenance_schedules
       SET next_due_date = ?, updated_at = ?
       WHERE equipment_id = ? AND hospital_id = ? AND active = 1`,
      [input.nextServiceDue, now, input.equipmentId, input.hospitalId],
    );
  }

  return getEquipmentById(input.equipmentId, input.hospitalId);
}

const ticketSelect = `
  SELECT t.*, e.name AS equipment_name, e.asset_tag, e.public_qr_id, b.name AS branch_name,
         u.name AS assigned_to_name
  FROM mt_tickets t
  JOIN mt_equipment e ON e.id = t.equipment_id AND e.hospital_id = t.hospital_id
  JOIN mt_branches b ON b.id = t.branch_id AND b.hospital_id = t.hospital_id
  LEFT JOIN mt_users u ON u.id = t.assigned_to_user_id AND u.hospital_id = t.hospital_id
`;

export async function getTicketById(id: number, hospitalId?: number) {
  const rows = await mtQuery<TicketRow[]>(
    hospitalId
      ? `${ticketSelect} WHERE t.id = ? AND t.hospital_id = ? LIMIT 1`
      : `${ticketSelect} WHERE t.id = ? LIMIT 1`,
    hospitalId ? [id, hospitalId] : [id],
  );
  return rows[0] ? mapTicket(rows[0]) : null;
}

export async function listTickets(input: {
  hospitalId: number;
  status?: TicketStatus | "openish" | null;
  type?: TicketType | null;
  branchId?: number | null;
  assignedToUserId?: number | null;
  priority?: TicketPriority | null;
}) {
  const where = ["t.hospital_id = ?"];
  const params: unknown[] = [input.hospitalId];
  if (input.status === "openish") {
    where.push("t.status IN ('open', 'in_progress')");
  } else if (input.status) {
    where.push("t.status = ?");
    params.push(input.status);
  }
  if (input.type) {
    where.push("t.type = ?");
    params.push(input.type);
  }
  if (input.branchId) {
    where.push("t.branch_id = ?");
    params.push(input.branchId);
  }
  if (input.assignedToUserId) {
    where.push("t.assigned_to_user_id = ?");
    params.push(input.assignedToUserId);
  }
  if (input.priority) {
    where.push("t.priority = ?");
    params.push(input.priority);
  }
  const rows = await mtQuery<TicketRow[]>(
    `${ticketSelect} WHERE ${where.join(" AND ")}
     ORDER BY FIELD(t.priority, 'critical', 'high', 'normal', 'low'), t.opened_at DESC
     LIMIT 300`,
    params,
  );
  return rows.map(mapTicket);
}

export async function createPublicTicket(input: {
  publicQrId: string;
  type: TicketType;
  reporterName?: string;
  reporterContact?: string;
  reporterNote: string;
  priority?: TicketPriority;
}) {
  const equipment = await getEquipmentByPublicQrId(input.publicQrId);
  if (!equipment) return null;
  const hospital = await getHospital(equipment.hospitalId);
  if (!hospital) return null;

  const now = nowSql();
  const isFault = input.type === "fault";
  const nextStatus: EquipmentStatus = isFault
    ? "out_of_service"
    : equipment.status === "operational"
      ? "maintenance_due"
      : equipment.status;

  const result = await mtExecute(
    `INSERT INTO mt_tickets
      (hospital_id, equipment_id, branch_id, type, status, reporter_name, reporter_contact,
       reporter_note, engineer_notes, priority, assigned_to_user_id, opened_at, first_response_at, resolved_at,
       downtime_started_at, downtime_ended_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'open', ?, ?, ?, '', ?, NULL, ?, NULL, NULL, ?, NULL, ?, ?)`,
    [
      equipment.hospitalId,
      equipment.id,
      equipment.branchId,
      input.type,
      input.reporterName?.trim() || "",
      input.reporterContact?.trim() || "",
      input.reporterNote.trim(),
      input.priority || (isFault ? "high" : "normal"),
      now,
      isFault ? now : null,
      now,
      now,
    ],
  );

  await mtExecute(`UPDATE mt_equipment SET status = ?, updated_at = ? WHERE id = ? AND hospital_id = ?`, [
    nextStatus,
    now,
    equipment.id,
    equipment.hospitalId,
  ]);

  if (nextStatus !== equipment.status) {
    await appendStatusHistory({
      equipmentId: equipment.id,
      hospitalId: equipment.hospitalId,
      fromStatus: equipment.status,
      toStatus: nextStatus,
      summary: isFault ? "Marked out of service after fault report" : "Marked maintenance due",
      performedByName: input.reporterName?.trim() || "Public reporter",
    });
  }

  await appendServiceHistory({
    equipmentId: equipment.id,
    hospitalId: equipment.hospitalId,
    kind: "note",
    summary: isFault ? "Fault reported via public QR" : "Maintenance requested via public QR",
    details: input.reporterNote.trim(),
    performedByName: input.reporterName?.trim() || "Public reporter",
  });

  const ticket = await getTicketById(Number(result.insertId));
  const refreshed = await getEquipmentById(equipment.id);
  if (ticket && refreshed) {
    await sendTicketNotification({
      to: hospital.notificationEmails,
      hospitalName: hospital.name,
      equipment: refreshed,
      ticket,
      publicUrl: `${publicBaseUrl()}/q/${equipment.publicQrId}`,
    });
  }
  return { ticket, equipment: refreshed };
}

export async function updateTicket(input: {
  ticketId: number;
  hospitalId: number;
  status?: TicketStatus;
  assignedToUserId?: number | null;
  priority?: TicketPriority;
  engineerNotes?: string;
  markFirstResponse?: boolean;
}) {
  const ticket = await getTicketById(input.ticketId, input.hospitalId);
  if (!ticket) return null;

  if (input.assignedToUserId != null) {
    const assignee = await mtQuery<RowDataPacket[]>(
      `SELECT id FROM mt_users WHERE id = ? AND hospital_id = ? LIMIT 1`,
      [input.assignedToUserId, input.hospitalId],
    );
    if (!assignee[0]) throw new Error("Assignee must belong to this hospital");
  }

  const now = nowSql();
  const status = input.status || ticket.status;
  const resolvedAt =
    status === "resolved" || status === "closed"
      ? now
      : ticket.resolvedAt
        ? ticket.resolvedAt.slice(0, 19).replace("T", " ")
        : null;
  const downtimeEnded =
    status === "resolved" || status === "closed"
      ? now
      : ticket.downtimeEndedAt
        ? ticket.downtimeEndedAt.slice(0, 19).replace("T", " ")
        : null;

  const assignProvided = input.assignedToUserId !== undefined;
  await mtExecute(
    `UPDATE mt_tickets
     SET status = ?,
         assigned_to_user_id = IF(?, ?, assigned_to_user_id),
         priority = COALESCE(?, priority),
         engineer_notes = COALESCE(?, engineer_notes),
         first_response_at = IF(? = 1, COALESCE(first_response_at, ?), first_response_at),
         resolved_at = ?,
         downtime_ended_at = ?,
         updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [
      status,
      assignProvided ? 1 : 0,
      assignProvided ? input.assignedToUserId ?? null : null,
      input.priority ?? null,
      input.engineerNotes?.trim() ?? null,
      input.markFirstResponse || status === "in_progress" ? 1 : 0,
      now,
      resolvedAt,
      downtimeEnded,
      now,
      input.ticketId,
      input.hospitalId,
    ],
  );

  return getTicketById(input.ticketId, input.hospitalId);
}

const scheduleSelect = `
  SELECT s.*, e.name AS equipment_name, e.asset_tag, b.name AS branch_name
  FROM mt_maintenance_schedules s
  JOIN mt_equipment e ON e.id = s.equipment_id AND e.hospital_id = s.hospital_id
  JOIN mt_branches b ON b.id = s.branch_id AND b.hospital_id = s.hospital_id
`;

export async function listSchedules(input: {
  hospitalId: number;
  branchId?: number | null;
  equipmentId?: number | null;
  dueOnly?: boolean;
}) {
  const where = ["s.hospital_id = ?", "s.active = 1"];
  const params: unknown[] = [input.hospitalId];
  if (input.branchId) {
    where.push("s.branch_id = ?");
    params.push(input.branchId);
  }
  if (input.equipmentId) {
    where.push("s.equipment_id = ?");
    params.push(input.equipmentId);
  }
  if (input.dueOnly) {
    where.push("s.next_due_date <= CURDATE()");
  }
  const rows = await mtQuery<ScheduleRow[]>(
    `${scheduleSelect} WHERE ${where.join(" AND ")} ORDER BY s.next_due_date ASC LIMIT 300`,
    params,
  );
  return rows.map(mapSchedule);
}

export async function createSchedule(input: {
  hospitalId: number;
  equipmentId: number;
  title: string;
  intervalDays: number;
  nextDueDate: string;
  notes?: string;
  performedByUserId?: number | null;
  performedByName?: string;
}) {
  const equipment = await getEquipmentById(input.equipmentId, input.hospitalId);
  if (!equipment) return null;
  const now = nowSql();
  const result = await mtExecute(
    `INSERT INTO mt_maintenance_schedules
      (hospital_id, equipment_id, branch_id, title, interval_days, next_due_date,
       last_completed_at, active, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NULL, 1, ?, ?, ?)`,
    [
      input.hospitalId,
      input.equipmentId,
      equipment.branchId,
      input.title.trim(),
      Math.max(1, input.intervalDays),
      input.nextDueDate,
      input.notes?.trim() || "",
      now,
      now,
    ],
  );

  await mtExecute(
    `UPDATE mt_equipment SET next_service_due = COALESCE(next_service_due, ?), updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [input.nextDueDate, now, input.equipmentId, input.hospitalId],
  );

  await appendServiceHistory({
    equipmentId: input.equipmentId,
    hospitalId: input.hospitalId,
    kind: "schedule",
    summary: `Schedule created: ${input.title.trim()}`,
    details: `Every ${input.intervalDays} days · next due ${input.nextDueDate}`,
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });

  const rows = await mtQuery<ScheduleRow[]>(
    `${scheduleSelect} WHERE s.id = ? AND s.hospital_id = ? LIMIT 1`,
    [result.insertId, input.hospitalId],
  );
  return rows[0] ? mapSchedule(rows[0]) : null;
}

export async function completeSchedule(input: {
  scheduleId: number;
  hospitalId: number;
  summary?: string;
  performedByUserId: number;
  performedByName: string;
}) {
  const rows = await mtQuery<ScheduleRow[]>(
    `${scheduleSelect} WHERE s.id = ? AND s.hospital_id = ? LIMIT 1`,
    [input.scheduleId, input.hospitalId],
  );
  const schedule = rows[0] ? mapSchedule(rows[0]) : null;
  if (!schedule) return null;

  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + schedule.intervalDays);
  const nextDue = next.toISOString().slice(0, 10);
  const nowSqlValue = nowSql();

  await mtExecute(
    `UPDATE mt_maintenance_schedules
     SET last_completed_at = ?, next_due_date = ?, updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [nowSqlValue, nextDue, nowSqlValue, input.scheduleId, input.hospitalId],
  );

  await mtExecute(
    `UPDATE mt_equipment SET last_service_at = ?, next_service_due = ?, updated_at = ?
     WHERE id = ? AND hospital_id = ?`,
    [nowSqlValue, nextDue, nowSqlValue, schedule.equipmentId, input.hospitalId],
  );

  await appendServiceHistory({
    equipmentId: schedule.equipmentId,
    hospitalId: input.hospitalId,
    kind: "schedule",
    summary: input.summary?.trim() || `Completed schedule: ${schedule.title}`,
    details: `Next due ${nextDue}`,
    performedByUserId: input.performedByUserId,
    performedByName: input.performedByName,
  });

  const refreshed = await mtQuery<ScheduleRow[]>(
    `${scheduleSelect} WHERE s.id = ? AND s.hospital_id = ? LIMIT 1`,
    [input.scheduleId, input.hospitalId],
  );
  return refreshed[0] ? mapSchedule(refreshed[0]) : null;
}

function periodBounds(period: ReportPeriod, reference = new Date()) {
  const to = new Date(reference);
  const from = new Date(reference);
  if (period === "weekly") {
    const day = from.getUTCDay() || 7;
    from.setUTCDate(from.getUTCDate() - day + 1);
    from.setUTCHours(0, 0, 0, 0);
  } else {
    from.setUTCDate(1);
    from.setUTCHours(0, 0, 0, 0);
  }
  return { from, to };
}

export async function buildReport(input: {
  hospitalId: number;
  period: ReportPeriod;
  branchId?: number | null;
}): Promise<MedTrackReport> {
  const { from, to } = periodBounds(input.period);
  const fromSql = from.toISOString().slice(0, 19).replace("T", " ");
  const toSql = to.toISOString().slice(0, 19).replace("T", " ");

  const ticketWhere = ["hospital_id = ?", "opened_at >= ?", "opened_at <= ?"];
  const ticketParams: unknown[] = [input.hospitalId, fromSql, toSql];
  if (input.branchId) {
    ticketWhere.push("branch_id = ?");
    ticketParams.push(input.branchId);
  }

  const openWhere = ["hospital_id = ?", "status IN ('open', 'in_progress')"];
  const openParams: unknown[] = [input.hospitalId];
  if (input.branchId) {
    openWhere.push("branch_id = ?");
    openParams.push(input.branchId);
  }

  const ticketsInPeriod = await mtQuery<TicketRow[]>(
    `SELECT * FROM mt_tickets WHERE ${ticketWhere.join(" AND ")}`,
    ticketParams,
  );
  const openTickets = await mtQuery<TicketRow[]>(
    `SELECT * FROM mt_tickets WHERE ${openWhere.join(" AND ")}`,
    openParams,
  );

  const eqWhere = ["hospital_id = ?"];
  const eqParams: unknown[] = [input.hospitalId];
  if (input.branchId) {
    eqWhere.push("branch_id = ?");
    eqParams.push(input.branchId);
  }
  const equipment = await mtQuery<EquipmentRow[]>(
    `SELECT * FROM mt_equipment WHERE ${eqWhere.join(" AND ")}`,
    eqParams,
  );

  const equipmentByStatus = Object.fromEntries(
    EQUIPMENT_STATUSES.map((s) => [s, 0]),
  ) as Record<EquipmentStatus, number>;
  for (const row of equipment) {
    if (equipmentByStatus[row.status] !== undefined) equipmentByStatus[row.status] += 1;
  }

  const responseHours = ticketsInPeriod
    .map((t) => hoursBetween(t.opened_at, t.first_response_at))
    .filter((n): n is number => n != null);
  const downtimeHours = ticketsInPeriod
    .map((t) => hoursBetween(t.downtime_started_at, t.downtime_ended_at || t.resolved_at))
    .filter((n): n is number => n != null);

  const avg = (nums: number[]) =>
    nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null;

  const scheduleWhere = ["hospital_id = ?", "active = 1", "next_due_date <= CURDATE()"];
  const scheduleParams: unknown[] = [input.hospitalId];
  if (input.branchId) {
    scheduleWhere.push("branch_id = ?");
    scheduleParams.push(input.branchId);
  }
  const dueSchedules = await mtQuery<RowDataPacket[]>(
    `SELECT COUNT(*) AS c FROM mt_maintenance_schedules WHERE ${scheduleWhere.join(" AND ")}`,
    scheduleParams,
  );
  const schedulesDue = Number(dueSchedules[0]?.c || 0);

  const operational = equipmentByStatus.operational || 0;
  const total = equipment.length || 0;
  const complianceRate = total
    ? Math.round((operational / total) * 1000) / 10
    : null;

  return {
    period: input.period,
    from: from.toISOString(),
    to: to.toISOString(),
    hospitalId: input.hospitalId,
    branchId: input.branchId ?? null,
    openFaults: openTickets.filter((t) => t.type === "fault").length,
    openMaintenanceRequests: openTickets.filter((t) => t.type === "maintenance_request").length,
    resolvedTickets: ticketsInPeriod.filter((t) => t.status === "resolved" || t.status === "closed")
      .length,
    avgResponseHours: avg(responseHours),
    avgDowntimeHours: avg(downtimeHours),
    equipmentByStatus,
    ticketsOpened: ticketsInPeriod.length,
    ticketsResolved: ticketsInPeriod.filter((t) => t.status === "resolved" || t.status === "closed")
      .length,
    schedulesDue,
    complianceRate,
  };
}

export function reportToCsv(report: MedTrackReport) {
  const lines = [
    ["metric", "value"],
    ["period", report.period],
    ["from", report.from],
    ["to", report.to],
    ["branch_id", report.branchId == null ? "" : String(report.branchId)],
    ["open_faults", String(report.openFaults)],
    ["open_maintenance_requests", String(report.openMaintenanceRequests)],
    ["tickets_opened", String(report.ticketsOpened)],
    ["tickets_resolved", String(report.ticketsResolved)],
    ["avg_response_hours", report.avgResponseHours == null ? "" : String(report.avgResponseHours)],
    ["avg_downtime_hours", report.avgDowntimeHours == null ? "" : String(report.avgDowntimeHours)],
    ["schedules_due", String(report.schedulesDue)],
    ["compliance_rate_pct", report.complianceRate == null ? "" : String(report.complianceRate)],
    ...EQUIPMENT_STATUSES.map((s) => [`equipment_${s}`, String(report.equipmentByStatus[s] || 0)]),
  ];
  return lines.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

export async function dashboardSummary(hospitalId: number, branchId?: number | null) {
  const equipment = await listEquipment({ hospitalId, branchId });
  const tickets = await listTickets({ hospitalId, status: "openish", branchId });
  const schedules = await listSchedules({ hospitalId, branchId, dueOnly: true });
  const byStatus = Object.fromEntries(
    EQUIPMENT_STATUSES.map((s) => [s, equipment.filter((e) => e.status === s).length]),
  ) as Record<EquipmentStatus, number>;
  return {
    equipmentCount: equipment.length,
    openTickets: tickets.length,
    openFaults: tickets.filter((t) => t.type === "fault").length,
    schedulesDue: schedules.length,
    byStatus,
  };
}

export async function seedDemoHospital(options?: { forceReseedExtras?: boolean }) {
  const existing = await mtQuery<HospitalRow[]>(
    `SELECT * FROM mt_hospitals WHERE slug = 'demo-general' LIMIT 1`,
  );
  if (existing[0] && !options?.forceReseedExtras) {
    return {
      hospital: mapHospital(existing[0]),
      seeded: false as const,
    };
  }

  let hospital = existing[0] ? mapHospital(existing[0]) : null;
  if (!hospital) {
    hospital = await createHospital({
      name: "Demo General Hospital",
      slug: "demo-general",
      notificationEmails: ["biomed@demo-hospital.local", "maintenance@demo-hospital.local"],
    });
  }
  if (!hospital) throw new Error("Failed to create demo hospital");

  let main = (await listBranches(hospital.id)).find((b) => b.code === "MAIN") || null;
  let west = (await listBranches(hospital.id)).find((b) => b.code === "WEST") || null;
  if (!main) {
    main = await createBranch({ hospitalId: hospital.id, name: "Main Campus", code: "MAIN" });
  }
  if (!west) {
    west = await createBranch({ hospitalId: hospital.id, name: "West Wing", code: "WEST" });
  }
  if (!main || !west) throw new Error("Failed to create demo branches");

  const existingUsers = await mtQuery<RowDataPacket[]>(
    `SELECT email FROM mt_users WHERE hospital_id = ?`,
    [hospital.id],
  );
  const emails = new Set(existingUsers.map((u) => String(u.email)));

  const admin = emails.has("admin@demo-hospital.local")
    ? null
    : await createMedTrackUser({
        hospitalId: hospital.id,
        email: "admin@demo-hospital.local",
        name: "Hospital Admin",
        password: "demo-admin",
        role: "admin",
      });
  const engineer = emails.has("engineer@demo-hospital.local")
    ? null
    : await createMedTrackUser({
        hospitalId: hospital.id,
        branchId: main.id,
        email: "engineer@demo-hospital.local",
        name: "Field Engineer",
        password: "demo-engineer",
        role: "engineer",
      });
  const technician = emails.has("tech@demo-hospital.local")
    ? null
    : await createMedTrackUser({
        hospitalId: hospital.id,
        branchId: main.id,
        email: "tech@demo-hospital.local",
        name: "Biomed Technician",
        password: "demo-tech",
        role: "technician",
      });
  const supervisor = emails.has("supervisor@demo-hospital.local")
    ? null
    : await createMedTrackUser({
        hospitalId: hospital.id,
        email: "supervisor@demo-hospital.local",
        name: "Clinical Supervisor",
        password: "demo-supervisor",
        role: "supervisor",
      });

  const existingEq = await listEquipment({ hospitalId: hospital.id });
  let defibrillator = existingEq.find((e) => e.assetTag === "BIO-DEF-001") || null;
  let ventilator = existingEq.find((e) => e.assetTag === "BIO-VENT-014") || null;
  let infusion = existingEq.find((e) => e.assetTag === "BIO-INF-203") || null;

  if (!defibrillator) {
    defibrillator = await registerEquipment({
      hospitalId: hospital.id,
      branchId: main.id,
      assetTag: "BIO-DEF-001",
      name: "Defibrillator",
      manufacturer: "Philips",
      model: "HeartStart XL+",
      serialNumber: "HSX-10021",
      department: "Emergency",
      location: "Resus Bay 1",
      status: "operational",
      nextServiceDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10),
      performedByName: "System seed",
    });
  }

  if (!ventilator) {
    ventilator = await registerEquipment({
      hospitalId: hospital.id,
      branchId: west.id,
      assetTag: "BIO-VENT-014",
      name: "ICU Ventilator",
      manufacturer: "Dräger",
      model: "Evita V600",
      serialNumber: "EV6-8841",
      department: "ICU",
      location: "Bed 4",
      status: "maintenance_due",
      nextServiceDue: new Date().toISOString().slice(0, 10),
      performedByName: "System seed",
    });
  }

  if (!infusion) {
    infusion = await registerEquipment({
      hospitalId: hospital.id,
      branchId: main.id,
      assetTag: "BIO-INF-203",
      name: "Infusion Pump",
      manufacturer: "B. Braun",
      model: "Infusomat Space",
      serialNumber: "ISP-5520",
      department: "Maternity",
      location: "Ward A",
      status: "status_unverified",
      performedByName: "System seed",
    });
  }

  if (ventilator) {
    const existingSchedules = await listSchedules({
      hospitalId: hospital.id,
      equipmentId: ventilator.id,
    });
    if (!existingSchedules.length) {
      await createSchedule({
        hospitalId: hospital.id,
        equipmentId: ventilator.id,
        title: "Preventive ventilator PM",
        intervalDays: 90,
        nextDueDate: new Date().toISOString().slice(0, 10),
        notes: "Filter check, alarm test, battery inspection",
        performedByName: "System seed",
      });
    }
  }

  if (defibrillator) {
    const existingSchedules = await listSchedules({
      hospitalId: hospital.id,
      equipmentId: defibrillator.id,
    });
    if (!existingSchedules.length) {
      await createSchedule({
        hospitalId: hospital.id,
        equipmentId: defibrillator.id,
        title: "Defib quarterly inspection",
        intervalDays: 90,
        nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10),
        performedByName: "System seed",
      });
    }
  }

  return {
    hospital,
    branches: [main, west],
    users: { admin, engineer, technician, supervisor },
    equipment: [defibrillator, ventilator, infusion],
    seeded: true as const,
    credentials: {
      admin: { email: "admin@demo-hospital.local", password: "demo-admin" },
      engineer: { email: "engineer@demo-hospital.local", password: "demo-engineer" },
      technician: { email: "tech@demo-hospital.local", password: "demo-tech" },
      supervisor: { email: "supervisor@demo-hospital.local", password: "demo-supervisor" },
    },
  };
}
