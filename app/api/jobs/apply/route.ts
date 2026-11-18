import { sendSiteMail } from "@/lib/platform/inquiry-mail"
import { accordApiPath } from "@/lib/platform/backend-url"

export async function POST(request: Request) {
  const form = await request.formData()
  const fullName = String(form.get("fullName") || "").trim()
  const email = String(form.get("email") || "").trim()
  const phone = String(form.get("phone") || "").trim()
  const department = String(form.get("department") || "").trim()
  const workingTerms = String(form.get("workingTerms") || "").trim()
  const notes = String(form.get("notes") || "").trim()
  const jobTitle = String(form.get("jobTitle") || "").trim()
  const cv = form.get("cv")
  if (!fullName || !email || !phone) {
    return Response.json({ success: false, message: "Enter your name, email, and phone number" }, { status: 400 })
  }
  if (!(cv instanceof File) || cv.size === 0) {
    return Response.json({ success: false, message: "Upload your CV" }, { status: 400 })
  }

  const role = jobTitle || "Talent pool"
  const mailed = await sendSiteMail({
    kind: "jobs",
    subject: `Job application: ${role}`,
    replyTo: email,
    text: [
      "Job application from the website.",
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      department ? `Department: ${department}` : "",
      workingTerms ? `Working terms: ${workingTerms}` : "",
      jobTitle ? `Role: ${jobTitle}` : "Talent pool",
      "",
      notes || "No note.",
    ].filter(Boolean).join("\n"),
    attachments: [{
      filename: cv.name || "cv",
      content: Buffer.from(await cv.arrayBuffer()),
      contentType: cv.type || undefined,
    }],
  })
  if (!mailed.sent) {
    return Response.json({
      success: false,
      message: mailed.reason === "smtp_unset" ? "Email is not set up yet." : "Could not send the application email.",
    }, { status: mailed.reason === "smtp_unset" ? 503 : 502 })
  }

  const forwarded = new FormData()
  for (const [key, value] of form.entries()) forwarded.append(key, value)
  await fetch(accordApiPath("/api/jobs/apply"), {
    method: "POST",
    body: forwarded,
    cache: "no-store",
  }).catch(() => null)

  return Response.json({ success: true })
}
