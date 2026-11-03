import nodemailer from "nodemailer";
import type { Equipment, Ticket } from "@/lib/medtrack/types";

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function transporter() {
  if (!smtpConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER || process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER || "",
            pass: process.env.SMTP_PASS || "",
          }
        : undefined,
  });
}

export type TicketEmailPayload = {
  to: string[];
  hospitalName: string;
  equipment: Equipment;
  ticket: Ticket;
  publicUrl: string;
};

function ticketSubject(payload: TicketEmailPayload) {
  const kind = payload.ticket.type === "fault" ? "Fault report" : "Maintenance request";
  return `[MedTrack] ${kind}: ${payload.equipment.name} (${payload.equipment.assetTag})`;
}

function ticketBody(payload: TicketEmailPayload) {
  const kind = payload.ticket.type === "fault" ? "Fault report" : "Maintenance request";
  const safetyNote =
    payload.ticket.type === "fault"
      ? "This is a safety/fault report. Equipment should be treated as out of service until an engineer clears it."
      : "This is a scheduled maintenance request (not automatically a safety fault).";
  return [
    `${kind} for ${payload.hospitalName}`,
    "",
    `Equipment: ${payload.equipment.name}`,
    `Asset tag: ${payload.equipment.assetTag}`,
    `Status: ${payload.equipment.status}`,
    `Department: ${payload.equipment.department || "—"}`,
    `Location: ${payload.equipment.location || "—"}`,
    "",
    `Reporter: ${payload.ticket.reporterName || "Anonymous"}`,
    `Contact: ${payload.ticket.reporterContact || "—"}`,
    `Priority: ${payload.ticket.priority}`,
    "",
    safetyNote,
    "",
    "Details:",
    payload.ticket.reporterNote || "(no note)",
    "",
    `Public passport: ${payload.publicUrl}`,
    `Ticket #${payload.ticket.id}`,
  ].join("\n");
}

export async function sendTicketNotification(payload: TicketEmailPayload) {
  const recipients = payload.to.map((e) => e.trim()).filter(Boolean);
  if (!recipients.length) {
    console.warn("[MedTrack mail] No notification recipients configured");
    return { sent: false, reason: "no_recipients" as const };
  }

  const subject = ticketSubject(payload);
  const text = ticketBody(payload);
  const from = process.env.SMTP_FROM || "MedTrack QR <noreply@medtrack.local>";
  const transport = transporter();

  if (!transport) {
    console.info("[MedTrack mail] SMTP not configured — logging email instead");
    console.info({ to: recipients, from, subject, text });
    return { sent: false, reason: "smtp_unset_logged" as const };
  }

  await transport.sendMail({ from, to: recipients, subject, text });
  return { sent: true as const };
}
