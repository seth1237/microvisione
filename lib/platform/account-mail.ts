import nodemailer from "nodemailer";

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || "";
}

function transport() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: process.env.SMTP_REQUIRE_TLS !== "false" && !secure,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });
}

async function deliver(input: { to: string[]; subject: string; text: string }) {
  const to = [...new Set(input.to.map((value) => value.trim().toLowerCase()).filter((value) => value.includes("@")))];
  if (!to.length || !smtpReady()) return { sent: false as const, reason: "smtp_unset" as const };
  try {
    await transport().sendMail({
      from: fromAddress(),
      to,
      subject: input.subject,
      text: input.text,
    });
    return { sent: true as const };
  } catch {
    return { sent: false as const, reason: "send_failed" as const };
  }
}

export function sendLoginCodeEmail(to: string, code: string) {
  return deliver({
    to: [to],
    subject: "Your Microvision login code",
    text: [
      "Your Microvision Enterprises Ltd login code is " + code + ".",
      "",
      "It expires in 10 minutes.",
      "",
      "If you did not ask to sign in, you can ignore this email.",
    ].join("\n"),
  });
}

export function sendPurchaseEmail(input: {
  to: string;
  reference: string;
  amount: number;
  receipt: string;
  items: string[];
}) {
  const shopCopy = process.env.SMTP_USER || "";
  return deliver({
    to: [input.to, shopCopy],
    subject: `M-Pesa payment received ${input.reference}`,
    text: [
      `Payment received for order ${input.reference}.`,
      `Amount: KES ${input.amount.toLocaleString("en-KE")}`,
      input.receipt ? `M-Pesa receipt: ${input.receipt}` : "",
      "",
      input.items.length ? input.items.join("\n") : "See the order in admin.",
    ].filter(Boolean).join("\n"),
  });
}
