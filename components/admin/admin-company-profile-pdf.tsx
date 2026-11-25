'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminCompanyProfilePdf({
  filename,
}: {
  filename?: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const file = form.querySelector<HTMLInputElement>('input[name="file"]')?.files?.[0]
    if (!file) {
      setMessage('Choose a PDF company profile')
      return
    }
    const data = new FormData()
    data.set('file', file)
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/admin/company-profile/pdf', { method: 'POST', body: data })
    const payload = await response.json().catch(() => ({ message: 'Could not save that PDF' }))
    setSaving(false)
    if (!response.ok) {
      setMessage(payload.message || 'Could not save that PDF')
      return
    }
    form.reset()
    setMessage('Company profile PDF saved. Visitors can download it from About.')
    router.refresh()
  }

  return (
    <form className="admin-card" onSubmit={onSubmit}>
      <div className="card-title">
        <div>
          <h3>Company profile PDF</h3>
          <span>This file is offered as a download on the About page. It is not shown as pages on the site. Files up to 45MB are accepted.</span>
        </div>
      </div>
      {filename ? (
        <p>
          Current file: {filename}{' '}
          <a className="text-link" href="/api/company-profile/download" download={filename}>Download</a>
        </p>
      ) : (
        <p>No company profile PDF is published yet.</p>
      )}
      <label>Company profile PDF
        <input name="file" type="file" accept="application/pdf,.pdf" required />
      </label>
      {message && <p className="admin-message">{message}</p>}
      <div className="admin-job-actions">
        <button className="button button-primary" disabled={saving}>
          {saving ? 'Saving PDF…' : filename ? 'Replace PDF' : 'Save PDF'}
        </button>
      </div>
    </form>
  )
}
