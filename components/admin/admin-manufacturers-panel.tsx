'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ManufacturerSubmission } from '@/lib/platform/content'

function formatWhen(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function Detail({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'is-wide' : undefined}>
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
    </div>
  )
}

function matchesSearch(item: ManufacturerSubmission, query: string) {
  if (!query) return true
  return [
    item.companyName,
    item.contactName,
    item.email,
    item.phone,
    item.website,
    item.productsOfInterest,
    item.notes,
    item.status,
    item.token,
  ].join(' ').toLowerCase().includes(query)
}

export function AdminManufacturersPanel({ items }: { items: ManufacturerSubmission[] }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [note, setNote] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ companyName: '', contactName: '', phone: '', email: '', productsOfInterest: '' })
  const [logoName, setLogoName] = useState('')
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => matchesSearch(item, query))
  }, [items, search])

  const selected = filtered.find((item) => item._id === selectedId) || items.find((item) => item._id === selectedId) || null

  async function setStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    const data = new FormData()
    data.set('id', id)
    data.set('status', status)
    data.set('adminNote', note[id] || '')
    const response = await fetch('/api/admin/manufacturers', { method: 'PATCH', body: data })
    const payload = await response.json()
    if (!response.ok) {
      setMessage(payload.message || 'Could not update')
      return
    }
    setMessage(`Marked ${status}.`)
    router.refresh()
  }

  async function uploadLogo(item: ManufacturerSubmission, file: File) {
    setBusy(true)
    setMessage('')
    const data = new FormData()
    data.set('companyName', item.companyName)
    data.set('logo', file)
    const catalogueName = item._id.startsWith('catalogue:')
    const response = await fetch(
      catalogueName ? '/api/admin/manufacturers' : `/api/admin/manufacturers/${encodeURIComponent(item._id)}/logo`,
      { method: 'POST', body: data },
    )
    const payload = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setMessage(payload.message || 'Could not save the logo')
      return
    }
    setMessage(`Logo saved for ${item.companyName}.`)
    router.refresh()
  }

  async function addManufacturer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formEl = event.currentTarget
    if (!draft.companyName.trim()) {
      setMessage('Enter the manufacturer name')
      return
    }
    setBusy(true)
    setMessage('')
    const form = new FormData(formEl)
    if (!(form.get('logo') instanceof File) || (form.get('logo') as File).size === 0) {
      setBusy(false)
      setMessage('Choose a logo image')
      return
    }
    const response = await fetch('/api/admin/manufacturers', { method: 'POST', body: form })
    const payload = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setMessage(payload.message || 'Could not add the manufacturer')
      return
    }
    setDraft({ companyName: '', contactName: '', phone: '', email: '', productsOfInterest: '' })
    setLogoName('')
    formEl.reset()
    setMessage('Manufacturer added.')
    router.refresh()
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">Microvision Enterprises Ltd</span>
          <h1>Manufacturers</h1>
        </div>
        <input
          className="filter-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search manufacturers or products"
          aria-label="Search manufacturers or products"
        />
      </header>
      {message && <p className="admin-message">{message}</p>}
      <form className="admin-editor" onSubmit={addManufacturer}>
        <label>
          Manufacturer
          <input name="companyName" value={draft.companyName} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} placeholder="Company name" required />
        </label>
        <label>
          Logo
          <input name="logo" type="file" accept="image/*" onChange={(event) => setLogoName(event.target.files?.[0]?.name || '')} required />
          {logoName ? <span className="text-muted-foreground">{logoName}</span> : null}
        </label>
        <label>
          Contact <span className="text-muted-foreground">(optional)</span>
          <input name="contactName" value={draft.contactName} onChange={(event) => setDraft({ ...draft, contactName: event.target.value })} placeholder="Optional" />
        </label>
        <label>
          Phone <span className="text-muted-foreground">(optional)</span>
          <input name="phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="Optional" />
        </label>
        <label>
          Email <span className="text-muted-foreground">(optional)</span>
          <input name="email" type="text" inputMode="email" autoComplete="off" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="Optional" />
        </label>
        <label>
          Products supplied <span className="text-muted-foreground">(optional)</span>
          <input name="productsOfInterest" value={draft.productsOfInterest} onChange={(event) => setDraft({ ...draft, productsOfInterest: event.target.value })} placeholder="Optional" />
        </label>
        <button className="button button-primary button-compact" disabled={busy} type="submit">Add manufacturer</button>
      </form>
      <div className="admin-card">
        <div className="card-title">
          <div>
            <h3>Manufacturers</h3>
            <span>The brands page list. Add a logo where one is missing.</span>
          </div>
        </div>
        {items.length === 0 && <p className="text-muted-foreground">No manufacturers yet.</p>}
        {items.length > 0 && filtered.length === 0 && <p className="text-muted-foreground">No manufacturers match that search.</p>}
        {filtered.length > 0 && (
          <div className="admin-mfr-table">
            <div className="admin-mfr-head">
              <span>Manufacturer</span>
              <span>Products supplied</span>
              <span>Status</span>
              <span>Logo</span>
            </div>
            {filtered.map((item) => (
              <div
                key={item._id}
                className={`admin-mfr-row${selectedId === item._id ? ' is-open' : ''}`}
              >
                <button
                  type="button"
                  className="admin-mfr-name"
                  onClick={() => setSelectedId((current) => current === item._id ? null : item._id)}
                >
                  {item.logo?.secureUrl ? <img src={item.logo.secureUrl} alt="" className="h-8 w-8 object-contain" /> : null}
                  <b>{item.companyName}</b>
                </button>
                <span className="admin-mfr-products">{item.productsOfInterest || 'No products listed'}</span>
                <span className="admin-mfr-status">{item._id.startsWith('catalogue:') ? 'No logo' : item.status}</span>
                {item.logo?.secureUrl ? (
                  <span className="admin-mfr-status">Added</span>
                ) : (
                  <label className="button button-outline button-compact admin-mfr-logo">
                    Add logo
                    <input
                      type="file"
                      accept="image/*"
                      disabled={busy}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ''
                        if (file) void uploadLogo(item, file)
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <article className="admin-card admin-editor">
          <div className="card-title">
            <div>
              <h3>{selected.companyName}</h3>
              <span>{selected.contactName} · {selected.status}</span>
            </div>
            <button type="button" className="button button-outline button-compact" onClick={() => setSelectedId(null)}>Close</button>
          </div>
          <dl className="admin-submission-grid">
            <Detail label="Company">{selected.companyName}</Detail>
            <Detail label="Contact">{selected.contactName}</Detail>
            <Detail label="Email">
              {selected.email ? <a className="text-link" href={`mailto:${selected.email}`}>{selected.email}</a> : '—'}
            </Detail>
            <Detail label="Phone">
              {selected.phone ? <a className="text-link" href={`tel:${selected.phone}`}>{selected.phone}</a> : '—'}
            </Detail>
            <Detail label="Website">
              {selected.website ? <a className="text-link" href={selected.website} target="_blank" rel="noopener noreferrer">{selected.website}</a> : '—'}
            </Detail>
            <Detail label="Status">{selected.status}</Detail>
            <Detail label="Submitted">{formatWhen(selected.createdAt)}</Detail>
            <Detail label="Reference token"><code>{selected.token || '—'}</code></Detail>
            <Detail label="Products supplied" wide>{selected.productsOfInterest || '—'}</Detail>
            <Detail label="Notes" wide>{selected.notes || '—'}</Detail>
            <Detail label="Logo" wide>
              {selected.logo?.secureUrl ? <img src={selected.logo.secureUrl} alt="" className="h-16 w-16 object-contain" /> : '—'}
            </Detail>
            <Detail label="Brochure" wide>
              {selected.brochure?.secureUrl ? (
                <a className="text-link" href={selected.brochure.secureUrl} target="_blank" rel="noopener noreferrer">Download brochure PDF</a>
              ) : '—'}
            </Detail>
          </dl>
          <label>Admin note
            <textarea rows={2} value={note[selected._id] ?? selected.adminNote} onChange={(event) => setNote((current) => ({ ...current, [selected._id]: event.target.value }))} />
          </label>
          <form
            className="admin-editor"
            onSubmit={(event) => {
              event.preventDefault()
              const formEl = event.currentTarget
              const file = new FormData(formEl).get('logo')
              if (!(file instanceof File) || file.size === 0) {
                setMessage('Choose a logo image')
                return
              }
              formEl.reset()
              void uploadLogo(selected, file)
            }}
          >
            <label>
              {selected.logo?.secureUrl ? 'Replace logo' : 'Logo'}
              <input name="logo" type="file" accept="image/*" />
            </label>
            <button className="button button-outline button-compact" disabled={busy} type="submit">Save logo</button>
          </form>
          {selected._id.startsWith('catalogue:') ? null : (
            <div className="admin-job-actions">
              <button type="button" className="button button-primary button-compact" onClick={() => setStatus(selected._id, 'approved')}>Approve</button>
              <button type="button" className="button button-outline button-compact" onClick={() => setStatus(selected._id, 'rejected')}>Reject</button>
            </div>
          )}
        </article>
      )}
    </>
  )
}
