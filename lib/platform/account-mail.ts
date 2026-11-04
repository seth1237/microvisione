import nodemailer from "nodemailer";

function smtpReady() {
  return Boolean(process.env.SMTP_HOST && (process.env.SMTP_USER || process.env.SMTP_PASS));
}

export async function sendLoginCodeEmail(to: string, code: string) {
  if (!smtpReady()) return { sent: false as const, reason: "smtp_unset" as const };
  const transport = nodemailer.createTransport({
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
  const from = process.env.SMTP_FROM || "Microvision Enterprises Ltd <info@microvisione.com>";
  await transport.sendMail({
    from,
    to,
    subject: "Your Microvision login code",
    text: [
      "Your Microvision Enterprises Ltd login code is " + code + ".",
      "",
      "It expires in 10 minutes.",
      "",
      "If you did not ask to sign in, you can ignore this email.",
    ].join("\n"),
  });
  return { sent: true as const };
}
