import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Product, Order, User, ProductStatus, OrderStatus } from './types';

// ────────────────────────────────────────────────────────────
// Local SQLite database. File lives in .data/luxrent.db (git-ignored).
// A single shared connection is cached across hot reloads.
// Schema is versioned: bumping SCHEMA_VERSION drops and re-seeds.
// ────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'luxrent.db');
const SCHEMA_VERSION = 5;

declare global {
  // eslint-disable-next-line no-var
  var __luxrentDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  seed(db);
  ensureDemoUsers(db);
  return db;
}

// Keep the demo logins working on every startup (upsert by email),
// even if the database was seeded before these credentials existed.
function ensureDemoUsers(db: Database.Database) {
  const upsert = db.prepare(`
    INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role)
    ON CONFLICT(email) DO UPDATE SET password = excluded.password, role = excluded.role, name = excluded.name
  `);
  upsert.run({ name: 'Demo Vendor', email: 'vendor@rentora.com', password: 'admin', role: 'vendor' });
  upsert.run({ name: 'Demo Customer', email: 'customer@rentora.com', password: 'customer', role: 'customer' });
}

export function getDb(): Database.Database {
  if (!global.__luxrentDb) {
    global.__luxrentDb = createConnection();
  }
  return global.__luxrentDb;
}

// ── Schema ──────────────────────────────────────────────────
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
  `);

  db.prepare(`INSERT INTO meta (key, value) VALUES ('schema_version', ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
    .run(String(SCHEMA_VERSION));
}

// ── Row <-> domain mapping ──────────────────────────────────
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

export function nextOrderId(db: Database.Database): string {
  // Numeric max — TEXT ordering would break past ORD-9999.
  const row = db.prepare(`SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS n FROM orders`).get() as { n: number | null };
  const last = row.n ?? 940;
  return `ORD-${String(last + 1).padStart(4, '0')}`;
}

// ── Availability ────────────────────────────────────────────
// Units of a product still free for [startAt, endAt). Reserved and active
// rentals block units; returned/cancelled do not.
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

// ── Seed data ───────────────────────────────────────────────
const DAY_MS = 86_400_000;
function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

function seed(db: Database.Database) {
  const count = (db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }).c;
  if (count > 0) return;

  const standardAtt = [
    { id: 'standard', label: 'Standard', price: 0 },
    { id: 'breaker', label: 'Breaker Hammer', price: 150 },
    { id: 'auger', label: 'Auger Drill', price: 200 },
    { id: 'thumb', label: 'Hydraulic Thumb', price: 80 },
  ];
  const machineSpecs = [
    { icon: 'weight', label: 'Operating Weight', value: '18,500 lbs' },
    { icon: 'speed', label: 'Engine Power', value: '120 HP' },
    { icon: 'straighten', label: 'Dig Depth', value: '15 ft 2 in' },
    { icon: 'local_gas_station', label: 'Fuel Type', value: 'Diesel' },
  ];

  const products: Omit<Product, 'id' | 'createdAt'>[] = [
    {
      name: 'CAT 320 Excavator', brand: 'Caterpillar', sku: 'CAT-320-01', category: 'Heavy Machinery',
      description: 'Standard heavy-duty excavator suitable for large scale earthmoving and construction projects. Maintained to OEM standards for reliable on-site performance.',
      status: 'available', hourly: 85, daily: 650, weekly: 3200, monthly: 11500, deposit: 1000, quantity: 2, rating: 4.9, reviews: 124,
      image: '/images/products/cat-320-excavator.jpg',
      gallery: ['/images/products/cat-320-excavator.jpg', '/images/products/cat-320-excavator-alt.jpg'],
      specs: machineSpecs, attachments: standardAtt,
    },
    {
      name: 'Toyota Forklift 8FGU25', brand: 'Toyota', sku: 'TOY-8FG-25', category: 'Warehouse',
      description: 'Versatile indoor/outdoor warehouse lift with 5,000 lb capacity and pneumatic tires. Ideal for loading docks and yards.',
      status: 'low-stock', hourly: 45, daily: 280, weekly: 1150, monthly: 4200, deposit: 300, quantity: 1, rating: 4.7, reviews: 88,
      image: '/images/products/toyota-forklift.jpg',
      gallery: ['/images/products/toyota-forklift.jpg', '/images/products/toyota-forklift-alt.jpg'],
      specs: [{ icon: 'weight', label: 'Capacity', value: '5,000 lbs' }, { icon: 'height', label: 'Lift Height', value: '189 in' }, { icon: 'bolt', label: 'Power', value: 'LPG' }, { icon: 'straighten', label: 'Turn Radius', value: '87 in' }],
      attachments: [{ id: 'standard', label: 'Standard Forks', price: 0 }, { id: 'sideshift', label: 'Side Shifter', price: 40 }, { id: 'clamp', label: 'Paper Clamp', price: 65 }],
    },
    {
      name: 'Industrial Generator 50kW', brand: 'Caterpillar', sku: 'CAT-GEN-50', category: 'Power',
      description: 'Portable 50kW diesel generator for remote site power needs. Reliable and fuel efficient with sound-attenuated enclosure.',
      status: 'available', hourly: 0, daily: 150, weekly: 600, monthly: 2100, deposit: 400, quantity: 3, rating: 4.8, reviews: 61,
      image: '/images/products/generator-caterpillar.jpg',
      gallery: ['/images/products/generator-caterpillar.jpg', '/images/products/generator-alt.jpg'],
      specs: [{ icon: 'bolt', label: 'Output', value: '50 kW' }, { icon: 'local_gas_station', label: 'Fuel Type', value: 'Diesel' }, { icon: 'volume_down', label: 'Noise', value: '68 dBA' }, { icon: 'schedule', label: 'Runtime', value: '24 hrs' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }, { id: 'cables', label: 'Cable Set 50ft', price: 25 }],
    },
    {
      name: 'Concrete Mixer 350L', brand: 'Komatsu', sku: 'KOM-CM-350', category: 'Scaffolding',
      description: 'High-capacity drum mixer for ready-mix concrete preparation on commercial sites. Electric start with heavy-duty gearbox.',
      status: 'available', hourly: 25, daily: 120, weekly: 500, monthly: 1800, deposit: 200, quantity: 4, rating: 4.6, reviews: 43,
      image: '/images/products/concrete-mixer.jpg',
      gallery: ['/images/products/concrete-mixer.jpg', '/images/products/concrete-mixer-alt.jpg'],
      specs: [{ icon: 'water_drop', label: 'Drum Volume', value: '350 L' }, { icon: 'bolt', label: 'Motor', value: '2.2 kW' }, { icon: 'rotate_right', label: 'Drum Speed', value: '28 rpm' }, { icon: 'weight', label: 'Weight', value: '310 lbs' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }],
    },
    {
      name: 'Aerial Work Platform', brand: 'Genie', sku: 'GEN-AWP-30', category: 'Scaffolding',
      description: 'Self-propelled scissor lift, 30 ft reach, electric powered for indoor use. Non-marking tires and proportional controls.',
      status: 'available', hourly: 60, daily: 400, weekly: 1800, monthly: 6400, deposit: 700, quantity: 1, rating: 4.9, reviews: 77,
      image: '/images/products/genie-scissor-lift.jpg',
      gallery: ['/images/products/genie-scissor-lift.jpg', '/images/products/genie-scissor-lift-alt.jpg'],
      specs: [{ icon: 'height', label: 'Platform Height', value: '30 ft' }, { icon: 'weight', label: 'Capacity', value: '500 lbs' }, { icon: 'bolt', label: 'Power', value: 'Electric' }, { icon: 'straighten', label: 'Width', value: '32 in' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }, { id: 'rail', label: 'Extension Deck', price: 30 }],
    },
    {
      name: 'Telehandler JCB 535', brand: 'JCB', sku: 'JCB-535-95', category: 'Heavy Machinery',
      description: 'Versatile 3.5 tonne reach truck with 5.5m lift height, ideal for farm and construction. Smooth hydrostatic drive.',
      status: 'available', hourly: 70, daily: 480, weekly: 2100, monthly: 7600, deposit: 850, quantity: 2, rating: 4.8, reviews: 52,
      image: '/images/products/jcb-telehandler.jpg',
      gallery: ['/images/products/jcb-telehandler.jpg', '/images/products/jcb-telehandler-alt.jpg'],
      specs: [{ icon: 'height', label: 'Lift Height', value: '5.5 m' }, { icon: 'weight', label: 'Capacity', value: '3.5 t' }, { icon: 'speed', label: 'Engine', value: '109 HP' }, { icon: 'local_gas_station', label: 'Fuel', value: 'Diesel' }],
      attachments: standardAtt,
    },
    {
      name: 'Aeron Executive Chair', brand: 'Herman Miller', sku: 'HM-AER-01', category: 'Furniture',
      description: 'Ergonomic office seating with PostureFit SL support. Graphite finish, size B. Perfect for event offices and staging.',
      status: 'available', hourly: 0, daily: 45, weekly: 210, monthly: 720, deposit: 100, quantity: 20, rating: 4.9, reviews: 210,
      image: '/images/products/aeron-chair.jpg',
      gallery: ['/images/products/aeron-chair.jpg', '/images/products/aeron-chair-alt.jpg'],
      specs: [{ icon: 'chair', label: 'Material', value: 'Pellicle Mesh' }, { icon: 'straighten', label: 'Size', value: 'B (Medium)' }, { icon: 'settings', label: 'Tilt', value: 'PostureFit' }, { icon: 'palette', label: 'Colour', value: 'Graphite' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }],
    },
    {
      name: 'Sony A7R IV Camera Kit', brand: 'Sony', sku: 'SON-A7R-04', category: 'Electronics',
      description: '61MP full-frame mirrorless camera with 24-70mm G Master lens. Ships with two batteries, charger and a 128GB card.',
      status: 'available', hourly: 0, daily: 85, weekly: 480, monthly: 1500, deposit: 800, quantity: 3, rating: 5.0, reviews: 134,
      image: '/images/products/sony-a7r-iv.jpg',
      gallery: ['/images/products/sony-a7r-iv.jpg', '/images/products/sony-a7r-iv-alt.jpg'],
      specs: [{ icon: 'photo_camera', label: 'Sensor', value: '61 MP' }, { icon: 'videocam', label: 'Video', value: '8K 24p' }, { icon: 'lens', label: 'Lens', value: '24-70 GM' }, { icon: 'sd_card', label: 'Storage', value: '128 GB' }],
      attachments: [{ id: 'standard', label: 'Body + Kit Lens', price: 0 }, { id: 'tripod', label: 'Pro Tripod', price: 20 }, { id: 'gimbal', label: 'Gimbal', price: 45 }],
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, brand, sku, category, description, status, hourly, daily, weekly, monthly, deposit, quantity, rating, reviews, image, gallery, specs, attachments)
    VALUES (@name, @brand, @sku, @category, @description, @status, @hourly, @daily, @weekly, @monthly, @deposit, @quantity, @rating, @reviews, @image, @gallery, @specs, @attachments)
  `);
  const insertMany = db.transaction((rows: typeof products) => {
    for (const p of rows) {
      insertProduct.run({
        ...p,
        gallery: JSON.stringify(p.gallery),
        specs: JSON.stringify(p.specs),
        attachments: JSON.stringify(p.attachments),
      });
    }
  });
  insertMany(products);

  // Seed orders with real dates relative to today: one overdue, one active,
  // one upcoming reservation, one returned.
  type SeedOrder = {
    id: string; groupId: string; productId: number; item: string; customerName: string;
    email: string; phone: string; status: OrderStatus; startAt: string; endAt: string;
    returnedAt: string | null; days: number; rate: number; deposit: number; lateFee: number; refund: number;
    deliveryMethod: string; address: string; notes: string;
  };
  const mk = (o: SeedOrder) => {
    const subtotal = o.rate * o.days;
    const waiver = 75;
    const tax = Math.round((subtotal + waiver) * 0.08);
    return {
      ...o,
      addonLabel: 'Standard',
      subtotal, waiver, discount: 0, tax,
      total: subtotal + waiver + tax + o.deposit,
      promoCode: '',
    };
  };
  const orders = [
    mk({ id: 'ORD-0942', groupId: 'GRP-0942', productId: 8, item: 'Sony A7R IV Camera Kit', customerName: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 019-2834', status: 'active', startAt: isoDaysFromNow(-8), endAt: isoDaysFromNow(-3), returnedAt: null, days: 5, rate: 85, deposit: 800, lateFee: 0, refund: 0, deliveryMethod: 'pickup', address: '', notes: '' }),
    mk({ id: 'ORD-0941', groupId: 'GRP-0941', productId: 7, item: 'Aeron Executive Chair', customerName: 'Michael Chen', email: 'michael.c@example.com', phone: '+1 (555) 204-8812', status: 'active', startAt: isoDaysFromNow(-2), endAt: isoDaysFromNow(4), returnedAt: null, days: 6, rate: 45, deposit: 100, lateFee: 0, refund: 0, deliveryMethod: 'delivery', address: '88 Market St', notes: '' }),
    mk({ id: 'ORD-0940', groupId: 'GRP-0940', productId: 1, item: 'CAT 320 Excavator', customerName: 'Elena Rostova', email: 'elena.r@example.com', phone: '+1 (555) 981-0034', status: 'reserved', startAt: isoDaysFromNow(2), endAt: isoDaysFromNow(10), returnedAt: null, days: 8, rate: 650, deposit: 1000, lateFee: 0, refund: 0, deliveryMethod: 'delivery', address: 'Site 4, Office Park', notes: 'Crane access required' }),
    mk({ id: 'ORD-0939', groupId: 'GRP-0939', productId: 2, item: 'Toyota Forklift 8FGU25', customerName: 'James Park', email: 'james.p@example.com', phone: '+1 (555) 330-7721', status: 'returned', startAt: isoDaysFromNow(-10), endAt: isoDaysFromNow(-5), returnedAt: isoDaysFromNow(-5), days: 5, rate: 280, deposit: 300, lateFee: 0, refund: 300, deliveryMethod: 'pickup', address: '', notes: '' }),
  ];
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, groupId, productId, item, customerName, email, phone, status, startAt, endAt, returnedAt, days, rate, addonLabel, subtotal, waiver, discount, tax, deposit, lateFee, refund, total, promoCode, deliveryMethod, address, notes)
    VALUES (@id, @groupId, @productId, @item, @customerName, @email, @phone, @status, @startAt, @endAt, @returnedAt, @days, @rate, @addonLabel, @subtotal, @waiver, @discount, @tax, @deposit, @lateFee, @refund, @total, @promoCode, @deliveryMethod, @address, @notes)
  `);
  const insertOrders = db.transaction((rows: typeof orders) => {
    for (const o of rows) insertOrder.run(o);
  });
  insertOrders(orders);
}
