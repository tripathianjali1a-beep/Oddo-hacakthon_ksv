/**
 * PostgreSQL adapter — used when DATABASE_URL env var is set (production).
 * Provides a synchronous-looking interface that wraps pg Pool queries.
 * All routes call getDb() which returns either a SQLite DB or this adapter.
 */
import { Pool } from 'pg';
import type { Product, Order, User, ProductStatus, OrderStatus } from './types';

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export function getPgPool(): Pool {
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    });
  }
  return global.__pgPool;
}

// ── Schema ──────────────────────────────────────────────────
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available','low-stock','booked','draft')),
  hourly NUMERIC NOT NULL DEFAULT 0,
  daily NUMERIC NOT NULL DEFAULT 0,
  weekly NUMERIC NOT NULL DEFAULT 0,
  monthly NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  rating NUMERIC NOT NULL DEFAULT 4.8,
  reviews INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  gallery TEXT NOT NULL DEFAULT '[]',
  specs TEXT NOT NULL DEFAULT '[]',
  attachments TEXT NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  "groupId" TEXT NOT NULL DEFAULT '',
  "productId" INTEGER REFERENCES products(id) ON DELETE SET NULL,
  item TEXT NOT NULL DEFAULT '',
  "customerName" TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved','active','returned','cancelled')),
  "startAt" TIMESTAMPTZ NOT NULL,
  "endAt" TIMESTAMPTZ NOT NULL,
  "returnedAt" TIMESTAMPTZ,
  days INTEGER NOT NULL DEFAULT 1,
  rate NUMERIC NOT NULL DEFAULT 0,
  "addonLabel" TEXT NOT NULL DEFAULT '',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  waiver NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC NOT NULL DEFAULT 0,
  "lateFee" NUMERIC NOT NULL DEFAULT 0,
  refund NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  "promoCode" TEXT NOT NULL DEFAULT '',
  "paymentStatus" TEXT NOT NULL DEFAULT 'demo'
    CHECK ("paymentStatus" IN ('demo','paid')),
  "paymentRef" TEXT NOT NULL DEFAULT '',
  "deliveryMethod" TEXT NOT NULL DEFAULT 'pickup',
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`;

// ── Row mappers (camelCase PG columns → domain types) ───────
/* eslint-disable @typescript-eslint/no-explicit-any */
export function pgRowToProduct(r: any): Product {
  const safeJson = <T>(raw: string, fb: T): T => { try { return JSON.parse(raw); } catch { return fb; } };
  return {
    id: Number(r.id), name: r.name, brand: r.brand, sku: r.sku,
    category: r.category, description: r.description,
    status: r.status as ProductStatus,
    hourly: Number(r.hourly), daily: Number(r.daily),
    weekly: Number(r.weekly), monthly: Number(r.monthly),
    deposit: Number(r.deposit), quantity: Number(r.quantity),
    rating: Number(r.rating), reviews: Number(r.reviews),
    image: r.image,
    gallery: safeJson(r.gallery, []),
    specs: safeJson(r.specs, []),
    attachments: safeJson(r.attachments, []),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}

export function pgRowToOrder(r: any): Order {
  const toIso = (v: unknown) => v instanceof Date ? v.toISOString() : v ? String(v) : null;
  const status = r.status as OrderStatus;
  const now = Date.now();
  const end = Date.parse(toIso(r.endAt) ?? '');
  const late = status === 'active' && Number.isFinite(end) && now > end;
  const daysLate = late ? Math.max(1, Math.floor((now - end) / 86_400_000)) : 0;
  return {
    id: r.id, groupId: r.groupId, productId: r.productId ? Number(r.productId) : null,
    item: r.item, customerName: r.customerName, email: r.email, phone: r.phone,
    status, startAt: toIso(r.startAt)!, endAt: toIso(r.endAt)!,
    returnedAt: toIso(r.returnedAt),
    days: Number(r.days), rate: Number(r.rate), addonLabel: r.addonLabel,
    subtotal: Number(r.subtotal), waiver: Number(r.waiver),
    discount: Number(r.discount), tax: Number(r.tax),
    deposit: Number(r.deposit), lateFee: Number(r.lateFee),
    refund: Number(r.refund), total: Number(r.total),
    promoCode: r.promoCode, paymentStatus: r.paymentStatus,
    paymentRef: r.paymentRef, late, daysLate,
    deliveryMethod: r.deliveryMethod, address: r.address,
    notes: r.notes,
    createdAt: toIso(r.createdAt)!,
  };
}

export function pgRowToUser(r: any): User {
  return {
    id: Number(r.id), name: r.name, email: r.email,
    role: r.role, createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Bootstrap ────────────────────────────────────────────────
let _pgReady = false;

export async function ensurePgSchema(): Promise<void> {
  if (_pgReady) return;
  const pool = getPgPool();
  const client = await pool.connect();
  try {
    await client.query(SCHEMA_SQL);
    _pgReady = true;
  } finally {
    client.release();
  }
}

// No seed data: the catalog, orders and users are created entirely through
// the application (admin product/order management and the signup flow).

// ── PG availability helper ───────────────────────────────────
export async function pgAvailableQuantity(
  pool: Pool,
  productId: number,
  startAt: string,
  endAt: string,
  excludeOrderId = '',
): Promise<number> {
  const { rows: [prod] } = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
  if (!prod) return 0;
  const { rows: [ov] } = await pool.query(
    `SELECT COUNT(*) AS c FROM orders
     WHERE "productId" = $1 AND status IN ('reserved','active')
       AND id != $2 AND NOT ("endAt" <= $3 OR "startAt" >= $4)`,
    [productId, excludeOrderId, startAt, endAt]
  );
  return Math.max(0, Number(prod.quantity) - Number(ov.c));
}

// ── Next order ID helper ─────────────────────────────────────
export async function pgNextOrderId(pool: Pool): Promise<string> {
  const { rows: [r] } = await pool.query(
    `SELECT MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)) AS n FROM orders`
  );
  const last = r.n ?? 940;
  return `ORD-${String(last + 1).padStart(4, '0')}`;
}
