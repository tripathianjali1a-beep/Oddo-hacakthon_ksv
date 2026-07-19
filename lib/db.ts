/**
 * ============================================================================
 * Rentora Local SQLite Storage & Schema Engine (`db.ts`)
 * ============================================================================
 * Why dual database drivers?
 * During local development and hackathon demonstrations, requiring developers
 * to spin up Docker containers or PostgreSQL servers creates friction.
 * This file powers our ultra-fast, zero-dependency local SQLite database (`.data/luxrent.db`).
 *
 * Key Architectural Features:
 * 1. Write-Ahead Logging (WAL): Enabled via `db.pragma('journal_mode = WAL')` for high concurrency.
 * 2. Hot-Reload Safety: Caches the connection in `global.__luxrentDb` across Next.js reloads.
 * 3. Serverless Ephemeral Handling: Automatically switches to `/tmp` when deployed on Vercel.
 * 4. Dynamic Inventory Check: `availableQuantity()` prevents double-booking using SQL overlaps.
 * ============================================================================
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Product, Order, User, ProductStatus, OrderStatus } from './types';

// On Vercel (and other serverless platforms) process.cwd() is read-only;
// we use /tmp which is always writable. Locally .data/ is used as before.
const IS_SERVERLESS = process.env.VERCEL === '1' || process.env.SERVERLESS === '1';
const DATA_DIR = IS_SERVERLESS
  ? '/tmp'
  : path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'luxrent.db');

// Bumped to 7 to drop legacy seeded demo records — the app now starts empty
// and is populated entirely through the admin UI / signup flow.
const SCHEMA_VERSION = 7;

declare global {
  // eslint-disable-next-line no-var
  var __luxrentDb: Database.Database | undefined;
}

/**
 * Creates and configures the raw SQLite connection.
 * Enforces foreign key constraints and WAL mode for optimal read/write throughput.
 */
function createConnection(): Database.Database {
  if (!IS_SERVERLESS && !fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // On serverless /tmp is ephemeral — drop schema_version so it always re-seeds.
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  if (IS_SERVERLESS) {
    // Force re-migration on every cold start (ephemeral /tmp).
    db.exec(`DROP TABLE IF EXISTS meta`);
  }
  migrate(db);
  return db;
}

/**
 * Returns the singleton SQLite database instance across the application lifecycle.
 */
export function getDb(): Database.Database {
  if (!global.__luxrentDb) {
    global.__luxrentDb = createConnection();
  }
  return global.__luxrentDb;
}

// ============================================================================
// Schema Migration Engine
// ============================================================================
function migrate(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  const row = db.prepare(`SELECT value FROM meta WHERE key = 'schema_version'`).get() as { value: string } | undefined;
  const current = row ? parseInt(row.value, 10) : 0;

  if (current < SCHEMA_VERSION) {
    // Old demo data is not worth an in-place migration: rebuild and re-seed.
    db.exec(`
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS users;
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      sku TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'low-stock', 'booked', 'draft')),
      hourly REAL NOT NULL DEFAULT 0 CHECK (hourly >= 0),
      daily REAL NOT NULL DEFAULT 0 CHECK (daily >= 0),
      weekly REAL NOT NULL DEFAULT 0 CHECK (weekly >= 0),
      monthly REAL NOT NULL DEFAULT 0 CHECK (monthly >= 0),
      deposit REAL NOT NULL DEFAULT 0 CHECK (deposit >= 0),
      quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
      rating REAL NOT NULL DEFAULT 4.8,
      reviews INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL DEFAULT '',
      gallery TEXT NOT NULL DEFAULT '[]',
      specs TEXT NOT NULL DEFAULT '[]',
      attachments TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      groupId TEXT NOT NULL DEFAULT '',
      productId INTEGER REFERENCES products(id) ON DELETE SET NULL,
      item TEXT NOT NULL DEFAULT '',
      customerName TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'reserved'
        CHECK (status IN ('reserved', 'active', 'returned', 'cancelled')),
      startAt TEXT NOT NULL,
      endAt TEXT NOT NULL,
      returnedAt TEXT,
      days INTEGER NOT NULL DEFAULT 1 CHECK (days > 0),
      rate REAL NOT NULL DEFAULT 0 CHECK (rate >= 0),
      addonLabel TEXT NOT NULL DEFAULT '',
      subtotal REAL NOT NULL DEFAULT 0,
      waiver REAL NOT NULL DEFAULT 0,
      discount REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      deposit REAL NOT NULL DEFAULT 0 CHECK (deposit >= 0),
      lateFee REAL NOT NULL DEFAULT 0 CHECK (lateFee >= 0),
      refund REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      promoCode TEXT NOT NULL DEFAULT '',
      paymentStatus TEXT NOT NULL DEFAULT 'demo' CHECK (paymentStatus IN ('demo', 'paid')),
      paymentRef TEXT NOT NULL DEFAULT '',
      deliveryMethod TEXT NOT NULL DEFAULT 'pickup',
      address TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (endAt > startAt)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_product_dates ON orders(productId, startAt, endAt);

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.prepare(`INSERT INTO meta (key, value) VALUES ('schema_version', ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
    .run(String(SCHEMA_VERSION));
}

// ============================================================================
// Data Mappers (Raw Database Row <-> Strongly-Typed Domain Models)
// ============================================================================
/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    sku: r.sku,
    category: r.category,
    description: r.description,
    status: r.status as ProductStatus,
    hourly: r.hourly,
    daily: r.daily,
    weekly: r.weekly,
    monthly: r.monthly,
    deposit: r.deposit,
    quantity: r.quantity,
    rating: r.rating,
    reviews: r.reviews,
    image: r.image,
    gallery: safeJson(r.gallery, []),
    specs: safeJson(r.specs, []),
    attachments: safeJson(r.attachments, []),
    createdAt: r.createdAt,
  };
}

export function rowToOrder(r: any): Order {
  const status = r.status as OrderStatus;
  const now = Date.now();
  const end = Date.parse(r.endAt);
  // Derive real-time overdue flags dynamically without storing redundant boolean columns:
  const late = status === 'active' && Number.isFinite(end) && now > end;
  const daysLate = late ? Math.max(1, Math.floor((now - end) / 86_400_000)) : 0;
  return {
    id: r.id,
    groupId: r.groupId,
    productId: r.productId,
    item: r.item,
    customerName: r.customerName,
    email: r.email,
    phone: r.phone,
    status,
    startAt: r.startAt,
    endAt: r.endAt,
    returnedAt: r.returnedAt ?? null,
    days: r.days,
    rate: r.rate,
    addonLabel: r.addonLabel,
    subtotal: r.subtotal,
    waiver: r.waiver,
    discount: r.discount,
    tax: r.tax,
    deposit: r.deposit,
    lateFee: r.lateFee,
    refund: r.refund,
    total: r.total,
    promoCode: r.promoCode,
    paymentStatus: r.paymentStatus,
    paymentRef: r.paymentRef,
    late,
    daysLate,
    deliveryMethod: r.deliveryMethod,
    address: r.address,
    notes: r.notes,
    createdAt: r.createdAt,
  };
}

export function rowToUser(r: any): User {
  return { id: r.id, name: r.name, email: r.email, role: r.role, createdAt: r.createdAt };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function safeJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

/**
 * Generates sequential human-friendly order identifiers (e.g., ORD-0941, ORD-0942).
 * Uses numeric casting on SUBSTR(id, 5) to guarantee proper sorting past ORD-9999.
 */
export function nextOrderId(db: Database.Database): string {
  const row = db.prepare(`SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS n FROM orders`).get() as { n: number | null };
  const last = row.n ?? 940;
  return `ORD-${String(last + 1).padStart(4, '0')}`;
}

// ============================================================================
// Real-Time Inventory & Overlap Calculation
// ============================================================================
/**
 * Computes exact physical units free for booking during `[startAt, endAt)`.
 * Why not just check `product.quantity > 0`?
 * Because rental items can be booked months in advance! A product might have 5 units,
 * with 3 booked next week. By querying `orders` where `status IN ('reserved', 'active')`
 * and testing date overlap: `NOT (endAt <= @startAt OR startAt >= @endAt)`,
 * we guarantee mathematically that double-booking is impossible.
 */
export function availableQuantity(
  db: Database.Database,
  productId: number,
  startAt: string,
  endAt: string,
  excludeOrderId?: string,
): number {
  const product = db.prepare('SELECT quantity FROM products WHERE id = ?').get(productId) as { quantity: number } | undefined;
  if (!product) return 0;
  const overlapping = db.prepare(`
    SELECT COUNT(*) AS c FROM orders
    WHERE productId = @productId
      AND status IN ('reserved', 'active')
      AND id != @excludeOrderId
      AND NOT (endAt <= @startAt OR startAt >= @endAt)
  `).get({ productId, startAt, endAt, excludeOrderId: excludeOrderId ?? '' }) as { c: number };
  return Math.max(0, product.quantity - overlapping.c);
}

// No seed data: the catalog, orders and users are created entirely through
// the application (admin product/order management and the signup flow).

