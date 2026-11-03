import { execFile, spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = path.join(os.homedir(), ".local", "share", "microvision-mysql");
const port = 3307;

function readEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const index = line.indexOf("=");
    env[line.slice(0, index)] = line.slice(index + 1);
  }
  return env;
}

function portOpen(targetPort) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port: targetPort }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(400, () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const env = {
  ...readEnv(path.join(repoRoot, ".env")),
  ...readEnv(path.join(repoRoot, ".env.local")),
};
const host = env.MYSQL_HOST || "";
const configuredPort = Number(env.MYSQL_PORT || 3306);
const localHost = host === "127.0.0.1" || host === "localhost";
if (!localHost || configuredPort !== port) process.exit(0);

fs.mkdirSync(dataDir, { recursive: true });
const socketUser = process.env.USER || process.env.LOGNAME || "ubuntu";
if (!fs.existsSync(path.join(dataDir, "mysql"))) {
  await execFileAsync("mariadb-install-db", [
    "--no-defaults",
    `--datadir=${dataDir}`,
    "--auth-root-authentication-method=normal",
    "--skip-test-db",
    `--user=${socketUser}`,
  ]);
}

function resolveMariadbd() {
  const localBin = path.join(os.homedir(), ".local", "lib", "microvision-mysql", "mariadbd");
  if (fs.existsSync(localBin)) return localBin;
  return "/usr/sbin/mariadbd";
}

if (!(await portOpen(port))) {
  const log = fs.openSync(path.join(dataDir, "server.log"), "a");
  const mariadbd = resolveMariadbd();
  const child = spawn(
    mariadbd,
    [
      "--no-defaults",
      `--user=${socketUser}`,
      `--datadir=${dataDir}`,
      "--bind-address=127.0.0.1",
      `--port=${port}`,
      `--socket=${path.join(dataDir, "mysql.sock")}`,
      `--pid-file=${path.join(dataDir, "mysql.pid")}`,
    ],
    { detached: true, stdio: ["ignore", log, log] },
  );
  child.unref();
  for (let attempt = 0; attempt < 50 && !(await portOpen(port)); attempt += 1) {
    await sleep(200);
  }
}

if (!(await portOpen(port))) {
  console.error(`Local MariaDB did not start on 127.0.0.1:${port}. See ${path.join(dataDir, "server.log")}`);
  process.exit(1);
}

const database = env.MYSQL_DATABASE || "";
const user = env.MYSQL_USER || "";
const passwordRaw = env.MYSQL_PASSWORD || "";
const password = passwordRaw.replaceAll("'", "''");
if (!/^[A-Za-z0-9_]+$/.test(database) || !/^[A-Za-z0-9_]+$/.test(user)) process.exit(0);

async function appUserCanConnect() {
  const attempts = [
    ["mariadb", ["--no-defaults", `-h127.0.0.1`, `-P${port}`, `-u${user}`, `-p${passwordRaw}`, database, "-e", "SELECT 1"]],
    ["mysql", ["--no-defaults", `-h127.0.0.1`, `-P${port}`, `-u${user}`, `-p${passwordRaw}`, database, "-e", "SELECT 1"]],
  ];
  for (const [bin, args] of attempts) {
    try {
      await execFileAsync(bin, args);
      return true;
    } catch {
      // try next client
    }
  }
  return false;
}

if (await appUserCanConnect()) {
  console.log(`Local MariaDB is ready on 127.0.0.1:${port}, database ${database}`);
  process.exit(0);
}

const sql = `
CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${user}'@'127.0.0.1' IDENTIFIED BY '${password}';
ALTER USER '${user}'@'127.0.0.1' IDENTIFIED BY '${password}';
GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${user}'@'127.0.0.1';
FLUSH PRIVILEGES;
`;
async function runRootSql(sqlText) {
  const attempts = [
    ["mariadb", ["--no-defaults", `-h127.0.0.1`, `-P${port}`, "-uroot", "-e", sqlText]],
    ["mysql", ["--no-defaults", `-h127.0.0.1`, `-P${port}`, "-uroot", "-e", sqlText]],
    ["mariadb", ["--no-defaults", `--socket=${path.join(dataDir, "mysql.sock")}`, "-uroot", "-e", sqlText]],
    ["mysql", ["--no-defaults", `--socket=${path.join(dataDir, "mysql.sock")}`, "-uroot", "-e", sqlText]],
  ];
  let lastError;
  for (const [bin, args] of attempts) {
    try {
      await execFileAsync(bin, args);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

try {
  await runRootSql(sql);
} catch (error) {
  if (await appUserCanConnect()) {
    console.log(`Local MariaDB is ready on 127.0.0.1:${port}, database ${database} (app user already configured)`);
    process.exit(0);
  }
  throw error;
}
console.log(`Local MariaDB is ready on 127.0.0.1:${port}, database ${database}`);
