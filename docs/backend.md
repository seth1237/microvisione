# Microvision backend

The admin dashboard and API are the Accord medical backend, adapted for Microvision Enterprises Ltd. The public site and the admin use the same MySQL database when `MYSQL_HOST`, `MYSQL_USER`, and `MYSQL_DATABASE` are set.

**MedTrack QR** mounts at `/api/medtrack` on the same Hono process. It creates `mt_*` tables (hospitals, branches, users, equipment, service history, tickets) and uses Nodemailer (`SMTP_*`) for fault/maintenance emails. See the MedTrack section in the root `README.md` and `.env.example`.

## Run it

The website and the API are separate processes.

```bash
cd backend
npm install
npm run dev
```

That command starts a local MariaDB on `127.0.0.1:3307` when `.env.local` points there, then starts the API on port 4000. The database files are in `~/.local/share/microvision-mysql`. In another terminal, from the project root, `npm run dev` starts the website. The website forwards `/api` to the API process.

## Database

Local building uses `MYSQL_HOST=127.0.0.1`, `MYSQL_PORT=3307`, and `MYSQL_DATABASE=microvision`. This computer’s system MariaDB on port 3306 does not accept this user, so the backend starts its own server instead.

To use the hosting database later, change `MYSQL_*` in `.env.local`. On the raimerchants server, `MYSQL_HOST` is `localhost` and the database is `raimerch_microvisione`. `raimerchants.co.ke` itself points at Vercel, not at MariaDB. From another computer the database host is `da40.host-ww.net`, and cPanel → Remote MySQL must allow that computer. The commented block in `.env.local` has the hosting account ready to uncomment.

Tables are created on first use (`CREATE TABLE IF NOT EXISTS`). Existing rows are not dropped. If the product table is empty, the current Microvision catalogue is inserted once.

Do not import the Accord production SQL dump. That database belongs to Accord Medical.

## Admin

Open `/admin/login`. The first successful sign-in creates the admin from `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` when no admin exists.

## Uploads

Catalogue PDFs, installation photos, and CVs are stored as files (or in the MySQL file table) and referenced by id. Set `MICROVISION_UPLOADS_DIR` to keep documents outside the default `uploads/` folder.

## What stays out of the admin

Database passwords, M-Pesa keys, and Cloudinary secrets stay in environment variables. M-Pesa checkout is inactive until the Daraja variables are set. No payment is reported as complete without that configuration.
