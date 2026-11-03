export const EQUIPMENT_STATUSES = [
  "operational",
  "maintenance_due",
  "under_maintenance",
  "out_of_service",
  "status_unverified",
] as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  operational: "Operational",
  maintenance_due: "Maintenance Due",
  under_maintenance: "Under Maintenance",
  out_of_service: "Out of Service",
  status_unverified: "Status Unverified",
};

export const USER_ROLES = ["admin", "engineer", "technician", "supervisor", "viewer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type TicketType = "fault" | "maintenance_request";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "critical";

export type ServiceHistoryKind =
  | "service"
  | "inspection"
  | "fault_cleared"
  | "status_change"
  | "note"
  | "commissioned"
  | "transfer"
  | "qr_regenerated"
  | "schedule";

export type Hospital = {
  id: number;
  name: string;
  slug: string;
  notificationEmails: string[];
  createdAt: string;
  updatedAt: string;
};

export type Branch = {
  id: number;
  hospitalId: number;
  name: string;
  code: string;
  createdAt: string;
};

export type MedTrackUser = {
  id: number;
  hospitalId: number;
  branchId: number | null;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export type Equipment = {
  id: number;
  hospitalId: number;
  branchId: number;
  publicQrId: string;
  assetTag: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  department: string;
  location: string;
  status: EquipmentStatus;
  lastServiceAt: string | null;
  nextServiceDue: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  branchName?: string;
  hospitalName?: string;
};

export type ServiceHistoryEntry = {
  id: number;
  equipmentId: number;
  hospitalId: number;
  kind: ServiceHistoryKind;
  summary: string;
  details: string;
  partsUsed: string;
  testsPerformed: string;
  performedByUserId: number | null;
  performedByName: string;
  createdAt: string;
};

export type StatusHistoryEntry = {
  id: number;
  equipmentId: number;
  hospitalId: number;
  fromStatus: EquipmentStatus | null;
  toStatus: EquipmentStatus;
  summary: string;
  performedByUserId: number | null;
  performedByName: string;
  createdAt: string;
};

export type MaintenanceSchedule = {
  id: number;
  hospitalId: number;
  equipmentId: number;
  branchId: number;
  title: string;
  intervalDays: number;
  nextDueDate: string;
  lastCompletedAt: string | null;
  active: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  equipmentName?: string;
  assetTag?: string;
  branchName?: string;
};

export type Ticket = {
  id: number;
  hospitalId: number;
  equipmentId: number;
  branchId: number;
  type: TicketType;
  status: TicketStatus;
  reporterName: string;
  reporterContact: string;
  reporterNote: string;
  engineerNotes: string;
  priority: TicketPriority;
  assignedToUserId: number | null;
  assignedToName?: string | null;
  openedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  downtimeStartedAt: string | null;
  downtimeEndedAt: string | null;
  createdAt: string;
  updatedAt: string;
  equipmentName?: string;
  assetTag?: string;
  branchName?: string;
  publicQrId?: string;
  responseHours?: number | null;
  downtimeHours?: number | null;
};

export type ReportPeriod = "weekly" | "monthly";

export type MedTrackReport = {
  period: ReportPeriod;
  from: string;
  to: string;
  hospitalId: number;
  branchId: number | null;
  openFaults: number;
  openMaintenanceRequests: number;
  resolvedTickets: number;
  avgResponseHours: number | null;
  avgDowntimeHours: number | null;
  equipmentByStatus: Record<EquipmentStatus, number>;
  ticketsOpened: number;
  ticketsResolved: number;
  schedulesDue: number;
  complianceRate: number | null;
};
