# Rentora — Backend & Database, Explained Simply

> A plain-English guide to how the backend and database actually work, written so
> you can confidently answer judge questions during the demo. No jargon dumps —
> if a word needs explaining, it's explained.
>
> For the deeper, more technical engineering audit (every bug, every security
> hole, and the full production PostgreSQL redesign), see
> `docs/SYSTEM_BLUEPRINT.md`. This document is the "explain it like I'm five,
> but accurately" version.

---

## 1. The big picture in one paragraph

Rentora is a website for renting equipment (excavators, forklifts, generators,
cameras, etc.). It's built with **Next.js**, which lets one project contain
both the **website** (what you see in the browser) and the **backend**
(the part that talks to the database) — there's no separate backend server to
run. The backend lives in files under `app/api/`. Each file is one small
program that answers a specific question, like "what products do you have?"
or "book this excavator for these dates." The database is a single file on
disk (`.data/luxrent.db`) that stores products, orders, and users. Everything
the browser needs is fetched from these API files, which read from or write
to that database file.

---

## 2. What is the database, really?

We use **SQLite**, through a library called `better-sqlite3`. Think of SQLite
as a very organized spreadsheet that lives in **one single file**
(`.data/luxrent.db`) instead of needing a separate database server running
somewhere. That's why the whole app can start with just `npm run dev` — there's
nothing extra to install or configure.

**Why SQLite for a hackathon project?** It's zero-setup, fast for a small
amount of data, and every judge can literally see the data file on disk. The
trade-off (and we know this) is that it's a single file, so it doesn't scale
to many servers at once — that's a deliberate, documented choice for a demo,
not an accident. `docs/SYSTEM_BLUEPRINT.md` lays out the exact plan to move to
PostgreSQL for real production use.

### The three tables that matter

Picture three spreadsheets:

**`products`** — every item you can rent.
| Column | What it means in plain words |
|---|---|
| `id` | A number that identifies the product |
| `name`, `brand`, `sku`, `category` | Basic catalog info |
| `description` | The text shown on the product page |
| `status` | `available`, `low-stock`, `booked`, or `draft` (drafts are hidden from customers) |
| `hourly` / `daily` / `weekly` / `monthly` | The 4 price tiers |
| `deposit` | The refundable security deposit |
| `quantity` | How many physical units we own (e.g. 3 identical forklifts) |
| `rating`, `reviews` | Display-only star rating |
| `image`, `gallery` | Photo URLs |
| `specs`, `attachments` | Extra details and optional add-ons, stored as JSON text inside the column |

**`orders`** — every booking a customer makes.
| Column | What it means in plain words |
|---|---|
| `id` | Human-friendly order code, e.g. `ORD-0942` |
| `groupId` | Ties multiple items from the same checkout together (so "order #942" can really mean 3 different machines booked in one go) |
| `productId` | Which product this line is for |
| `customerName`, `email`, `phone` | Who booked it |
| `status` | `reserved` → `active` → `returned`, or `cancelled` (explained below) |
| `startAt`, `endAt` | The rental window (real dates, not just text like "Today") |
| `days`, `rate`, `subtotal`, `waiver`, `discount`, `tax`, `deposit`, `lateFee`, `refund`, `total` | The full price breakdown for that line |
| `paymentStatus` | `demo` (test mode) or `paid` (a real Razorpay payment happened) |

**`users`** — people who can log in.
| Column | What it means in plain words |
|---|---|
| `name`, `email`, `password` | Login credentials |
| `role` | `customer` or `vendor` (vendor = the shop owner / admin) |

There's also a tiny internal `meta` table that just remembers "which version
of the database structure am I on" — more on that next.

### How the database gets created and filled with data

The very first time the app starts, nothing exists yet. The code in `lib/db.ts`
notices the tables are missing, creates them, and then fills `products` with 8
realistic demo items and `orders` with 4 example bookings (one overdue, one
active, one upcoming, one already returned) — so the demo always looks alive,
even on a fresh checkout. It also creates two login accounts automatically:
`vendor@rentora.com` (the admin/shop-owner account) and `customer@rentora.com`
(a normal customer), both with simple demo passwords. This all happens
automatically — nobody has to run a separate "seed the database" command.

**What is a "schema version" and why does it matter?** Every time we change
what a table looks like (add a column, etc.), we bump a number called
`SCHEMA_VERSION` in the code. When the app starts and sees the stored version
is older than the code's version, it wipes and rebuilds the products/orders/
users tables and re-seeds fresh demo data. This is intentionally simple for a
hackathon (no complex migration scripts) — the trade-off is that upgrading the
schema throws away old demo data, which is fine because it's demo data, not
real customer data.

---

## 3. How a request actually flows through the app

Here's what happens, step by step, when someone uses the site:

```
Browser (React pages)
   │  fetch('/api/products') , fetch('/api/orders'), etc.
   ▼
API route file in app/api/**/route.ts   ← "the backend"
   │  runs SQL through better-sqlite3 (prepared statements — see Security)
   ▼
.data/luxrent.db (the SQLite file on disk)
```

There is no separate backend server — the "backend" is just these API route
files, running inside the same Next.js process as the website. This is a
completely normal, production-proven pattern (it's literally how Next.js is
designed to be used), not a shortcut.

### The booking journey, concretely

1. **Browse** (`/browse`) calls `GET /api/products` and shows the catalog.
2. **Product page** (`/browse/[id]`) lets you pick dates and an add-on, then
   calls `GET /api/products/[id]/availability` to check if a unit is free for
   those exact dates.
3. **Add to cart** just saves your choice in the browser (`localStorage`) —
   nothing is written to the database yet, because nothing is confirmed yet.
4. **Checkout** sends everything to `POST /api/quotes` first, which
   re-calculates the *real* price on the server (see the pricing section
   below) so a customer can't tamper with the price in their browser.
5. **Placing the order** calls `POST /api/orders`, which re-checks
   availability one more time (in case someone else booked it in the last 30
   seconds), then writes the order into the `orders` table, marked `reserved`.
6. **Admin marks pickup** → status becomes `active`.
7. **Admin processes the return** → status becomes `returned`, a late fee (if
   any) is subtracted from the deposit, and a refund amount is calculated.

### Order status lifecycle

```
reserved ──(vendor clicks "Pickup")──► active ──(vendor clicks "Return")──► returned
    │
    └──(cancelled by vendor/customer)──► cancelled
```

"Overdue" is **not** its own status — it's calculated on the fly: an order is
overdue if it's `active` and today's date is past its `endAt` date. Same for
"Due Soon" (due within 24 hours). This keeps the database simple: it only
stores facts, and the "is this late?" logic is computed whenever it's needed.

---

## 4. The API endpoints, in plain English

| When the app does this... | It calls... | Which does this |
|---|---|---|
| Shows the catalog / search / filter | `GET /api/products` | Reads matching rows from `products` |
| Shows one product's page | `GET /api/products/:id` | Reads one row |
| Checks if dates are free | `GET /api/products/:id/availability` | Counts overlapping bookings for that product and date range |
| Prices a cart before payment | `POST /api/quotes` | Recalculates the true price server-side, flags anything no longer available |
| Places an order | `POST /api/orders` | Verifies payment (or demo mode), re-checks availability, inserts rows into `orders` |
| Lists/searches orders (admin) | `GET /api/orders` | Reads from `orders` |
| Marks pickup / return / cancel | `PATCH /api/orders/:id` | Updates one order's status, calculates late fee & refund on return |
| Starts a payment | `POST /api/payments/razorpay-order` | Talks to Razorpay, or returns "demo mode" if no API keys are set |
| Logs in | `POST /api/auth/login` | Checks email + password against `users` |
| Signs up | `POST /api/auth/signup` | Inserts a new row into `users` |
| Loads the admin dashboard | `GET /api/dashboard` | Adds up revenue, overdue counts, and recent activity from `orders` |
| Admin adds/edits/deletes a product | `POST` / `PUT` / `DELETE /api/products/:id` | Writes to `products` |

---

## 5. How pricing actually works (and why it's trustworthy)

The price a customer sees is **never trusted from their browser** — it's
always recomputed on the server, using `lib/pricing.ts`, from the product's
real price in the database. That single function is used for the cart
preview, the checkout screen, and the final order — so there's exactly **one**
source of truth for "how much does this cost," not three different numbers
that might disagree.

The formula, in words:
- **Days** = how many days between pickup and return (minimum 1).
- **Rate** = the product's daily price, plus any add-on's daily price.
- **Subtotal** = rate × days.
- **Damage waiver** = a flat ₹75 per item (like optional insurance).
- **Discount** = a promo code applied to the subtotal (not the deposit). The
  demo code is `RENTORA10` for 10% off — it's checked server-side against a
  fixed list in `lib/pricing.ts`, not just trusted from the browser.
- **Tax** = 8% of (subtotal + waiver − discount).
- **Deposit** = the product's refundable deposit, added on top (not taxed).
- **Total** = subtotal + waiver − discount + tax + deposit.

When the item comes back: the vendor enters a late fee (if any), and
**refund = deposit − late fee** (never less than ₹0).

---

## 6. How double-booking is prevented

Every product has a `quantity` (how many physical units exist). When checking
if a product is available for a date range, the server counts how many
*other* orders (with status `reserved` or `active`) already overlap that date
range, and subtracts that from the quantity. If the result is 0, it's fully
booked for those dates — no more orders can be placed for that window. This
check happens **twice**: once when you view the product page (so the calendar
looks right), and again at the exact moment you place the order (so two
people racing to book the last unit can't both succeed).

---

## 7. Payments — demo mode vs. real mode

We integrate with **Razorpay** (a real payment gateway, common in India).
Whether it's a real charge or a safe demo depends entirely on one thing:
**are the `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` environment variables
set?**

- **Not set (default demo mode):** the server returns `{ demo: true }`, the
  checkout skips the real payment popup, and the order is saved with
  `paymentStatus: 'demo'`. Nobody is charged anything — this is intentional so
  judges/testers can complete a full checkout without needing real payment
  credentials.
- **Set (real mode):** Razorpay's checkout popup opens for a real (or
  test-mode) transaction. When it succeeds, the server verifies the payment
  using an HMAC signature check (`lib/razorpay.ts`) — this cryptographically
  proves the payment really came from Razorpay and wasn't faked by tampering
  with the browser — and only then marks the order `paid`.

---

## 8. Security — what's there, and what's intentionally left as "next step"

Being upfront about this is a strength, not a weakness — it shows you
understand the difference between "hackathon demo" and "production app."

**What's actually protected:**
- All database queries use **prepared statements** (parameterized SQL), which
  is the standard defense against SQL injection — user input is never
  concatenated directly into a SQL string.
- Payments are verified with a cryptographic signature, not just trusted
  blindly.
- Prices are always recalculated server-side, so a customer can't edit the
  price in their browser's dev tools and pay less.

**What's simplified for the demo (and the honest reason why):**
- Passwords are stored as plain text, not hashed. For a hackathon demo with
  fake accounts, this is a conscious shortcut to save time; in a real product
  this would use `bcrypt` or `argon2` hashing (this is documented as the #1
  item in the production blueprint).
- There's no login session/cookie system — logging in just returns the user's
  info, and the browser optionally remembers it in `localStorage`. There's no
  server-side check that stops someone from visiting `/admin/dashboard`
  directly without logging in. Again: known, documented, and the fix (a
  session cookie + middleware guarding `/admin/**`) is scoped out in
  `docs/SYSTEM_BLUEPRINT.md`.
- Signup lets you choose your own role (`customer` or `vendor`) — fine for a
  demo where anyone should be able to see the admin dashboard, not fine for
  production (should require an invite/approval).

---

## 9. Likely judge questions — with answers you can say out loud

**Q: What database are you using, and why?**
> "SQLite, through `better-sqlite3`. It's a single-file database, so there's
> zero setup — no separate database server to install or configure. For a
> hackathon demo that's a huge speed advantage. It doesn't scale to multiple
> servers, which is a known limitation we've documented, and the fix is a
> straightforward swap to PostgreSQL since our queries are plain SQL, not
> tied to SQLite-only features."

**Q: Where is your backend? I only see a frontend folder.**
> "Next.js lets the backend live inside the same project, as 'API routes'
> under `app/api/`. Each file is a small server-side function — for example
> `app/api/orders/route.ts` handles creating and listing orders. It's the same
> architectural pattern as a separate Express server, just co-located with the
> frontend for simplicity. Nothing runs in the browser that touches the
> database directly."

**Q: How do you stop two customers from booking the same excavator on the same
day?**
> "Every product has a quantity — how many physical units we own. Before
> confirming a booking, the server counts how many *other* active or reserved
> orders already overlap the requested dates, using an SQL range-overlap
> check, and rejects the booking if none are left. This check runs again at
> the exact moment of checkout, not just when you first view the page, so a
> last-second race between two customers is still caught."

**Q: Can a customer cheat the price by editing the request in their browser?**
> "No — the price is never taken from the browser. `POST /api/quotes` and
> `POST /api/orders` both recompute the entire price server-side, from the
> product's real price in the database, using one shared pricing function.
> The client only sends *what* and *when*, never *how much*."

**Q: Is the payment real or fake?**
> "Both, depending on configuration. It's a real Razorpay integration. If
> Razorpay API keys are configured, it opens a real payment popup and verifies
> the payment cryptographically afterward. If no keys are set — which is our
> default demo setup — it automatically falls back to a safe 'demo mode' so
> the full checkout flow can be demonstrated without moving real money."

**Q: How do you know if a rental is overdue?**
> "We don't store an 'overdue' status — we calculate it live: if an order is
> `active` and today's date is past its return date, it's overdue. That way
> the database only stores facts (start date, end date, status), and 'is this
> late' is always accurate no matter when you look, instead of being a stale
> flag someone forgot to update."

**Q: What happens to the deposit when equipment is returned?**
> "When the vendor processes a return, they can enter a late fee. The refund
> is automatically calculated as the deposit minus that late fee, never going
> below zero, and the order status moves to 'returned'."

**Q: Is this secure enough for production?**
> "Not yet, and we're upfront about that. Passwords aren't hashed and there's
> no login session/cookie system protecting the admin area — those are the
> two biggest gaps. We already have a documented plan (`SYSTEM_BLUEPRINT.md`)
> for exactly how to close them: bcrypt password hashing, an httpOnly session
> cookie, and middleware that blocks unauthenticated access to `/admin/**` and
> to any endpoint that changes data. For a hackathon demo, we prioritized
> getting the core rental logic — pricing, availability, booking lifecycle —
> fully correct first."

**Q: How would this scale to thousands of products or bookings?**
> "The current SQLite file works great for a demo, but a single file isn't
> built for multiple servers running at once. The migration path is
> PostgreSQL — our SQL is portable, and the full target schema (with proper
> foreign keys, an exclusion constraint that makes double-booking physically
> impossible at the database level, and indexed search) is already designed
> and written down in `SYSTEM_BLUEPRINT.md`."

**Q: What's the difference between a customer and a vendor/admin account?**
> "Both are rows in the same `users` table, distinguished by a `role` column
> — `customer` or `vendor`. A vendor is the shop-owner/admin role that sees
> the dashboard, manages inventory, and processes returns. Right now that
> split is enforced only by where the app redirects you after login, not by a
> server-side permission check — which is one of the documented next steps."

**Q: Why does the admin dashboard show real numbers?**
> "The dashboard's key numbers — active rentals, overdue count, revenue this
> month, deposits currently held — are computed live from the `orders` table
> with SQL aggregates, not hard-coded. For example, monthly revenue sums
> `total minus deposit` for every non-cancelled order created since the start
> of the current month."

**Q: What would you build next if you had another week?**
> "In order: password hashing + real login sessions, then locking down the
> admin routes with middleware, then moving to PostgreSQL with a proper
> reservations table that uses a database-level exclusion constraint so
> double-booking is impossible even under concurrent load, then persisting
> vendor settings (grace periods, late-fee rules) so they actually drive the
> pricing engine instead of just being a display screen."

---

## 10. One-sentence summary you can open with

*"Rentora's backend is a set of Next.js API routes backed by a SQLite
database — customers browse and book equipment with server-verified pricing
and availability, vendors manage inventory and returns from an admin
dashboard, and every number on screen — revenue, overdue rentals, refunds —
is calculated live from real data, not hard-coded."*
