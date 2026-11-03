import { setDefaultResultOrder } from "node:dns";
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { isMysqlConfigured } from "@/lib/platform/mysql";

setDefaultResultOrder("ipv4first");

const MT_SCHEMA_VERSION = 2;

type MtState = {
  pool: Pool | null;
  schemaReady: boolean;
  schemaVersion: number;
  schemaPromise: Promise<void> | null;
};

const globalForMt = globalThis as typeof globalThis & { __medtrackMysql?: MtState };

function mtState(): MtState {
  if (!globalForMt.__medtrackMysql) {
    globalForMt.__medtrackMysql = {
      pool: null,
      schemaReady: false,
      schemaVersion: 0,
      schemaPromise: null,
    };
  }
  return globalForMt.__medtrackMysql;
}

export function isMedTrackDbConfigured() {
  return isMysqlConfigured();
}

async function getPool(): Promise<Pool> {
  if (!isMysqlConfigured()) throw new Error("MySQL is not configured for MedTrack");
  const state = mtState();
  if (state.pool) return state.pool;
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 4,
    enableKeepAlive: true,
    charset: "utf8mb4",
    connectTimeout: 15_000,
  });
  state.pool = pool;
  return pool;
}

export async function mtQuery<T extends RowDataPacket[]>(sql: string, params: unknown[] = []) {
  await ensureMedTrackSchema();
  const pool = await getPool();
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

export async function mtExecute(sql: string, params: unknown[] = []) {
  await ensureMedTrackSchema();
  const pool = await getPool();
  const [result] = await pool.query<ResultSetHeader>(sql, params);
  return result;
}

async function columnExists(pool: Pool, table: string, column: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 1 AS ok
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
     LIMIT 1`,
    [table, column],
  );
  return rows.length > 0;
}

async function ensureColumn(
  pool: Pool,
  table: string,
  column: string,
  definition: string,
) {
  if (await columnExists(pool, table, column)) return;
  await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

async function applyMedTrackSchema() {
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_hospitals (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(191) NOT NULL,
      slug VARCHAR(191) NOT NULL,
      notification_emails TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_branches (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      hospital_id INT UNSIGNED NOT NULL,
      name VARCHAR(191) NOT NULL,
      code VARCHAR(64) NOT NULL,
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY hospital_code (hospital_id, code),
      KEY hospital_id (hospital_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      hospital_id INT UNSIGNED NOT NULL,
      branch_id INT UNSIGNED NULL,
      email VARCHAR(191) NOT NULL,
      name VARCHAR(191) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL,
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY email (email),
      KEY hospital_id (hospital_id),
      KEY hospital_role (hospital_id, role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_equipment (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      hospital_id INT UNSIGNED NOT NULL,
      branch_id INT UNSIGNED NOT NULL,
      public_qr_id VARCHAR(40) NOT NULL,
      asset_tag VARCHAR(96) NOT NULL,
      name VARCHAR(191) NOT NULL,
      manufacturer VARCHAR(191) NOT NULL DEFAULT '',
      model VARCHAR(191) NOT NULL DEFAULT '',
      serial_number VARCHAR(191) NOT NULL DEFAULT '',
      department VARCHAR(191) NOT NULL DEFAULT '',
      location VARCHAR(191) NOT NULL DEFAULT '',
      status VARCHAR(40) NOT NULL,
      last_service_at DATETIME NULL,
      next_service_due DATE NULL,
      notes TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY public_qr_id (public_qr_id),
      UNIQUE KEY hospital_asset (hospital_id, asset_tag),
      KEY hospital_status (hospital_id, status),
      KEY branch_id (branch_id),
      KEY hospital_branch (hospital_id, branch_id),
      KEY next_service_due (next_service_due)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_service_history (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      equipment_id INT UNSIGNED NOT NULL,
      hospital_id INT UNSIGNED NOT NULL,
      kind VARCHAR(40) NOT NULL,
      summary VARCHAR(255) NOT NULL,
      details TEXT NOT NULL,
      parts_used TEXT NOT NULL,
      tests_performed TEXT NOT NULL,
      performed_by_user_id INT UNSIGNED NULL,
      performed_by_name VARCHAR(191) NOT NULL DEFAULT '',
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      KEY equipment_created (equipment_id, created_at),
      KEY hospital_created (hospital_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await ensureColumn(pool, "mt_service_history", "parts_used", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(pool, "mt_service_history", "tests_performed", "TEXT NOT NULL DEFAULT ''");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_status_history (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      equipment_id INT UNSIGNED NOT NULL,
      hospital_id INT UNSIGNED NOT NULL,
      from_status VARCHAR(40) NULL,
      to_status VARCHAR(40) NOT NULL,
      summary VARCHAR(255) NOT NULL,
      performed_by_user_id INT UNSIGNED NULL,
      performed_by_name VARCHAR(191) NOT NULL DEFAULT '',
      created_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      KEY equipment_created (equipment_id, created_at),
      KEY hospital_created (hospital_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_tickets (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      hospital_id INT UNSIGNED NOT NULL,
      equipment_id INT UNSIGNED NOT NULL,
      branch_id INT UNSIGNED NOT NULL,
      type VARCHAR(40) NOT NULL,
      status VARCHAR(32) NOT NULL,
      reporter_name VARCHAR(191) NOT NULL DEFAULT '',
      reporter_contact VARCHAR(191) NOT NULL DEFAULT '',
      reporter_note TEXT NOT NULL,
      engineer_notes TEXT NOT NULL,
      priority VARCHAR(16) NOT NULL DEFAULT 'normal',
      assigned_to_user_id INT UNSIGNED NULL,
      opened_at DATETIME NOT NULL,
      first_response_at DATETIME NULL,
      resolved_at DATETIME NULL,
      downtime_started_at DATETIME NULL,
      downtime_ended_at DATETIME NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      KEY hospital_status (hospital_id, status),
      KEY hospital_branch_status (hospital_id, branch_id, status),
      KEY equipment_id (equipment_id),
      KEY opened_at (opened_at),
      KEY assigned_to (assigned_to_user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await ensureColumn(pool, "mt_tickets", "engineer_notes", "TEXT NOT NULL DEFAULT ''");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_maintenance_schedules (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      hospital_id INT UNSIGNED NOT NULL,
      equipment_id INT UNSIGNED NOT NULL,
      branch_id INT UNSIGNED NOT NULL,
      title VARCHAR(191) NOT NULL,
      interval_days INT UNSIGNED NOT NULL DEFAULT 90,
      next_due_date DATE NOT NULL,
      last_completed_at DATETIME NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      notes TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (id),
      KEY hospital_due (hospital_id, next_due_date),
      KEY equipment_id (equipment_id),
      KEY hospital_active (hospital_id, active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mt_meta (
      meta_key VARCHAR(64) NOT NULL,
      meta_value VARCHAR(255) NOT NULL,
      PRIMARY KEY (meta_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(
    `INSERT INTO mt_meta (meta_key, meta_value) VALUES ('schema_version', ?)
     ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value)`,
    [String(MT_SCHEMA_VERSION)],
  );
}

export async function ensureMedTrackSchema() {
  if (!isMysqlConfigured()) return;
  const state = mtState();
  if (state.schemaReady && state.schemaVersion === MT_SCHEMA_VERSION) return;
  if (!state.schemaPromise) {
    state.schemaPromise = applyMedTrackSchema()
      .then(() => {
        state.schemaReady = true;
        state.schemaVersion = MT_SCHEMA_VERSION;
      })
      .finally(() => {
        state.schemaPromise = null;
      });
  }
  await state.schemaPromise;
}

/** Force schema re-check (e.g. after process restart with new version). */
export function resetMedTrackSchemaCache() {
  const state = mtState();
  state.schemaReady = false;
  state.schemaVersion = 0;
}

export function isoDate(value?: Date | string | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function nowSql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export function dateOnly(value?: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}
