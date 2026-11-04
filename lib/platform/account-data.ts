import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { sendLoginCodeEmail } from '@/lib/platform/account-mail'
import { normalizeKenyaPhone, type CheckoutOrder } from '@/lib/platform/checkout'
import type { AccountDocument, CustomerAccount, CustomerInterestProduct, CustomerPurchaseProduct } from '@/lib/platform/customers'
import {
  isMysqlConfigured,
  mysqlFileIdFromPublicId,
  mysqlBumpLoginCodeAttempt,
  mysqlCountRecentLoginCodes,
  mysqlCreateCustomer,
  mysqlDeleteAccountDocument,
  mysqlDeleteLoginCodes,
  mysqlEnsureCustomerByEmail,
  mysqlGetAccountDocument,
  mysqlGetCustomerById,
  mysqlGetCustomerByPhone,
  mysqlGetFile,
  mysqlInsertAccountDocument,
  mysqlLinkOrdersToCustomer,
  mysqlListAccountDocuments,
  mysqlListAllAccountDocuments,
  mysqlListClientInterestBoard,
  mysqlListCustomerInterest,
  mysqlListCustomerOrders,
  mysqlListCustomerPurchases,
  mysqlRecordCustomerInterest,
  mysqlReplaceLoginCode,
  mysqlSaveFile,
  mysqlTakeLoginCode,
  mysqlTouchCustomer,
} from '@/lib/platform/mysql'

function cleanName(value: unknown, label: string, min = 2) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length < min) throw new Error(`Enter ${label}`)
  return text.slice(0, 120)
}

export async function registerCustomer(input: {
  name: string
  facilityName: string
  phone: string
  location: string
}): Promise<CustomerAccount> {
  if (!isMysqlConfigured()) throw new Error('Accounts are not available right now')
  const phone = normalizeKenyaPhone(input.phone)
  if (!phone) throw new Error('Enter a valid Kenyan phone number')
  return mysqlCreateCustomer({
    name: cleanName(input.name, 'your name'),
    facilityName: cleanName(input.facilityName, 'the facility name'),
    phone,
    location: cleanName(input.location, 'location'),
  })
}

export async function loginCustomer(phoneValue: unknown): Promise<CustomerAccount> {
  if (!isMysqlConfigured()) throw new Error('Accounts are not available right now')
  const phone = normalizeKenyaPhone(phoneValue)
  if (!phone) throw new Error('Enter the phone number for this account')
  const customer = await mysqlGetCustomerByPhone(phone)
  if (!customer) throw new Error('No account uses that phone number. Create an account first.')
  await mysqlTouchCustomer(customer.id)
  await mysqlLinkOrdersToCustomer(customer.id, customer.phone)
  return customer
}

export async function getCustomerAccount(id: string) {
  if (!isMysqlConfigured()) return null
  const customer = await mysqlGetCustomerById(id)
  if (customer) await mysqlTouchCustomer(customer.id)
  return customer
}

export async function listAccountOrders(input: { customerId: string; phone: string }): Promise<CheckoutOrder[]> {
  if (!isMysqlConfigured()) return []
  return mysqlListCustomerOrders({ customerId: input.customerId, phone: input.phone })
}

export async function recordCustomerInterest(input: {
  customerId: string
  productId: string
  productName: string
  categoryId?: string
  categoryName?: string
  kind: 'click' | 'cart'
}) {
  if (!isMysqlConfigured()) return
  await mysqlRecordCustomerInterest(input)
}

export async function listAccountInterest(customerId: string): Promise<CustomerInterestProduct[]> {
  if (!isMysqlConfigured()) return []
  return mysqlListCustomerInterest(customerId)
}

export async function listAccountPurchases(input: { customerId: string; phone: string }): Promise<CustomerPurchaseProduct[]> {
  if (!isMysqlConfigured()) return []
  return mysqlListCustomerPurchases(input)
}

export async function listClientInterestBoard() {
  if (!isMysqlConfigured()) return []
  return mysqlListClientInterestBoard()
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CODE_TTL_MS = 10 * 60 * 1000

export function normalizeAccountEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase()
  if (!EMAIL_PATTERN.test(email) || email.length > 191) throw new Error('Enter a valid email address')
  return email
}

function loginCodeSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'microvision-dev-secret'
}

function hashLoginCode(email: string, code: string) {
  return createHash('sha256').update(`${loginCodeSecret()}:${email}:${code}`).digest('hex')
}

function hashesMatch(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function requestCustomerLoginCode(emailValue: unknown) {
  if (!isMysqlConfigured()) throw new Error('Accounts are not available right now')
  const email = normalizeAccountEmail(emailValue)
  const recent = await mysqlCountRecentLoginCodes(email, new Date(Date.now() - 60 * 60 * 1000))
  if (recent >= 5) throw new Error('Wait a few minutes before requesting another code.')
  const code = randomInt(0, 1000000).toString().padStart(6, '0')
  await mysqlReplaceLoginCode({
    email,
    codeHash: hashLoginCode(email, code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  })
  const mailed = await sendLoginCodeEmail(email, code).catch(() => ({ sent: false as const, reason: "send_failed" as const }))
  if (!mailed.sent) {
    await mysqlDeleteLoginCodes(email).catch(() => undefined)
    throw new Error(
      mailed.reason === "smtp_unset"
        ? "Login email is not set up yet. Add the SMTP settings, then try again."
        : "The login email could not be sent. Try again later.",
    )
  }
  return { email }
}

export async function verifyCustomerLoginCode(emailValue: unknown, codeValue: unknown): Promise<CustomerAccount> {
  if (!isMysqlConfigured()) throw new Error('Accounts are not available right now')
  const email = normalizeAccountEmail(emailValue)
  const code = String(codeValue || '').replace(/\s+/g, '')
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit code from the email.')
  const saved = await mysqlTakeLoginCode(email)
  if (!saved || saved.expiresAt.getTime() < Date.now()) {
    throw new Error('That code has expired. Request a new one.')
  }
  if (saved.attempts >= 5) throw new Error('That code is no longer valid. Request a new one.')
  if (!hashesMatch(saved.codeHash, hashLoginCode(email, code))) {
    await mysqlBumpLoginCodeAttempt(saved.id)
    throw new Error('That code is not correct.')
  }
  await mysqlDeleteLoginCodes(email)
  const customer = await mysqlEnsureCustomerByEmail(email)
  await mysqlTouchCustomer(customer.id)
  return customer
}

const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
])

export async function addAccountDocument(input: {
  email: string
  title: string
  filename: string
  mime: string
  buffer: Buffer
}) {
  if (!isMysqlConfigured()) throw new Error('Document storage is not available right now')
  const email = normalizeAccountEmail(input.email)
  const title = cleanName(input.title, 'a document title')
  const filename = String(input.filename || 'document').replace(/[/\\]/g, '').slice(0, 180)
  const mime = String(input.mime || '').toLowerCase()
  const extensionOk = /\.(pdf|docx?|jpe?g|png|webp)$/i.test(filename)
  if (!DOCUMENT_TYPES.has(mime) && !extensionOk) throw new Error('Upload a PDF, Word document, or image')
  if (!input.buffer.length || input.buffer.length > 15 * 1024 * 1024) throw new Error('Upload a file under 15MB')
  const customer = await mysqlEnsureCustomerByEmail(email)
  const saved = await mysqlSaveFile({
    kind: 'account-document',
    ownerKey: `account/${customer.id}`,
    filename,
    mime: mime || 'application/octet-stream',
    buffer: input.buffer,
  })
  const fileId = mysqlFileIdFromPublicId(saved.publicId)
  if (!fileId) throw new Error('Could not store the document')
  const id = await mysqlInsertAccountDocument({
    customerId: customer.id,
    title,
    filename,
    fileId,
  })
  return { id: String(id), title, filename, email, createdAt: new Date().toISOString() }
}

export async function listCustomerDocuments(customerId: string): Promise<AccountDocument[]> {
  if (!isMysqlConfigured()) return []
  return mysqlListAccountDocuments(customerId)
}

export async function listUploadedAccountDocuments(): Promise<AccountDocument[]> {
  if (!isMysqlConfigured()) return []
  return mysqlListAllAccountDocuments()
}

export async function removeUploadedAccountDocument(id: string) {
  if (!isMysqlConfigured()) throw new Error('Document storage is not available right now')
  const removed = await mysqlDeleteAccountDocument(id)
  if (!removed) throw new Error('Document not found')
  return removed
}

export async function readCustomerDocument(customerId: string, documentId: string) {
  if (!isMysqlConfigured()) return null
  const document = await mysqlGetAccountDocument(documentId)
  if (!document || document.customerId !== String(customerId)) return null
  const file = await mysqlGetFile(document.fileId)
  if (!file || file.kind !== 'account-document') return null
  return { filename: document.filename || file.filename, mime: file.mime, data: file.data }
}
