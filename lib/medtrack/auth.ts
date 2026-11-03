import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { MedTrackUser, UserRole } from "@/lib/medtrack/types";
import { USER_ROLES } from "@/lib/medtrack/types";
import { isoDate, mtExecute, mtQuery, nowSql } from "@/lib/medtrack/db";
import type { RowDataPacket } from "mysql2/promise";

const scryptAsync = promisify(scrypt);
export const MEDTRACK_COOKIE = "mt_session";
const SESSION_DAYS = 14;

function sessionSecret() {
  return (
    process.env.MEDTRACK_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "medtrack-dev-secret"
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  if (storedBuf.length !== derived.length) return false;
  return timingSafeEqual(storedBuf, derived);
}

function signValue(value: string) {
  const hmac = createHmac("sha256", sessionSecret()).update(value).digest("base64url");
  return `${value}.${hmac}`;
}

function verifySignedValue(token: string) {
  const split = token.lastIndexOf(".");
  if (split <= 0) return null;
  const value = token.slice(0, split);
  const sig = token.slice(split + 1);
  const expected = createHmac("sha256", sessionSecret()).update(value).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return value;
}

export function medTrackCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export function createMedTrackSessionValue(userId: number, hospitalId: number, role: UserRole) {
  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      hid: hospitalId,
      role,
      exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return signValue(payload);
}

export function parseMedTrackSessionValue(
  token: string | undefined | null,
): { userId: number; hospitalId: number; role: UserRole } | null {
  if (!token) return null;
  const payload = verifySignedValue(token);
  if (!payload) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      uid?: number;
      hid?: number;
      role?: UserRole;
      exp?: number;
    };
    if (!data.uid || !data.hid || !data.role || !data.exp || data.exp < Date.now()) return null;
    if (!USER_ROLES.includes(data.role)) return null;
    return { userId: data.uid, hospitalId: data.hid, role: data.role };
  } catch {
    return null;
  }
}

type UserRow = RowDataPacket & {
  id: number;
  hospital_id: number;
  branch_id: number | null;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
};

function mapUser(row: UserRow): MedTrackUser {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    branchId: row.branch_id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: isoDate(row.created_at) || "",
  };
}

export async function getMedTrackUserByEmail(email: string) {
  const rows = await mtQuery<UserRow[]>(
    `SELECT * FROM mt_users WHERE email = ? LIMIT 1`,
    [email.trim().toLowerCase()],
  );
  return rows[0] ? { ...mapUser(rows[0]), passwordHash: rows[0].password_hash } : null;
}

export async function getMedTrackUserById(id: number) {
  const rows = await mtQuery<UserRow[]>(`SELECT * FROM mt_users WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function listMedTrackUsers(hospitalId: number, roles?: UserRole[]) {
  const params: unknown[] = [hospitalId];
  let sql = `SELECT * FROM mt_users WHERE hospital_id = ?`;
  if (roles?.length) {
    sql += ` AND role IN (${roles.map(() => "?").join(",")})`;
    params.push(...roles);
  }
  sql += ` ORDER BY name ASC`;
  const rows = await mtQuery<UserRow[]>(sql, params);
  return rows.map(mapUser);
}

export async function authenticateMedTrackUser(email: string, password: string) {
  const user = await getMedTrackUserByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export async function createMedTrackUser(input: {
  hospitalId: number;
  branchId?: number | null;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}) {
  const result = await mtExecute(
    `INSERT INTO mt_users (hospital_id, branch_id, email, name, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.hospitalId,
      input.branchId ?? null,
      input.email.trim().toLowerCase(),
      input.name.trim(),
      await hashPassword(input.password),
      input.role,
      nowSql(),
    ],
  );
  return getMedTrackUserById(Number(result.insertId));
}

/** Return-to-service and fault-clearing gates */
export function canClearFaults(role: UserRole) {
  return role === "engineer" || role === "admin" || role === "supervisor";
}

export function canManageInventory(role: UserRole) {
  return role === "admin" || role === "engineer" || role === "supervisor";
}

export function canRecordService(role: UserRole) {
  return (
    role === "engineer" ||
    role === "admin" ||
    role === "supervisor" ||
    role === "technician"
  );
}

export function canAssignTickets(role: UserRole) {
  return role === "admin" || role === "supervisor" || role === "engineer";
}

export function canManageSchedules(role: UserRole) {
  return role === "admin" || role === "supervisor" || role === "engineer";
}

export function canViewReports(_role: UserRole) {
  return true;
}
