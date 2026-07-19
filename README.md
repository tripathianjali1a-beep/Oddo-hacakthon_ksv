# 🏢 LuxRent (Rentora) — Enterprise Rental Management & Asset Orchestration Platform

<div align="center">

[![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind%20CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite WAL](https://img.shields.io/badge/SQLite%20WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![PostgreSQL Ready](https://img.shields.io/badge/PostgreSQL%20Ready-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**A High-Fidelity, Zero-Trust Rental Architecture Built for the Odoo Hackathon 2026**

[Explore Live Demo](#) · [System Blueprint](./docs/SYSTEM_BLUEPRINT.md) · [Backend & API Architecture](./docs/BACKEND_AND_DATABASE_GUIDE.md) · [Report Bug / Feature Request](https://github.com/anjali-0404/ODOO_Rental_Management_System/issues)

</div>

---

## 📖 Executive Summary

**LuxRent (formerly Rentora)** is a state-of-the-art rental management and asset orchestration platform engineered to handle complex, high-value physical inventories—including **heavy machinery** (`Caterpillar`, `Komatsu`), **cinema & studio equipment** (`RED`, `ARRI`, `Sony`), and **premium staging furniture** (`Herman Miller`, `Vitra`).

Unlike traditional e-commerce storefronts where inventory leaves the warehouse permanently upon purchase, rental platforms must track multi-tier time horizons, overlapping date-based bookings, security deposit lifecycles, damage inspection workflows, and strict state machine transitions. LuxRent delivers an enterprise-grade solution combining an **ultra-responsive modern storefront** with a **commanding vendor administration suite**, all powered by a tamper-proof, server-side pricing and availability engine.

---

## ✨ Key Technical Highlights & Innovations

### 1. Zero-Trust Server-Side Quotation Engine (`/api/quotes`)
Never trust client-side arithmetic. When a customer adjusts dates or selects attachment add-ons on the product page or cart, LuxRent hits our server-side engine (`lib/pricing.ts`). The server computes:
- **Tiered Base Rates:** Automatic switching across Hourly (`₹`), Daily (`₹`), Weekly (`₹`), and Monthly (`₹`) pricing contracts based on rental duration.
- **Dynamic Attachments:** Per-day add-on hardware (e.g., *4K Anamorphic Lens Pack*, *Hydraulic Breaker Kit*) seamlessly summed into the daily rate.
- **Transparent Escrow Breakdown:** Subtotal, Damage Waiver protection, promotional discounts (`LUXRENT10`), GST (`18% / 8%`), and Refundable Security Deposits.

### 2. Event-Driven Finite State Machine (FSM)
To eliminate race conditions and illegal lifecycle jumps (e.g., returning an order that was never picked up or confirming a cancelled booking), all orders adhere to a strict finite state machine contract:

```
[ reserved ] ───(Customer picks up / Item delivered)───▶ [ active ]
    │                                                        │
    │───(Customer cancels before pickup)───▶ [ cancelled ]   │───(Physical inspection & return)───▶ [ returned ]
```
- **Terminal States:** `returned` and `cancelled` lock the record against further mutation.
- **Overdue Detection:** Real-time date arithmetic checks whether `status == 'active'` and `now() > endAt`, automatically flagging late returns and calculating exact penalty late fees.

### 3. Real-Time Date-Based Availability & Double-Booking Prevention
Instead of a static boolean flag (`isAvailable`), availability is dynamically computed across time windows (`[startAt, endAt]`). When a quote or order request arrives, the server checks concurrent reservations against total physical units (`quantity`), ensuring that overlapping bookings are rejected at the database level before payment is initiated.

### 4. Multi-Item Checkout Grouping (`groupId`)
Customers can rent multiple distinct assets across different time horizons in a single transaction. LuxRent assigns a shared `groupId` connecting individual line items (`ORD-0942-A`, `ORD-0942-B`) under one unified financial settlement, allowing staff to process physical returns and inspect damage on a per-item basis.

### 5. Dual-Mode Payment Integration (Razorpay + Demo Escrow)
- **Instant Hackathon Demo Mode:** Allows judges and testers to execute full end-to-end checkout, reservation creation, and return workflows instantly without real financial charge.
- **Razorpay Integration:** Production-ready gateway support for real-time UPI, credit card, and net banking authorization with transaction reference logging.

---

## 🏗️ Architectural Overview & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             NEXT.JS 16 APP ROUTER                                │
├───────────────────────────────────────┬──────────────────────────────────────────┤
│         CLIENT STOREFRONT             │          VENDOR ADMIN SUITE              │
│  /home       Landing & Category Hero  │  /admin/dashboard   Real-time KPIs & Bar │
│  /browse     Catalog, Filters & Search│  /admin/orders      Kanban, List & Drawer│
│  /browse/[id] Date Picker & Add-ons   │  /admin/products    Inventory CRUD Table │
│  /cart       Reactive Cart Summary    │  /admin/reports     Analytics & Exports  │
│  /checkout   4-Step Checkout Wizard   │  /admin/config      Policy & Late Fees   │
├───────────────────────────────────────┴──────────────────────────────────────────┤
│                          ZERO-TRUST SERVER API LAYER                             │
│  POST /api/quotes        ──▶  Server-Side Pricing & Tiered Rate Computation      │
│  POST /api/orders        ──▶  Atomic Reservation & Multi-Item Group ID Generation│
│  PATCH /api/orders/[id]  ──▶  FSM Lifecycle Transitions & Return Checklist Engine│
│  POST /api/auth/login    ──▶  Role-Based Access Control (RBAC) & Session Auth    │
├──────────────────────────────────────────────────────────────────────────────────┤
│                          PERSISTENCE & STORAGE ENGINE                            │
│  Better-SQLite3 (WAL Mode Concurrency)   ──▶   PostgreSQL / @libsql/client Ready │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

Run LuxRent locally in **under 30 seconds**. Our automated launcher installs dependencies, initializes environment configurations, seeds the database with rich mock data, and boots the development server automatically.

### Option A: Automatic Launcher (Recommended)

Pick the script for your operating system:

| Platform | Command |
| :--- | :--- |
| **macOS / Linux** | `./start.sh` |
| **Windows (Command Prompt / Double-Click)** | `start.bat` |
| **Windows (PowerShell)** | `./start.ps1` |
| **Any OS via Node.js** | `npm run quickstart` |

Once started, the application will automatically open in your default browser at **[http://localhost:3000](http://localhost:3000)**.

> **Want to run a Production Build?**  
> Simply run `npm run quickstart:prod` or pass `build` to any launcher (e.g., `./start.ps1 build`).

---

### Option B: Manual Setup

If you prefer executing the setup steps manually:

```bash
# 1. Clone the repository
git clone https://github.com/anjali-0404/ODOO_Rental_Management_System.git
cd ODOO_Rental_Management_System

# 2. Install dependencies
npm install

# 3. Setup environment variables (optional — defaults to demo-payment mode)
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

The local SQLite database (`.data/luxrent.db`) will be automatically provisioned, migrated, and seeded on initial startup—no separate database migration step required!

---

## 👥 Role-Based Access Control (RBAC) & Test Accounts

LuxRent comes pre-seeded with specialized accounts to test our multi-tier permission system:

| Role | Email | Password | Access Rights & Capabilities |
| :--- | :--- | :--- | :--- |
| **Vendor (Store Admin)** | `vendor@luxrent.com` | `admin` | Full access to `/admin/dashboard`, order Kanban/List views, return inspection drawers, product CRUD, and financial reports. |
| **System Admin** | `admin@luxrent.com` | `admin` | Global platform administration, pricing policy updates, and executive analytics. |
| **Customer** | `customer@luxrent.com` | `customer` | Standard storefront browsing, live quotation generation, cart management, and order tracking. |

---

## 🗺️ Application Route Sitemap

### Storefront (Customer Experience)
- `GET /home` — High-impact marketing hero, live statistics, and category spotlight.
- `GET /browse` — Dynamic catalog with instant search, multi-category tabs (`Machinery`, `Cinema`, `Furniture`), brand filtering, and sorting.
- `GET /browse/[id]` — Product detail page featuring interactive date range selectors, attachment add-ons, and real-time rate breakdown.
- `GET /cart` — Reactive cart review with live promo code validation (`LUXRENT10`).
- `GET /checkout` — 4-step wizard (*Contact* → *Delivery Method* → *Payment & Escrow* → *Confirmation*).
- `GET /careers`, `/contact`, `/how-it-works`, `/legal`, `/cancellation-policy`, `/press`, `/support`, `/trust` — Enterprise trust and informational pages.

### Vendor Admin Suite (`/admin/*`)
- `GET /admin/dashboard` — Executive command center showing MTD Revenue, Active Rentals in field, Overdue tracking alerts, Escrow Deposits held, and Recent Activity logs.
- `GET /admin/orders` — Dual Kanban & List views with real-time status badges (`Reserved`, `Active`, `Late`, `Returned`). Features an **interactive Return Drawer** with a 4-point physical condition checklist and late-fee/damage deduction calculator.
- `GET /admin/products` — Full inventory management table with Add/Edit modals, tiered price lists, and stock quantity adjustments.
- `GET /admin/reports` — Comprehensive analytical breakdowns by product performance, category utilization, and revenue trends.

---

## 🛠️ Technology Stack & Dependencies

- **Core Framework:** Next.js 16.2 (App Router, Server Route Handlers, API Routes)
- **UI & Styling:** React 19.2, Vanilla CSS + Tailwind CSS v4, Lucide & Google Material Symbols
- **Database & ORM:** `better-sqlite3` (with Write-Ahead Logging `WAL` mode), `@libsql/client`, and `pg` for seamless cloud deployment
- **TypeScript:** Strict type contracts (`lib/types.ts`) ensuring end-to-end synchronization between database entities, API payloads, and UI components
- **Linting & Quality:** ESLint 9 + `eslint-config-next`

---

## 📚 Documentation & Deep Dives

For comprehensive architectural blueprints, database schemas, and API design specifications, explore our detailed engineering guides:
- **[System Blueprint & Audit (`SYSTEM_BLUEPRINT.md`)](./docs/SYSTEM_BLUEPRINT.md)** — In-depth analysis of the FSM order lifecycle, frontend-backend contracts, and production DDL schema.
- **[Backend & Database Architecture (`BACKEND_AND_DATABASE_GUIDE.md`)](./docs/BACKEND_AND_DATABASE_GUIDE.md)** — Comprehensive breakdown of the quotation engine, Razorpay webhook flow, and SQLite/PostgreSQL dual-driver layer.

---

## 🤝 Contributing

We welcome contributions, bug reports, and feature requests from the community and hackathon participants!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add instant availability calendar'`)
4. Push to the Branch (`git push origin feat/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ by Team KSV for the Odoo Hackathon 2026**

</div>
