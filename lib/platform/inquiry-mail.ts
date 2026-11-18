import nodemailer from "nodemailer"

export const SALES_INBOX = "sales@microvisione.com"
export const INFO_INBOX = "info@microvisione.com"
export const WEB_MAILBOX = "web@microvisione.com"

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || WEB_MAILBOX
}

function salesInbox() {
  return (process.env.MAIL_SALES || SALES_INBOX).trim()
}

function infoInbox() {
  return (process.env.MAIL_INFO || INFO_INBOX).trim()
}

function transport() {
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE === "true" || port === 465
  const rejectUnauthorized = process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "true"
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: process.env.SMTP_REQUIRE_TLS !== "false" && !secure,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
    tls: { rejectUnauthorized },
  })
}

export type InquiryMailKind = "sales" | "jobs"

export async function sendSiteMail(input: {
  kind: InquiryMailKind
  subject: string
  text: string
  replyTo?: string
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>
}) {
  if (!smtpReady()) return { sent: false as const, reason: "smtp_unset" as const }
  const to = input.kind === "jobs" ? infoInbox() : salesInbox()
  const cc = infoInbox()
  try {
    await transport().sendMail({
      from: fromAddress(),
      to,
      cc,
      replyTo: input.replyTo || undefined,
      subject: input.subject,
      text: input.text,
      attachments: input.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      })),
    })
    return { sent: true as const }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "send_failed"
    console.error("[smtp]", code)
    return { sent: false as const, reason: "send_failed" as const }
  }
}

export function inquiryMailKind(kind: string, subject = ""): InquiryMailKind {
  if (kind === "career" || kind === "jobs" || /^careers$/i.test(subject.trim())) return "jobs"
  return "sales"
}
