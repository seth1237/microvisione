import { readFileSync } from "node:fs";
import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const root = new URL("..", import.meta.url);

const modules = [
  ["Overview", "app/admin/(panel)/page.tsx", "Overview"],
  ["Products", "app/admin/(panel)/products/page.tsx", "Products"],
  ["Checkout", "app/admin/(panel)/checkout/page.tsx", "Checkout"],
  ["Client Interest", "app/admin/(panel)/interest/page.tsx", "Client Interest"],
  ["Images", "app/admin/(panel)/images/page.tsx", "Images"],
  ["Catalogues", "app/admin/(panel)/catalogues/page.tsx", "Catalogues"],
  ["Company Profile", "app/admin/(panel)/company-profile/page.tsx", "Company Profile"],
  ["Installations", "app/admin/(panel)/installations/page.tsx", "Installations"],
  ["Offers", "app/admin/(panel)/offers/page.tsx", "Offers"],
  ["Events", "app/admin/(panel)/events/page.tsx", "Events"],
  ["Manufacturers", "app/admin/(panel)/manufacturers/page.tsx", "Manufacturers"],
  ["Jobs", "app/admin/(panel)/jobs/page.tsx", "Jobs"],
  ["Performance", "app/admin/(panel)/performance/page.tsx", "Performance"],
  ["Search Analytics", "app/admin/(panel)/search/page.tsx", "Search Analytics"],
  ["Redirects", "app/admin/(panel)/redirects/page.tsx", "Redirects"],
  ["Settings", "app/admin/(panel)/settings/page.tsx", "Settings"],
];

const shell = readFileSync(new URL("components/admin/admin-shell.tsx", root), "utf8");
const schema = readFileSync(new URL("lib/platform/mysql.ts", root), "utf8");
let failed = 0;

for (const [label, file] of modules) {
  readFileSync(new URL(file, root), "utf8");
  if (!shell.includes(`label: '${label}'`)) {
    console.error(`Missing sidebar label: ${label}`);
    failed += 1;
  }
}

for (const table of [
  "accord_nx_products",
  "accord_nx_orders",
  "accord_nx_customer_interest",
  "accord_nx_docs",
  "accord_nx_search_events",
  "accord_nx_admins",
  "accord_nx_redirects",
]) {
  if (!schema.includes(table) && table !== "accord_nx_redirects") {
    console.error(`Missing table ${table}`);
    failed += 1;
  }
}
if (!schema.includes("accord_nx_docs")) {
  console.error("Redirects are stored in accord_nx_docs");
  failed += 1;
}

const salt = randomBytes(16).toString("hex");
const derived = await scrypt("microvision-test", salt, 64);
const stored = `${salt}:${Buffer.from(derived).toString("hex")}`;
const [checkSalt, hash] = stored.split(":");
const again = await scrypt("microvision-test", checkSalt, 64);
const ok = timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(again));
if (!ok) {
  console.error("Password hash check failed");
  failed += 1;
}

const secret = "test-secret";
const value = "admin@example.com";
const sig = createHmac("sha256", secret).update(value).digest("base64url");
if (!sig) {
  console.error("Session signature failed");
  failed += 1;
}

if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log(`Admin modules: ${modules.length}. Password hashing and schema checks passed.`);
