import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";
import QRCode from "qrcode";
import {
  MEDTRACK_COOKIE,
  authenticateMedTrackUser,
  canAssignTickets,
  canClearFaults,
  canManageInventory,
  canManageSchedules,
  canRecordService,
  createMedTrackSessionValue,
  getMedTrackUserById,
  listMedTrackUsers,
  medTrackCookieOptions,
  parseMedTrackSessionValue,
} from "../../lib/medtrack/auth";
import { ensureMedTrackSchema, isMedTrackDbConfigured, resetMedTrackSchemaCache } from "../../lib/medtrack/db";
import {
  buildReport,
  completeSchedule,
  createPublicTicket,
  createSchedule,
  dashboardSummary,
  getEquipmentById,
  getEquipmentByPublicQrId,
  getHospital,
  getTicketById,
  listBranches,
  listEquipment,
  listSchedules,
  listServiceHistory,
  listStatusHistory,
  listTickets,
  recordService,
  regenerateEquipmentQr,
  registerEquipment,
  reportToCsv,
  seedDemoHospital,
  transferEquipment,
  updateEquipment,
  updateEquipmentStatus,
  updateTicket,
} from "../../lib/medtrack/store";
import { EQUIPMENT_STATUSES, EQUIPMENT_STATUS_LABELS, USER_ROLES } from "../../lib/medtrack/types";

type Vars = { medtrackUserId?: number; hospitalId?: number; role?: string };

const medtrack = new Hono<{ Variables: Vars }>();

function publicBaseUrl(c: { req: { url: string } }) {
  return (
    process.env.MEDTRACK_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(c.req.url).origin
  ).replace(/\/$/, "");
}

async function requireUser(c: {
  req: { raw: Request };
  get: (k: keyof Vars) => unknown;
  set: (k: keyof Vars, v: unknown) => void;
}) {
  if (!isMedTrackDbConfigured()) {
    return { error: { success: false, message: "MySQL is not configured" }, status: 503 as const };
  }
  await ensureMedTrackSchema();
  const session = parseMedTrackSessionValue(getCookie(c as never, MEDTRACK_COOKIE));
  if (!session) {
    return { error: { success: false, message: "Sign in required" }, status: 401 as const };
  }
  const user = await getMedTrackUserById(session.userId);
  if (!user || user.hospitalId !== session.hospitalId) {
    return { error: { success: false, message: "Session expired" }, status: 401 as const };
  }
  c.set("medtrackUserId", user.id);
  c.set("hospitalId", user.hospitalId);
  c.set("role", user.role);
  return { user };
}

function scopedBranchId(raw: string | undefined, userBranchId: number | null, role: string) {
  if (raw) {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  if (role === "engineer" || role === "technician") return userBranchId;
  return null;
}

medtrack.get("/health", async (c) => {
  const configured = isMedTrackDbConfigured();
  if (configured) {
    resetMedTrackSchemaCache();
    await ensureMedTrackSchema().catch(() => undefined);
  }
  return c.json({ ok: true, service: "medtrack", mysql: configured, schema: 2 });
});

medtrack.post("/seed", async (c) => {
  if (!isMedTrackDbConfigured()) {
    return c.json({ success: false, message: "MySQL is not configured" }, 503);
  }
  resetMedTrackSchemaCache();
  await ensureMedTrackSchema();
  const result = await seedDemoHospital({ forceReseedExtras: true });
  return c.json({ success: true, data: result });
});

medtrack.post("/auth/login", async (c) => {
  if (!isMedTrackDbConfigured()) {
    return c.json({ success: false, message: "MySQL is not configured" }, 503);
  }
  const body = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Email and password required" }, 400);
  const user = await authenticateMedTrackUser(body.data.email, body.data.password);
  if (!user) return c.json({ success: false, message: "Invalid credentials" }, 401);
  setCookie(
    c,
    MEDTRACK_COOKIE,
    createMedTrackSessionValue(user.id, user.hospitalId, user.role),
    medTrackCookieOptions(),
  );
  const hospital = await getHospital(user.hospitalId);
  return c.json({ success: true, data: { user, hospital } });
});

medtrack.post("/auth/logout", (c) => {
  deleteCookie(c, MEDTRACK_COOKIE, { path: "/" });
  return c.json({ success: true });
});

medtrack.get("/auth/me", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const hospital = await getHospital(auth.user!.hospitalId);
  const branches = await listBranches(auth.user!.hospitalId);
  return c.json({ success: true, data: { user: auth.user, hospital, branches } });
});

medtrack.get("/users", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const roleFilter = c.req.query("role");
  const roles = roleFilter && USER_ROLES.includes(roleFilter as never)
    ? [roleFilter as (typeof USER_ROLES)[number]]
    : (["admin", "engineer", "technician", "supervisor"] as const);
  const data = await listMedTrackUsers(auth.user!.hospitalId, [...roles]);
  return c.json({ success: true, data });
});

medtrack.get("/public/:publicQrId", async (c) => {
  if (!isMedTrackDbConfigured()) {
    return c.json({ success: false, message: "MySQL is not configured" }, 503);
  }
  const equipment = await getEquipmentByPublicQrId(c.req.param("publicQrId"));
  if (!equipment) return c.json({ success: false, message: "Equipment not found" }, 404);
  const history = await listServiceHistory(equipment.id, equipment.hospitalId, 40);
  const statusHistory = await listStatusHistory(equipment.id, equipment.hospitalId, 20);
  return c.json({
    success: true,
    data: {
      equipment: {
        ...equipment,
        statusLabel: EQUIPMENT_STATUS_LABELS[equipment.status],
      },
      history,
      statusHistory,
      distinctions: {
        fault:
          "A fault is a safety or functional problem. Equipment is marked Out of Service until an engineer returns it to service.",
        maintenance:
          "A maintenance request covers scheduled or preventive work. Maintenance Due does not automatically mean the device is unsafe.",
      },
    },
  });
});

medtrack.get("/public/:publicQrId/qr.png", async (c) => {
  const publicQrId = c.req.param("publicQrId");
  const equipment = await getEquipmentByPublicQrId(publicQrId);
  if (!equipment) return c.json({ success: false, message: "Equipment not found" }, 404);
  const url = `${publicBaseUrl(c)}/q/${equipment.publicQrId}`;
  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 1,
    color: { dark: "#0f766e", light: "#ffffff" },
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

medtrack.post("/public/:publicQrId/tickets", async (c) => {
  const body = z
    .object({
      type: z.enum(["fault", "maintenance_request"]),
      reporterName: z.string().max(191).optional(),
      reporterContact: z.string().max(191).optional(),
      reporterNote: z.string().min(3).max(4000),
      priority: z.enum(["low", "normal", "high", "critical"]).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) {
    return c.json({ success: false, message: "A short description is required" }, 400);
  }
  const created = await createPublicTicket({
    publicQrId: c.req.param("publicQrId"),
    ...body.data,
  });
  if (!created?.ticket) return c.json({ success: false, message: "Equipment not found" }, 404);
  return c.json({ success: true, data: created });
});

medtrack.get("/dashboard", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const branchId = scopedBranchId(
    c.req.query("branchId"),
    auth.user!.branchId,
    auth.user!.role,
  );
  const summary = await dashboardSummary(auth.user!.hospitalId, branchId);
  const tickets = await listTickets({
    hospitalId: auth.user!.hospitalId,
    status: "openish",
    branchId,
  });
  const schedules = await listSchedules({
    hospitalId: auth.user!.hospitalId,
    branchId,
    dueOnly: true,
  });
  return c.json({
    success: true,
    data: {
      summary,
      openTickets: tickets.slice(0, 12),
      dueSchedules: schedules.slice(0, 8),
      branchId,
    },
  });
});

medtrack.get("/branches", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  return c.json({ success: true, data: await listBranches(auth.user!.hospitalId) });
});

medtrack.get("/equipment", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const status = c.req.query("status");
  const branchId = scopedBranchId(
    c.req.query("branchId"),
    auth.user!.branchId,
    auth.user!.role,
  );
  const data = await listEquipment({
    hospitalId: auth.user!.hospitalId,
    status: EQUIPMENT_STATUSES.includes(status as never) ? (status as never) : null,
    branchId,
    department: c.req.query("department") || null,
    q: c.req.query("q") || undefined,
  });
  return c.json({ success: true, data });
});

medtrack.get("/equipment/:id", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const equipment = await getEquipmentById(Number(c.req.param("id")), auth.user!.hospitalId);
  if (!equipment) return c.json({ success: false, message: "Not found" }, 404);
  const history = await listServiceHistory(equipment.id, auth.user!.hospitalId);
  const statusHistory = await listStatusHistory(equipment.id, auth.user!.hospitalId);
  const tickets = await listTickets({ hospitalId: auth.user!.hospitalId });
  const schedules = await listSchedules({
    hospitalId: auth.user!.hospitalId,
    equipmentId: equipment.id,
  });
  return c.json({
    success: true,
    data: {
      equipment,
      history,
      statusHistory,
      schedules,
      tickets: tickets.filter((t) => t.equipmentId === equipment.id),
      publicUrl: `${publicBaseUrl(c)}/q/${equipment.publicQrId}`,
      qrImageUrl: `/api/medtrack/public/${equipment.publicQrId}/qr.png`,
      permissions: {
        canRecordService: canRecordService(auth.user!.role),
        canReturnToService: canClearFaults(auth.user!.role),
        canManageInventory: canManageInventory(auth.user!.role),
      },
    },
  });
});

medtrack.post("/equipment", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canManageInventory(auth.user!.role)) {
    return c.json({ success: false, message: "Engineers, supervisors, or admins only" }, 403);
  }
  const body = z
    .object({
      branchId: z.number().int().positive(),
      assetTag: z.string().min(1).max(96),
      name: z.string().min(1).max(191),
      manufacturer: z.string().max(191).optional(),
      model: z.string().max(191).optional(),
      serialNumber: z.string().max(191).optional(),
      department: z.string().max(191).optional(),
      location: z.string().max(191).optional(),
      status: z.enum(EQUIPMENT_STATUSES).optional(),
      nextServiceDue: z.string().optional().nullable(),
      notes: z.string().max(4000).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Invalid equipment payload" }, 400);
  try {
    const equipment = await registerEquipment({
      ...body.data,
      hospitalId: auth.user!.hospitalId,
      performedByUserId: auth.user!.id,
      performedByName: auth.user!.name,
    });
    return c.json({ success: true, data: equipment }, 201);
  } catch (err) {
    return c.json(
      { success: false, message: err instanceof Error ? err.message : "Could not register" },
      400,
    );
  }
});

medtrack.patch("/equipment/:id", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canManageInventory(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to edit equipment" }, 403);
  }
  const body = z
    .object({
      assetTag: z.string().min(1).max(96).optional(),
      name: z.string().min(1).max(191).optional(),
      manufacturer: z.string().max(191).optional(),
      model: z.string().max(191).optional(),
      serialNumber: z.string().max(191).optional(),
      department: z.string().max(191).optional(),
      location: z.string().max(191).optional(),
      nextServiceDue: z.string().optional().nullable(),
      notes: z.string().max(4000).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Invalid update payload" }, 400);
  const equipment = await updateEquipment({
    equipmentId: Number(c.req.param("id")),
    hospitalId: auth.user!.hospitalId,
    ...body.data,
    performedByUserId: auth.user!.id,
    performedByName: auth.user!.name,
  });
  if (!equipment) return c.json({ success: false, message: "Not found" }, 404);
  return c.json({ success: true, data: equipment });
});

medtrack.post("/equipment/:id/transfer", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canManageInventory(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to transfer equipment" }, 403);
  }
  const body = z
    .object({
      branchId: z.number().int().positive(),
      department: z.string().max(191).optional(),
      location: z.string().max(191).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Branch required" }, 400);
  try {
    const equipment = await transferEquipment({
      equipmentId: Number(c.req.param("id")),
      hospitalId: auth.user!.hospitalId,
      ...body.data,
      performedByUserId: auth.user!.id,
      performedByName: auth.user!.name,
    });
    if (!equipment) return c.json({ success: false, message: "Not found" }, 404);
    return c.json({ success: true, data: equipment });
  } catch (err) {
    return c.json(
      { success: false, message: err instanceof Error ? err.message : "Transfer failed" },
      400,
    );
  }
});

medtrack.post("/equipment/:id/regenerate-qr", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canManageInventory(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to regenerate QR" }, 403);
  }
  const equipment = await regenerateEquipmentQr({
    equipmentId: Number(c.req.param("id")),
    hospitalId: auth.user!.hospitalId,
    performedByUserId: auth.user!.id,
    performedByName: auth.user!.name,
  });
  if (!equipment) return c.json({ success: false, message: "Not found" }, 404);
  return c.json({
    success: true,
    data: {
      equipment,
      publicUrl: `${publicBaseUrl(c)}/q/${equipment.publicQrId}`,
      qrImageUrl: `/api/medtrack/public/${equipment.publicQrId}/qr.png`,
    },
  });
});

medtrack.post("/equipment/:id/service", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canRecordService(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to record service" }, 403);
  }
  const body = z
    .object({
      summary: z.string().min(2).max(255),
      details: z.string().max(4000).optional(),
      partsUsed: z.string().max(4000).optional(),
      testsPerformed: z.string().max(4000).optional(),
      nextServiceDue: z.string().optional().nullable(),
      returnToService: z.boolean().optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Service summary required" }, 400);
  try {
    const equipment = await recordService({
      equipmentId: Number(c.req.param("id")),
      hospitalId: auth.user!.hospitalId,
      summary: body.data.summary,
      details: body.data.details,
      partsUsed: body.data.partsUsed,
      testsPerformed: body.data.testsPerformed,
      nextServiceDue: body.data.nextServiceDue,
      returnToService: body.data.returnToService,
      performedByUserId: auth.user!.id,
      performedByName: auth.user!.name,
      canReturnToService: canClearFaults(auth.user!.role),
    });
    if (!equipment) return c.json({ success: false, message: "Not found" }, 404);
    return c.json({ success: true, data: equipment });
  } catch (err) {
    return c.json(
      { success: false, message: err instanceof Error ? err.message : "Service failed" },
      403,
    );
  }
});

medtrack.post("/equipment/:id/status", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canClearFaults(auth.user!.role)) {
    return c.json({ success: false, message: "Only engineers/supervisors can change status" }, 403);
  }
  const body = z
    .object({
      status: z.enum(EQUIPMENT_STATUSES),
      summary: z.string().min(2).max(255),
      details: z.string().max(4000).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Invalid status change" }, 400);
  if (body.data.status === "operational" && !canClearFaults(auth.user!.role)) {
    return c.json({ success: false, message: "Only engineers can return equipment to service" }, 403);
  }
  const equipment = await updateEquipmentStatus({
    equipmentId: Number(c.req.param("id")),
    hospitalId: auth.user!.hospitalId,
    status: body.data.status,
    summary: body.data.summary,
    details: body.data.details,
    performedByUserId: auth.user!.id,
    performedByName: auth.user!.name,
  });
  if (!equipment) return c.json({ success: false, message: "Not found" }, 404);
  return c.json({ success: true, data: equipment });
});

medtrack.get("/tickets", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const status = c.req.query("status");
  const type = c.req.query("type");
  const branchId = scopedBranchId(
    c.req.query("branchId"),
    auth.user!.branchId,
    auth.user!.role,
  );
  const data = await listTickets({
    hospitalId: auth.user!.hospitalId,
    status: (status as never) || "openish",
    type: type === "fault" || type === "maintenance_request" ? type : null,
    branchId,
    assignedToUserId: c.req.query("assignedToUserId")
      ? Number(c.req.query("assignedToUserId"))
      : null,
    priority: (["low", "normal", "high", "critical"] as const).includes(
      c.req.query("priority") as never,
    )
      ? (c.req.query("priority") as never)
      : null,
  });
  return c.json({ success: true, data });
});

medtrack.get("/tickets/:id", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const ticket = await getTicketById(Number(c.req.param("id")), auth.user!.hospitalId);
  if (!ticket) return c.json({ success: false, message: "Not found" }, 404);
  return c.json({ success: true, data: ticket });
});

medtrack.patch("/tickets/:id", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canAssignTickets(auth.user!.role) && !canRecordService(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to update tickets" }, 403);
  }
  const body = z
    .object({
      status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
      assignedToUserId: z.number().int().positive().nullable().optional(),
      priority: z.enum(["low", "normal", "high", "critical"]).optional(),
      engineerNotes: z.string().max(4000).optional(),
      markFirstResponse: z.boolean().optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Invalid ticket update" }, 400);

  const payload = { ...body.data };
  if (payload.assignedToUserId === undefined && body.data.status === "in_progress") {
    payload.assignedToUserId = auth.user!.id;
  }
  if (payload.assignedToUserId !== undefined && !canAssignTickets(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to assign tickets" }, 403);
  }

  try {
    const ticket = await updateTicket({
      ticketId: Number(c.req.param("id")),
      hospitalId: auth.user!.hospitalId,
      ...payload,
      markFirstResponse: payload.markFirstResponse ?? payload.status === "in_progress",
    });
    if (!ticket) return c.json({ success: false, message: "Not found" }, 404);
    return c.json({ success: true, data: ticket });
  } catch (err) {
    return c.json(
      { success: false, message: err instanceof Error ? err.message : "Update failed" },
      400,
    );
  }
});

medtrack.get("/schedules", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const branchId = scopedBranchId(
    c.req.query("branchId"),
    auth.user!.branchId,
    auth.user!.role,
  );
  const data = await listSchedules({
    hospitalId: auth.user!.hospitalId,
    branchId,
    equipmentId: c.req.query("equipmentId") ? Number(c.req.query("equipmentId")) : null,
    dueOnly: c.req.query("dueOnly") === "1",
  });
  return c.json({ success: true, data });
});

medtrack.post("/schedules", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canManageSchedules(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to manage schedules" }, 403);
  }
  const body = z
    .object({
      equipmentId: z.number().int().positive(),
      title: z.string().min(2).max(191),
      intervalDays: z.number().int().positive().max(3650),
      nextDueDate: z.string().min(8).max(32),
      notes: z.string().max(4000).optional(),
    })
    .safeParse(await c.req.json().catch(() => null));
  if (!body.success) return c.json({ success: false, message: "Invalid schedule payload" }, 400);
  const schedule = await createSchedule({
    hospitalId: auth.user!.hospitalId,
    ...body.data,
    performedByUserId: auth.user!.id,
    performedByName: auth.user!.name,
  });
  if (!schedule) return c.json({ success: false, message: "Equipment not found" }, 404);
  return c.json({ success: true, data: schedule }, 201);
});

medtrack.post("/schedules/:id/complete", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  if (!canRecordService(auth.user!.role)) {
    return c.json({ success: false, message: "Not allowed to complete schedules" }, 403);
  }
  const body = z
    .object({ summary: z.string().max(255).optional() })
    .safeParse(await c.req.json().catch(() => ({})));
  const schedule = await completeSchedule({
    scheduleId: Number(c.req.param("id")),
    hospitalId: auth.user!.hospitalId,
    summary: body.success ? body.data.summary : undefined,
    performedByUserId: auth.user!.id,
    performedByName: auth.user!.name,
  });
  if (!schedule) return c.json({ success: false, message: "Not found" }, 404);
  return c.json({ success: true, data: schedule });
});

medtrack.get("/reports", async (c) => {
  const auth = await requireUser(c);
  if ("error" in auth && auth.error) return c.json(auth.error, auth.status);
  const period = c.req.query("period") === "monthly" ? "monthly" : "weekly";
  const branchId = scopedBranchId(
    c.req.query("branchId"),
    auth.user!.branchId,
    auth.user!.role,
  );
  const report = await buildReport({
    hospitalId: auth.user!.hospitalId,
    period,
    branchId,
  });
  if (c.req.query("format") === "csv") {
    const csv = reportToCsv(report);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="medtrack-${period}-report.csv"`,
      },
    });
  }
  return c.json({ success: true, data: report });
});

export default medtrack;
