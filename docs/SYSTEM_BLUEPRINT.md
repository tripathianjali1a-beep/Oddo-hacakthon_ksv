# LuxRent — System Audit & Production Blueprint

> Hackathon: ODOO KSV 2026 · Stack: Next.js 16 (App Router) + React 19 + Tailwind 4
> Current storage: better-sqlite3 (file `.data/luxrent.db`) · Target: **PostgreSQL**
>
> This document covers: (1) how the frontend currently works, (2) every issue /
> loophole / breaker found in the codebase, (3) the backend that must be built,
> and (4) the production PostgreSQL schema.

---

## 1. Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router                                         │
│                                                             │
│  app/(storefront)/*   customer pages (client components)    │
│  app/(admin)/admin/*  vendor pages   (client components)    │
│  app/login            login/signup                          │
│  app/api/*            Route Handlers (the "backend")        │
│       └── lib/db.ts   better-sqlite3, schema + seed         │
│                                                             │
│  lib/cart.ts          localStorage cart (client only)      │
└─────────────────────────────────────────────────────────────┘
```

Everything renders client-side (`'use client'` on every data page) and fetches
from the internal API routes. There is **no session layer, no middleware, no
validation layer, and no payment/notification integration**.

---

## 2. How the Frontend Works (page by page)

### 2.1 Route map

| Route | Role | Data source | Purpose |
|---|---|---|---|
| `/` | — | — | Redirects to `/home` |
| `/home` | Customer | static | Marketing landing (hero, stats, categories) |
| `/browse` | Customer | `GET /api/products` | Catalog grid; client-side search, category/brand/price filters, sort, pagination (6/page) |
| `/browse/[id]` | Customer | `GET /api/products/:id` | Product detail: gallery, specs, rate tiles, booking widget (attachment + date range → price breakdown) → `addToCart()` |
| `/cart` | Customer | localStorage | Line items, promo code `LUXRENT10` (client-only −10%), summary |
| `/checkout` | Customer | localStorage + `POST /api/orders` | 4-step wizard: Contact → Delivery → Payment (card fields, never charged) → Confirm |
| `/login` | Both | `POST /api/auth/login`, `/signup` | Tabs for sign-in / sign-up; "vendor" toggle switches redirect target |
| `/admin/dashboard` | Vendor | `GET /api/dashboard` | KPIs, overdue table, activity feed (hard-coded), revenue bars, late-fee calculator (toy) |
| `/admin/orders` | Vendor | `GET /api/orders`, `PATCH /api/orders/:id` | List + Kanban; detail drawer with return checklist, late-fee input → "Process Return" |
| `/admin/products` | Vendor | `GET/POST/DELETE /api/products*` | Inventory table, add-product modal, bulk delete; pricing-rules card is static |
| `/admin/reports` | Vendor | orders + products + dashboard | Client-computed revenue/category/top-product analytics |
| `/admin/schedule` | Vendor | — | Placeholder ("coming soon") |
| `/admin/configuration` | Vendor | — | Policy/late-fee/deposit/notification settings — **saved nowhere** (fake 1 s delay) |
| static pages | — | — | about, contact, press, careers, trust, support, legal, policies/cancellation, how-it-works |

### 2.2 Key client flows

**Booking flow (happy path today)**
1. `/browse/[id]`: user picks attachment + pickup/return dates. Frontend computes
   `days`, `base + attachment×days + $75 damage waiver + 8% tax + deposit`.
2. `addToCart()` writes to `localStorage['luxrent.cart']` and fires a
   `cart:changed` CustomEvent (listened to by `/cart`).
3. `/cart` recomputes totals **differently** (no damage waiver) and may apply a
   client-side promo discount.
4. `/checkout` recomputes totals a **third** way (no waiver, no promo), collects
   contact/delivery/payment fields with **no validation**, then `POST /api/orders`
   with client-supplied `rate`, `deposit`, `total` per line. Errors are swallowed
   (`catch { /* ignore */ }`) and the user is routed to `/home?ordered=1`
   regardless of success.

**Return flow**
Admin opens the drawer on `/admin/orders`, ticks a 4-item checklist (UI-only),
types a late fee, and `PATCH /api/orders/:id { status:'returned', lateFee }`.
Refund amount is displayed but nothing financial actually happens.

**Auth flow**
`POST /api/auth/login` compares **plaintext passwords** and returns the user
JSON. The client optionally stores it in `localStorage['luxrent.user']` (only
when "Remember me" is checked) and routes by role. **No cookie, no token, no
server-side session.** The admin area does not check anything.

### 2.3 API surface (current)

| Endpoint | Methods | Auth | Notes |
|---|---|---|---|
| `/api/products` | GET, POST | ❌ none | GET supports `search/category/status/sort`; POST creates product |
| `/api/products/[id]` | GET, PUT, DELETE | ❌ none | PUT partial update; DELETE hard delete |
| `/api/orders` | GET, POST | ❌ none | POST accepts client prices; generates `ORD-XXXX` ids |
| `/api/orders/[id]` | GET, PATCH | ❌ none | PATCH allows `status/lateFee/notes/dueDate` (no enum validation) |
| `/api/auth/login` | POST | — | Plaintext compare, returns user JSON |
| `/api/auth/signup` | POST | — | **Accepts `role:'vendor'` from the client** |
| `/api/dashboard` | GET | ❌ none | KPIs partly real, activity + trend hard-coded |

---

## 3. Issues, Loopholes & Breakers

Severity: 🔴 **Breaker** (exploitable / breaks the demo) · 🟠 **Major** (wrong
behavior, must fix for "real case") · 🟡 **Minor** (polish / dead UI).

> **Fix status (2026-07-19):** the rental-domain and data blockers are now
> FIXED in code — server-side pricing engine (`lib/pricing.ts`, `POST /api/quotes`),
> date-based availability with double-booking rejection, real ISO dates with
> derived overdue, validated order lifecycle (reserved → active → returned)
> with refund on return, checkout validation + real error handling, live cart
> badge, working header search, drafts hidden from storefront, real dashboard
> KPIs/activity/trend, order group ids, numeric order-id generation, FK on
> `orders.productId`, and per-product `quantity`.
> Deliberately NOT fixed yet (per scope): auth/session hardening (S1–S3, S5),
> payment gateway (S6 — payment step is labelled demo mode), rate limiting,
> and performance items (B5, U6). Fixed: S4, S7 (partial — order/product/quote
> inputs validated), D1–D9, B2–B4, U1–U3 (search), U7 (partial).

### 3.1 Security loopholes

| # | Sev | Issue | Where |
|---|---|---|---|
| S1 | 🔴 | **Admin is completely unprotected.** No middleware, no session check. Anyone can open `/admin/dashboard` or `curl -X DELETE /api/products/1` and wipe the catalog. The login page's "vendor" toggle even redirects a *customer* login to `/admin`. | `app/(admin)/layout.tsx`, all `/api/*` |
| S2 | 🔴 | **Privilege escalation via signup.** `POST /api/auth/signup` trusts `role` from the request body → any visitor self-registers as `vendor`. | `app/api/auth/signup/route.ts:18` |
| S3 | 🔴 | **Plaintext passwords** stored and compared. No hashing (bcrypt/argon2), no sessions/JWT, no logout (sidebar "Logout" is just a link to `/login`). | `lib/db.ts`, `app/api/auth/login/route.ts` |
| S4 | 🔴 | **Client-controlled pricing.** `POST /api/orders` inserts `rate`, `deposit`, `total` straight from the request. Anyone can place a `total: 0` order for the excavator. Prices must be recomputed server-side from the product table. | `app/api/orders/route.ts:49-51` |
| S5 | 🟠 | **Demo backdoor reseeded on every boot.** `ensureDemoUsers` upserts `vendor@luxrent.com / admin` on each cold start — even in production. | `lib/db.ts:32-39` |
| S6 | 🟠 | Card number / expiry / CVV are collected in the checkout form. They're never sent anywhere (dead weight), but collecting raw PAN data is a PCI red flag — replace with a gateway-hosted field (Stripe/Razorpay). | `checkout/page.tsx` |
| S7 | 🟠 | No input validation anywhere (no zod/valibot). PATCH order accepts any `status` string; product POST accepts negative prices; no rate limiting on auth. | all API routes |
| S8 | 🟡 | User identity kept in `localStorage` → XSS-readable; guest checkout has no link to a user account at all (`customerName: 'Guest'`). | `login/page.tsx`, `checkout/page.tsx` |

### 3.2 Rental-domain breakers (the core business logic is missing)

| # | Sev | Issue |
|---|---|---|
| D1 | 🔴 | **No availability / double-booking check.** Product "availability" is a single global enum (`available/low-stock/booked/draft`), not date-based. Two customers can rent the same unit for overlapping dates; placing an order never updates product status or creates a reservation. This is the heart of a rental system and it doesn't exist. |
| D2 | 🔴 | **Dates are display strings.** `pickupDate`/`dueDate` are stored as `"Oct 12, 2024"` or literally `"Today"`. No date arithmetic is possible: overdue detection is faked (`late` seeded manually, `daysLate` hard-coded to 12/3), and the orders table compares `dueDate === 'Today'`. Product page even defaults pickup to `2024-10-15` (in the past) and lets you pick return < pickup. |
| D3 | 🔴 | **Three different totals for the same rental.** Product page: `base + attachment + $75 waiver + 8% tax + deposit`. Cart: `base + 8% fees + deposit − promo` (no waiver). Checkout: `base + 8% + deposit` (no waiver, **promo silently dropped**). The stored order total ≠ what the user was shown. |
| D4 | 🟠 | **Promo code is client-side theatre.** `LUXRENT10` is hard-coded in the cart page; discount never reaches the server. |
| D5 | 🟠 | **No stock/quantity model.** "Low stock" is decorative; there's no concept of owning 3 forklifts, no per-unit tracking. |
| D6 | 🟠 | **Return processing has no money movement.** "Process Return" sets `status` + `lateFee` but doesn't touch the deposit, produce a refund record, or validate state transitions (you can "return" a cancelled order). Checklist state isn't persisted. |
| D7 | 🟠 | Multi-item checkout creates N unrelated orders (no order-group id), so an order confirmation / invoice for the whole checkout is impossible. |
| D8 | 🟠 | Configuration page (min/max duration, grace period, late-fee %, deposit %) **saves nothing and is used by nothing** — the late-fee calculator and deposit amounts ignore it. |
| D9 | 🟡 | Draft products are returned by `GET /api/products` with no filter → drafts appear in the public storefront. |

### 3.3 Data & backend correctness

| # | Sev | Issue |
|---|---|---|
| B1 | 🔴 | **SQLite file storage breaks deployment.** `.data/luxrent.db` on local disk = data loss on every serverless deploy (Vercel) and no multi-instance support. This alone justifies the PostgreSQL migration. |
| B2 | 🟠 | `nextOrderId()` does `ORDER BY id DESC LIMIT 1` on a TEXT column — lexicographic, so `ORD-9999 → ORD-10000` sorts *before* `ORD-9999` and ids collide. Also a read-then-insert race under concurrency. |
| B3 | 🟠 | `orders.productId` has **no FOREIGN KEY** (despite `foreign_keys = ON`); deleting a product leaves dangling order references, and reports fall back to category "Other". |
| B4 | 🟠 | Dashboard numbers lie: "Revenue (MTD)" is `SUM(total - deposit)` over **all orders ever** (including cancelled); "Overdue" KPI actually counts `pending`; activity feed, revenue trend, and "+4.2% vs last month" are hard-coded. |
| B5 | 🟡 | All list endpoints return the full table; filtering/pagination is client-side. Fine for a demo, breaks at scale — server should paginate. |
| B6 | 🟡 | `rating`/`reviews` are fake seeded numbers; there is no reviews table. |

### 3.4 Dead / broken UI (found while tracing)

| # | Sev | Issue |
|---|---|---|
| U1 | 🔴 | **Header cart badge is hard-coded to `2`** (`useState(2)`, never reads the real cart, never listens to `cart:changed`). Empty cart still shows "2". |
| U2 | 🟠 | Checkout wizard "Continue" advances without validating required fields → order placed with empty name/email/phone as "Guest". |
| U3 | 🟠 | Header search box is state-only (no submit handler, no navigation). Nav links `Categories → /browse?cat=all` and `Deals → /browse?deals=true` point to query params the browse page never reads. |
| U4 | 🟡 | Dead buttons: "Export CSV", per-row `more_vert` menu, "Manage Price Lists", "Forgot password?", dashboard "Apply" late fee, order "Filter", share button, Terms/Privacy. No edit-product UI even though `PUT /api/products/:id` exists. |
| U5 | 🟡 | Schedule page is a placeholder — but "Schedule" is a headline feature of a rental admin. |
| U6 | 🟡 | Product images hot-link Unsplash with plain `<img>` (no `next/image`, no upload path for vendor-added products — new products have empty images). |
| U7 | 🟡 | Add-product modal invents `monthly = daily × 26`; new products get no image/description/deposit. |

---

## 4. Backend To Build

### 4.1 Foundation

1. **PostgreSQL via a driver/ORM** — recommend **Drizzle ORM + `pg`** (or Prisma)
   with migrations checked into the repo. Connection string in `DATABASE_URL`.
2. **Validation** — zod schemas per endpoint; reject unknown fields; coerce and
   bound all numbers/dates. Never accept `role`, `total`, `rate`, `deposit`,
   `status` from an unauthenticated client.
3. **Auth** — email+password with **bcrypt/argon2**, server-issued session in an
   `httpOnly` `Secure` `SameSite=Lax` cookie (roll your own `sessions` table or
   use Auth.js/Lucia). Add `middleware.ts` protecting `/admin/**` and all
   mutating API routes (role `vendor`); `GET /api/auth/me` + `POST /api/auth/logout`.
4. **Money as integer cents** end-to-end (`BIGINT` in PG) — never floats.
5. **Dates as real timestamps** (`timestamptz`), ISO-8601 over the wire.

### 4.2 Required API (target spec)

```
Auth
  POST   /api/auth/signup          {name,email,password}          → customer only
  POST   /api/auth/login           {email,password}               → sets session cookie
  POST   /api/auth/logout
  GET    /api/auth/me

Catalog (public reads, vendor writes)
  GET    /api/products             ?search&category&sort&page     → published only, paginated
  GET    /api/products/:id
  GET    /api/products/:id/availability?from&to                   → per-unit calendar  ★ NEW
  POST   /api/products             (vendor)
  PUT    /api/products/:id         (vendor)
  DELETE /api/products/:id         (vendor, soft-delete/archive)

Quotes & Orders
  POST   /api/quotes               {lines:[{productId,attachmentId,from,to}], promoCode}
                                   → SERVER computes days, rate, waiver, tax, deposit,
                                     discount; returns a priced quote. Cart/checkout
                                     render this instead of computing locally.  ★ NEW
  POST   /api/orders               {quoteId|lines, contact, delivery, paymentIntentId}
                                   → validates availability atomically, creates
                                     order + lines + reservations in one transaction
  GET    /api/orders               (vendor: all; customer: own) ?status&search&page
  GET    /api/orders/:id
  POST   /api/orders/:id/pickup    (vendor) status confirmed → active
  POST   /api/orders/:id/return    (vendor) {lateFeeCents, checklist[], damageNotes}
                                   → computes refund, writes deposit ledger entry
  POST   /api/orders/:id/cancel

Payments (Stripe or Razorpay — hackathon: test mode)
  POST   /api/payments/intent      {quoteId} → gateway client secret
  POST   /api/payments/webhook     gateway → mark order paid / deposit held

Admin
  GET    /api/dashboard            → real MTD revenue, real overdue (due_at < now),
                                     activity from an events table, 7-day trend from orders
  GET    /api/schedule?from&to     → reservations for calendar view  ★ NEW
  GET/PUT /api/settings            → persist the Configuration page; pricing engine
                                     reads grace period / late-fee % / deposit % from here
  GET    /api/reports/export.csv

Background job (cron / route handler on schedule)
  - mark orders overdue when now() > due_at + grace_period
  - accrue late fees per settings; send reminder emails (Resend/nodemailer)
```

### 4.3 Server-side pricing engine (fixes D3/D4/S4)

One function, one source of truth, used by quote + order + return:

```
line_subtotal = (daily_rate + attachment_rate) × days      (or weekly/monthly tier if cheaper)
waiver        = settings.damage_waiver_cents (per line, if enabled)
discount      = promo lookup in promo_codes table (server-side)
tax           = settings.tax_rate_bp applied to (subtotal + waiver − discount)
deposit       = product.deposit_cents (or settings.deposit_pct of subtotal)
total_due     = subtotal + waiver + tax − discount + deposit
refund        = deposit − late_fee − damage_fee   (floor 0, ledgered)
```

### 4.4 Availability engine (fixes D1)

- Track **units** per product (quantity ≥ 1). A reservation holds a unit for
  `[start, end)` including the configured buffer time.
- On order creation: `SELECT ... FOR UPDATE` the units, check overlap, insert
  reservation — all in one transaction. PostgreSQL can also **enforce** this
  with an exclusion constraint (schema below), so double-booking is impossible
  even under race conditions. Product card status becomes *derived* (available
  units for the requested window), not a manually edited enum.

---

## 5. PostgreSQL Schema (production DDL)

```sql
-- Extensions ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;      -- case-insensitive email
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- exclusion constraint on ranges

-- Enums --------------------------------------------------------------------
CREATE TYPE user_role       AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE product_status  AS ENUM ('draft', 'published', 'archived');
CREATE TYPE order_status    AS ENUM ('quotation', 'reserved', 'confirmed',
                                     'picked_up', 'returned', 'cancelled');
CREATE TYPE payment_status  AS ENUM ('pending', 'authorized', 'paid',
                                     'partially_refunded', 'refunded', 'failed');
CREATE TYPE deposit_event   AS ENUM ('held', 'released', 'forfeited_late_fee',
                                     'forfeited_damage');
CREATE TYPE rate_unit       AS ENUM ('hour', 'day', 'week', 'month');

-- Users & sessions ----------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,                      -- bcrypt/argon2, never plaintext
  role          user_role NOT NULL DEFAULT 'customer',
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,                 -- store hash, not raw token
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- Catalog -------------------------------------------------------------------
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id      UUID REFERENCES users(id),
  category_id    INT  REFERENCES categories(id),
  name           TEXT NOT NULL,
  brand          TEXT NOT NULL DEFAULT '',
  sku            TEXT UNIQUE,
  description    TEXT NOT NULL DEFAULT '',
  status         product_status NOT NULL DEFAULT 'draft',
  -- money in integer cents; 0 = tier not offered
  hourly_cents   BIGINT NOT NULL DEFAULT 0 CHECK (hourly_cents  >= 0),
  daily_cents    BIGINT NOT NULL DEFAULT 0 CHECK (daily_cents   >= 0),
  weekly_cents   BIGINT NOT NULL DEFAULT 0 CHECK (weekly_cents  >= 0),
  monthly_cents  BIGINT NOT NULL DEFAULT 0 CHECK (monthly_cents >= 0),
  deposit_cents  BIGINT NOT NULL DEFAULT 0 CHECK (deposit_cents >= 0),
  quantity       INT    NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  image_url      TEXT NOT NULL DEFAULT '',
  gallery        JSONB NOT NULL DEFAULT '[]',       -- [url, ...]
  specs          JSONB NOT NULL DEFAULT '[]',       -- [{icon,label,value}]
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_status   ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_search   ON products
  USING GIN (to_tsvector('english', name || ' ' || brand || ' ' || coalesce(sku,'')));

-- Add-ons ("attachments" in the current UI), priced per day -----------------
CREATE TABLE product_addons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,
  per_day_cents   BIGINT NOT NULL DEFAULT 0 CHECK (per_day_cents >= 0)
);

-- Physical units — enables real stock + per-unit calendars ------------------
CREATE TABLE product_units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  serial_no   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_units_product ON product_units(product_id);

-- Orders --------------------------------------------------------------------
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no         TEXT NOT NULL UNIQUE
                   DEFAULT ('ORD-' || to_char(nextval('order_no_seq'), 'FM00000')),
  customer_id      UUID REFERENCES users(id),       -- nullable = guest checkout
  customer_name    TEXT NOT NULL,
  email            CITEXT NOT NULL,
  phone            TEXT NOT NULL DEFAULT '',
  status           order_status NOT NULL DEFAULT 'quotation',
  delivery_method  TEXT NOT NULL DEFAULT 'pickup'
                   CHECK (delivery_method IN ('pickup','delivery')),
  address          TEXT NOT NULL DEFAULT '',
  notes            TEXT NOT NULL DEFAULT '',
  -- server-computed totals (cents), snapshot at confirmation
  subtotal_cents   BIGINT NOT NULL DEFAULT 0,
  discount_cents   BIGINT NOT NULL DEFAULT 0,
  waiver_cents     BIGINT NOT NULL DEFAULT 0,
  tax_cents        BIGINT NOT NULL DEFAULT 0,
  deposit_cents    BIGINT NOT NULL DEFAULT 0,
  late_fee_cents   BIGINT NOT NULL DEFAULT 0,
  total_cents      BIGINT NOT NULL DEFAULT 0,
  promo_code_id    UUID REFERENCES promo_codes(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE SEQUENCE order_no_seq START 1000;            -- create BEFORE orders table
CREATE INDEX idx_orders_status   ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);

CREATE TABLE order_lines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name     TEXT NOT NULL,                   -- snapshot; survives deletes
  addon_id         UUID REFERENCES product_addons(id) ON DELETE SET NULL,
  addon_label      TEXT NOT NULL DEFAULT '',
  starts_at        TIMESTAMPTZ NOT NULL,
  due_at           TIMESTAMPTZ NOT NULL,
  returned_at      TIMESTAMPTZ,
  rate_unit        rate_unit NOT NULL DEFAULT 'day',
  unit_rate_cents  BIGINT NOT NULL,                 -- snapshot of rate charged
  units_billed     INT    NOT NULL CHECK (units_billed > 0),   -- e.g. days
  deposit_cents    BIGINT NOT NULL DEFAULT 0,
  line_total_cents BIGINT NOT NULL,
  CHECK (due_at > starts_at)
);
CREATE INDEX idx_lines_order   ON order_lines(order_id);
CREATE INDEX idx_lines_due     ON order_lines(due_at) WHERE returned_at IS NULL;

-- Reservations: the double-booking killer -----------------------------------
-- One row per rented unit per order line. The EXCLUDE constraint makes
-- overlapping bookings of the same unit IMPOSSIBLE, even under races.
CREATE TABLE reservations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id       UUID NOT NULL REFERENCES product_units(id) ON DELETE CASCADE,
  order_line_id UUID NOT NULL REFERENCES order_lines(id) ON DELETE CASCADE,
  period        TSTZRANGE NOT NULL,                 -- includes buffer time
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','cancelled')),
  EXCLUDE USING gist (unit_id WITH =, period WITH &&)
    WHERE (status = 'active')
);
CREATE INDEX idx_reservations_unit ON reservations(unit_id);

-- Payments & deposit ledger -------------------------------------------------
CREATE TABLE payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  provider      TEXT NOT NULL DEFAULT 'stripe',     -- 'stripe' | 'razorpay' | 'cash'
  provider_ref  TEXT,                               -- payment_intent / order id
  amount_cents  BIGINT NOT NULL,
  status        payment_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON payments(order_id);

CREATE TABLE deposit_ledger (                        -- auditable deposit history
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  event         deposit_event NOT NULL,
  amount_cents  BIGINT NOT NULL,
  note          TEXT NOT NULL DEFAULT '',
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Return inspection (persists the drawer checklist) --------------------------
CREATE TABLE return_inspections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_line_id UUID NOT NULL REFERENCES order_lines(id),
  checklist     JSONB NOT NULL DEFAULT '[]',        -- [{item, ok}]
  damage_notes  TEXT NOT NULL DEFAULT '',
  inspected_by  UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Promotions (server-side; replaces hard-coded LUXRENT10) --------------------
CREATE TABLE promo_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          CITEXT NOT NULL UNIQUE,
  percent_off   INT CHECK (percent_off BETWEEN 1 AND 100),
  amount_off_cents BIGINT,
  valid_from    TIMESTAMPTZ,
  valid_until   TIMESTAMPTZ,
  max_uses      INT,
  used_count    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (percent_off IS NOT NULL OR amount_off_cents IS NOT NULL)
);

-- Settings (backs the Configuration page) ------------------------------------
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- seed keys: min_rental_days, max_rental_days, buffer_hours, grace_period_days,
--            late_fee_type, late_fee_rate_bp, max_late_fee_cents,
--            deposit_type, deposit_pct_bp, tax_rate_bp, damage_waiver_cents,
--            reminder_days_before, overdue_notice_frequency

-- Activity feed / audit (backs dashboard "Recent Activity") ------------------
CREATE TABLE activity_events (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    UUID REFERENCES users(id),
  type        TEXT NOT NULL,        -- order_created, payment_received, return_processed…
  order_id    UUID REFERENCES orders(id),
  product_id  UUID REFERENCES products(id),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_time ON activity_events(created_at DESC);

-- Optional (nice-to-have): reviews to replace fake rating numbers ------------
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id),
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, customer_id)
);

-- updated_at trigger ---------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

CREATE TRIGGER t_users_touch    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER t_products_touch BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER t_orders_touch   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER t_payments_touch BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
```

### Availability query (powering `/api/products/:id/availability` and `/api/schedule`)

```sql
-- Units of a product free for [$2, $3)
SELECT u.id
FROM   product_units u
WHERE  u.product_id = $1 AND u.is_active
  AND NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE  r.unit_id = u.id
      AND  r.status = 'active'
      AND  r.period && tstzrange($2, $3)
  );
```

### Real dashboard queries (replace hard-coded values)

```sql
-- Revenue MTD (paid, non-cancelled)
SELECT COALESCE(SUM(total_cents - deposit_cents), 0)
FROM orders
WHERE status NOT IN ('cancelled','quotation')
  AND created_at >= date_trunc('month', now());

-- Overdue lines (real, not seeded)
SELECT ol.*, o.order_no, o.customer_name,
       EXTRACT(DAY FROM now() - ol.due_at)::int AS days_late
FROM order_lines ol
JOIN orders o ON o.id = ol.order_id
WHERE ol.returned_at IS NULL
  AND o.status = 'picked_up'
  AND ol.due_at + make_interval(days => (
        SELECT (value->>0)::int FROM settings WHERE key='grace_period_days')) < now();

-- 7-day revenue trend
SELECT date_trunc('day', created_at)::date AS day,
       SUM(total_cents - deposit_cents) AS revenue_cents
FROM orders
WHERE created_at > now() - interval '7 days'
  AND status NOT IN ('cancelled','quotation')
GROUP BY 1 ORDER BY 1;
```

---

## 6. Order-of-Work (hackathon-pragmatic)

**Phase 1 — Make it real (must-have to demo "end to end")**
1. Swap SQLite → PostgreSQL (Drizzle/Prisma + migrations + seed script).
2. Auth: bcrypt + httpOnly session cookie + `middleware.ts` guarding `/admin/**`
   and vendor APIs; strip `role` from signup; remove demo-user upsert in prod.
3. Server-side pricing: `POST /api/quotes`; cart/checkout render server totals
   (one consistent number everywhere); orders recompute prices server-side.
4. Real dates (`timestamptz`) + reservations table with the exclusion
   constraint; availability check in the product page date picker; order
   creation is transactional.
5. Fix the frontend breakers: live cart badge, checkout step validation,
   working header search, drafts filtered from public catalog.

**Phase 2 — Judge-impressing depth**
6. Return flow with deposit ledger + persisted inspection checklist.
7. Settings persisted and actually driving late fees/deposits/buffer time.
8. Real dashboard/reports queries; activity from `activity_events`.
9. Schedule page: calendar of reservations (`GET /api/schedule`).
10. Stripe/Razorpay test-mode payment intent + webhook (replaces fake card form).
11. Email notifications (Resend): order confirmation, return reminder, overdue.

**Phase 3 — Production hygiene**
12. Rate limiting on auth, zod on every route, security headers, `next/image`,
    image upload (UploadThing/S3) for vendor products, server pagination,
    soft-delete for products, CSV export endpoint, seed script gated by env.
