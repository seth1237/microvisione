# Microvision Enterprises Ltd

Front end for the Microvision catalogue: medical and laboratory equipment supplied from Loipi Plaza, Industrial Area, Nairobi. Typed mock/live catalogue data sits behind a service layer. **MedTrack QR** (hospital equipment inventory + public QR status) is shipped in the same repo as a parallel module.

## MedTrack QR

Multi-tenant hospital equipment passports: public QR status pages, fault/maintenance tickets (Nodemailer), full equipment lifecycle (edit/transfer/QR regenerate), preventive schedules, status-history audit, engineer/admin portals, weekly/monthly response-time and downtime reports with CSV export. UI follows EmployeeHR field patterns (teal `#0f766e`, invoice-like passport surfaces, mobile bottom tabs).

### Run MedTrack locally

1. Copy `.env.example` → `.env.local` and set MySQL + optional SMTP (see below).
2. Start MySQL (local helper on port **3307**):

```bash
npm --prefix backend run dev
```

That starts MariaDB when `MYSQL_HOST=127.0.0.1` and `MYSQL_PORT=3307`, then the API on port **4000**.

3. In another terminal:

```bash
npm install
npm run dev
```

4. Open `/medtrack/login`, click **Seed demo hospital**, then sign in:

| Role | Email | Password |
| --- | --- | --- |
| Engineer | `engineer@demo-hospital.local` | `demo-engineer` |
| Admin | `admin@demo-hospital.local` | `demo-admin` |
| Supervisor | `supervisor@demo-hospital.local` | `demo-supervisor` |
| Technician | `tech@demo-hospital.local` | `demo-tech` |

Public QR URLs look like `/q/<public_qr_id>` (shown on each equipment passport). Ticket emails go to the hospital notification list; without SMTP they are logged in the API console. Technicians can record service; only engineer/supervisor/admin return equipment to service.

### MedTrack environment variables

| Variable | Purpose |
| --- | --- |
| `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE` | Shared MySQL (MedTrack tables use `mt_` prefix) |
| `MICROVISION_API_URL` | Backend origin (default `http://127.0.0.1:4000`); Next rewrites `/api/*` here |
| `MEDTRACK_SESSION_SECRET` | Signs engineer/admin cookies (`mt_session`) |
| `MEDTRACK_PUBLIC_BASE_URL` | Absolute origin for QR links + email bodies |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Nodemailer for fault & maintenance notifications |

Key routes: `/q/[publicQrId]` (public), `/medtrack/*` (engineers), `/api/medtrack/*` (API).

---

## Run locally (catalogue)

```bash
npm install
npm run dev
```

Open the URL printed by Next.js (the project script uses the default dev server). Catalogue browsing works without MedTrack env; admin/API features need MySQL as in `.env.example`.

The dev server only attaches its live updates for `localhost` unless the browser host is listed in `allowedDevOrigins` in `next.config.ts`. `127.0.0.1` is already listed so the catalogue stays interactive when you open that address. Add any other host you use, then restart `npm run dev`.

Optional:

```bash
NEXT_PUBLIC_SITE_URL=https://www.microvisione.com npm run dev
```

That value is used for canonical URLs, the sitemap and Open Graph links. It defaults to `https://www.microvisione.com`.

## Brand colours

All interface colours come from `styles/tokens.ts`. The root layout injects them as CSS variables, and Tailwind utilities (`bg-brand`, `text-accent`, `bg-black`, and the rest) read those variables.

| Token | Role |
| --- | --- |
| `#1211bb` | Primary blue |
| Red | Calls to action |
| Black | Utility bar, footer, dark bands |

Change the palette in `styles/tokens.ts` and the site follows. Replace the wordmark by swapping `public/brand/logo.svg`. The SVG file repeats the blue and black because an image cannot read CSS variables. Update it when the real logo arrives.

The type pair is Outfit for headings and Source Sans 3 for text, loaded with `next/font`.

## Folder map

```
app/            Routes (App Router)
components/     ui, layout, product, cart, forms, account
data/           Mock datasets. Search for TODO: replace with real data
lib/api/        Service layer. This is the only place pages read catalogue data
lib/utils/      KES, dates, Kenyan phone numbers
store/          Cart, quote basket, wishlist, compare, demo account (localStorage)
styles/tokens.ts  Colour source of truth
types/          Shared TypeScript types
public/         Logo slot, icon, placeholder documents
```

## Swap the mock data for an API

1. Keep the types in `types/index.ts`.
2. Replace the bodies in `lib/api/products.ts` and `lib/api/content.ts` with `fetch` calls. Leave the function names and return types as they are.
3. `getCatalogueBundle()` in `lib/api/catalogue.ts` feeds the header, compare and wishlist. Point that at the same API.
4. Prices flagged `priceIsPlaceholder` and specs whose value is `TBC` must stay labelled until the figures are real. Do not publish example prices as offers.
5. Forms currently succeed in the browser and show a reference number. Post them to your API from `components/forms/enquiry-form.tsx` and `components/cart/checkout-wizard.tsx` when the server exists.
6. The M-Pesa step is a simulation. Numbers ending in `1111` fail, numbers ending in `0000` time out, and any other Kenyan number succeeds. No Safaricom request is made.

Baskets are stored in `localStorage` inside `try/catch`, and stores rehydrate after mount so server rendering stays stable.

## PWA

`app/manifest.ts` and `app/icon.tsx` make the site installable. A service worker is **not** registered. Add one later only if you need offline shell caching, and do not cache HTML that will eventually contain a signed-in customer. The basket already survives reloads through `localStorage`.

## Commerce

- `purchaseMode: "quote"` — analyzers and instruments. Add to the quote basket, then submit the quote form.
- `purchaseMode: "buy"` — priced consumable-style listings. Cart, then checkout.
- `purchaseMode: "both"` — quote or cart.
- WhatsApp on every product uses `https://wa.me/254790669988` with the product name, quantity and URL.

Example prices exist only on a few meters and are badged **Example price**.

## Placeholders

Specifications, stock, offers, events, jobs, certificates, team names, email and opening hours are marked in the interface or in the data files. Do not treat them as verified company facts.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
# microvisione
