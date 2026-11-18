import { inquiryMailKind, sendSiteMail } from "@/lib/platform/inquiry-mail"
import { accordApiPath } from "@/lib/platform/backend-url"

function text(value: unknown, max: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const name = text(body.name, 120)
  const phone = text(body.phone, 40)
  const email = text(body.email, 160)
  const kind = text(body.kind, 40) || "contact"
  if (kind === "quote") {
    if (!name || !email || !text(body.location, 160)) {
      return Response.json({ success: false, message: "Name, location, and email are required" }, { status: 400 })
    }
  } else if (!name || !phone) {
    return Response.json({ success: false, message: "Name and phone are required" }, { status: 400 })
  }
  const organisation = text(body.organisation, 160)
  const role = text(body.role, 120)
  const location = text(body.location, 160)
  const notes = text(body.notes, 2000)
  const reference = text(body.reference, 40)
  const products = text(body.products, 500)
  const subject = text(body.subject, 120)
  const service = text(body.service, 160)
  const deliveryDate = text(body.deliveryDate, 40)

  const mailKind = inquiryMailKind(kind, subject)
  const label =
    mailKind === "jobs"
      ? "Job application"
      : kind === "quote"
        ? "Quote request"
        : kind === "service"
          ? "Service request"
          : "Website enquiry"
  const mail = {
    kind: mailKind,
    subject: kind === "quote" ? `RFQ FROM "${name}" FROM WEBSITE` : reference ? `${label} ${reference}` : label,
    replyTo: email || undefined,
    text: kind === "quote"
      ? [
          `Name: ${name}`,
          `Location: ${location}`,
          `Email: ${email}`,
          products ? `Products: ${products}` : "Products: none listed",
        ].join("\n")
      : [
          label,
          reference ? `Reference: ${reference}` : "",
          `Name: ${name}`,
          organisation ? `Organisation: ${organisation}` : "",
          role ? `Role: ${role}` : "",
          `Phone: ${phone}`,
          email ? `Email: ${email}` : "",
          location ? `Location: ${location}` : "",
          subject ? `Subject: ${subject}` : "",
          service ? `Service: ${service}` : "",
          deliveryDate ? `Preferred delivery: ${deliveryDate}` : "",
          products ? `Products: ${products}` : "",
          "",
          notes || "No notes.",
        ].filter((line, index, lines) => line !== "" || (index > 0 && lines[index - 1] !== "")).join("\n"),
  }
  const mailed = await sendSiteMail(mail)
  const payload = {
    kind,
    name,
    organisation,
    role,
    email,
    phone,
    location,
    notes,
    reference,
    products,
    subject,
    service,
    deliveryDate,
  }
  if (!mailed.sent) {
    const forwarded = await fetch(accordApiPath("/api/enquiries"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, sendMail: true }),
      cache: "no-store",
    }).catch(() => null)
    if (forwarded?.ok) return Response.json({ success: true })
    return Response.json({
      success: false,
      message: mailed.reason === "smtp_unset" ? "Email is not set up yet." : "Could not send the enquiry email.",
    }, { status: mailed.reason === "smtp_unset" ? 503 : 502 })
  }

  await fetch(accordApiPath("/api/enquiries"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  }).catch(() => undefined)

  return Response.json({ success: true })
}
