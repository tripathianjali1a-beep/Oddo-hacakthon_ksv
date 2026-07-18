import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Product, Order, User, ProductStatus, OrderStatus } from './types';

// ────────────────────────────────────────────────────────────
// Local SQLite database. File lives in .data/luxrent.db (git-ignored).
// A single shared connection is cached across hot reloads.
// ────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'luxrent.db');

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
  upsert.run({ name: 'Demo Vendor', email: 'vendor@luxrent.com', password: 'admin', role: 'vendor' });
  upsert.run({ name: 'Demo Customer', email: 'customer@luxrent.com', password: 'customer', role: 'customer' });
}

export function getDb(): Database.Database {
  if (!global.__luxrentDb) {
    global.__luxrentDb = createConnection();
  }
  return global.__luxrentDb;
}

// ── Schema ──────────────────────────────────────────────────
function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      sku TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'available',
      hourly REAL NOT NULL DEFAULT 0,
      daily REAL NOT NULL DEFAULT 0,
      weekly REAL NOT NULL DEFAULT 0,
      monthly REAL NOT NULL DEFAULT 0,
      deposit REAL NOT NULL DEFAULT 0,
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
      productId INTEGER,
      item TEXT NOT NULL DEFAULT '',
      customerName TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      pickupDate TEXT NOT NULL DEFAULT '',
      dueDate TEXT NOT NULL DEFAULT '',
      days INTEGER NOT NULL DEFAULT 1,
      rate REAL NOT NULL DEFAULT 0,
      deposit REAL NOT NULL DEFAULT 0,
      lateFee REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      late INTEGER NOT NULL DEFAULT 0,
      deliveryMethod TEXT NOT NULL DEFAULT 'pickup',
      address TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
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
  `);
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
  return {
    id: r.id,
    productId: r.productId,
    item: r.item,
    customerName: r.customerName,
    email: r.email,
    phone: r.phone,
    status: r.status as OrderStatus,
    pickupDate: r.pickupDate,
    dueDate: r.dueDate,
    days: r.days,
    rate: r.rate,
    deposit: r.deposit,
    lateFee: r.lateFee,
    total: r.total,
    late: !!r.late,
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
  const row = db.prepare(`SELECT id FROM orders ORDER BY id DESC LIMIT 1`).get() as { id: string } | undefined;
  const last = row ? parseInt(row.id.replace(/\D/g, ''), 10) : 940;
  return `ORD-${String(last + 1).padStart(4, '0')}`;
}

// ── Seed data ───────────────────────────────────────────────
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
      status: 'available', hourly: 85, daily: 650, weekly: 3200, monthly: 11500, deposit: 1000, rating: 4.9, reviews: 124,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=600&q=80'],
      specs: machineSpecs, attachments: standardAtt,
    },
    {
      name: 'Toyota Forklift 8FGU25', brand: 'Toyota', sku: 'TOY-8FG-25', category: 'Warehouse',
      description: 'Versatile indoor/outdoor warehouse lift with 5,000 lb capacity and pneumatic tires. Ideal for loading docks and yards.',
      status: 'low-stock', hourly: 45, daily: 280, weekly: 1150, monthly: 4200, deposit: 300, rating: 4.7, reviews: 88,
      image: 'https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1605731009813-8e0a0b2c2f4b?w=800&q=80'],
      specs: [{ icon: 'weight', label: 'Capacity', value: '5,000 lbs' }, { icon: 'height', label: 'Lift Height', value: '189 in' }, { icon: 'bolt', label: 'Power', value: 'LPG' }, { icon: 'straighten', label: 'Turn Radius', value: '87 in' }],
      attachments: [{ id: 'standard', label: 'Standard Forks', price: 0 }, { id: 'sideshift', label: 'Side Shifter', price: 40 }, { id: 'clamp', label: 'Paper Clamp', price: 65 }],
    },
    {
      name: 'Industrial Generator 50kW', brand: 'Caterpillar', sku: 'CAT-GEN-50', category: 'Power',
      description: 'Portable 50kW diesel generator for remote site power needs. Reliable and fuel efficient with sound-attenuated enclosure.',
      status: 'available', hourly: 0, daily: 150, weekly: 600, monthly: 2100, deposit: 400, rating: 4.8, reviews: 61,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'],
      specs: [{ icon: 'bolt', label: 'Output', value: '50 kW' }, { icon: 'local_gas_station', label: 'Fuel Type', value: 'Diesel' }, { icon: 'volume_down', label: 'Noise', value: '68 dBA' }, { icon: 'schedule', label: 'Runtime', value: '24 hrs' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }, { id: 'cables', label: 'Cable Set 50ft', price: 25 }],
    },
    {
      name: 'Concrete Mixer 350L', brand: 'Komatsu', sku: 'KOM-CM-350', category: 'Scaffolding',
      description: 'High-capacity drum mixer for ready-mix concrete preparation on commercial sites. Electric start with heavy-duty gearbox.',
      status: 'available', hourly: 25, daily: 120, weekly: 500, monthly: 1800, deposit: 200, rating: 4.6, reviews: 43,
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'],
      specs: [{ icon: 'water_drop', label: 'Drum Volume', value: '350 L' }, { icon: 'bolt', label: 'Motor', value: '2.2 kW' }, { icon: 'rotate_right', label: 'Drum Speed', value: '28 rpm' }, { icon: 'weight', label: 'Weight', value: '310 lbs' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }],
    },
    {
      name: 'Aerial Work Platform', brand: 'Genie', sku: 'GEN-AWP-30', category: 'Scaffolding',
      description: 'Self-propelled scissor lift, 30 ft reach, electric powered for indoor use. Non-marking tires and proportional controls.',
      status: 'booked', hourly: 60, daily: 400, weekly: 1800, monthly: 6400, deposit: 700, rating: 4.9, reviews: 77,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
      specs: [{ icon: 'height', label: 'Platform Height', value: '30 ft' }, { icon: 'weight', label: 'Capacity', value: '500 lbs' }, { icon: 'bolt', label: 'Power', value: 'Electric' }, { icon: 'straighten', label: 'Width', value: '32 in' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }, { id: 'rail', label: 'Extension Deck', price: 30 }],
    },
    {
      name: 'Telehandler JCB 535', brand: 'JCB', sku: 'JCB-535-95', category: 'Heavy Machinery',
      description: 'Versatile 3.5 tonne reach truck with 5.5m lift height, ideal for farm and construction. Smooth hydrostatic drive.',
      status: 'available', hourly: 70, daily: 480, weekly: 2100, monthly: 7600, deposit: 850, rating: 4.8, reviews: 52,
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'],
      specs: [{ icon: 'height', label: 'Lift Height', value: '5.5 m' }, { icon: 'weight', label: 'Capacity', value: '3.5 t' }, { icon: 'speed', label: 'Engine', value: '109 HP' }, { icon: 'local_gas_station', label: 'Fuel', value: 'Diesel' }],
      attachments: standardAtt,
    },
    {
      name: 'Aeron Executive Chair', brand: 'Herman Miller', sku: 'HM-AER-01', category: 'Furniture',
      description: 'Ergonomic office seating with PostureFit SL support. Graphite finish, size B. Perfect for event offices and staging.',
      status: 'available', hourly: 0, daily: 45, weekly: 210, monthly: 720, deposit: 100, rating: 4.9, reviews: 210,
      image: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80'],
      specs: [{ icon: 'chair', label: 'Material', value: 'Pellicle Mesh' }, { icon: 'straighten', label: 'Size', value: 'B (Medium)' }, { icon: 'settings', label: 'Tilt', value: 'PostureFit' }, { icon: 'palette', label: 'Colour', value: 'Graphite' }],
      attachments: [{ id: 'standard', label: 'Standard', price: 0 }],
    },
    {
      name: 'Sony A7R V Camera Kit', brand: 'Sony', sku: 'SON-A7R-05', category: 'Electronics',
      description: '61MP full-frame mirrorless camera with 24-70mm G Master lens. Ships with two batteries, charger and a 128GB card.',
      status: 'available', hourly: 0, daily: 85, weekly: 480, monthly: 1500, deposit: 800, rating: 5.0, reviews: 134,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80'],
      specs: [{ icon: 'photo_camera', label: 'Sensor', value: '61 MP' }, { icon: 'videocam', label: 'Video', value: '8K 24p' }, { icon: 'lens', label: 'Lens', value: '24-70 GM' }, { icon: 'sd_card', label: 'Storage', value: '128 GB' }],
      attachments: [{ id: 'standard', label: 'Body + Kit Lens', price: 0 }, { id: 'tripod', label: 'Pro Tripod', price: 20 }, { id: 'gimbal', label: 'Gimbal', price: 45 }],
    },
  ];

  const insertProduct = db.prepare(`
    INSERT INTO products (name, brand, sku, category, description, status, hourly, daily, weekly, monthly, deposit, rating, reviews, image, gallery, specs, attachments)
    VALUES (@name, @brand, @sku, @category, @description, @status, @hourly, @daily, @weekly, @monthly, @deposit, @rating, @reviews, @image, @gallery, @specs, @attachments)
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

  // Seed orders
  const orders: Omit<Order, 'createdAt'>[] = [
    { id: 'ORD-0942', productId: 8, item: 'Sony A7R V Camera Kit', customerName: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '+1 (555) 019-2834', status: 'pending', pickupDate: 'Oct 12, 2024', dueDate: 'Today', days: 5, rate: 85, deposit: 500, lateFee: 0, total: 925, late: true, deliveryMethod: 'pickup', address: '', notes: '' },
    { id: 'ORD-0941', productId: 7, item: 'Aeron Executive Chair', customerName: 'Michael Chen', email: 'michael.c@example.com', phone: '+1 (555) 204-8812', status: 'active', pickupDate: 'Oct 18, 2024', dueDate: 'Oct 24, 2024', days: 6, rate: 45, deposit: 800, lateFee: 0, total: 1070, late: false, deliveryMethod: 'delivery', address: '88 Market St', notes: '' },
    { id: 'ORD-0940', productId: 1, item: 'CAT 320 Excavator', customerName: 'Elena Rostova', email: 'elena.r@example.com', phone: '+1 (555) 981-0034', status: 'active', pickupDate: 'Oct 20, 2024', dueDate: 'Oct 28, 2024', days: 8, rate: 650, deposit: 1000, lateFee: 0, total: 6200, late: false, deliveryMethod: 'delivery', address: 'Site 4, Office Park', notes: 'Crane access required' },
    { id: 'ORD-0939', productId: 2, item: 'Toyota Forklift 8FGU25', customerName: 'James Park', email: 'james.p@example.com', phone: '+1 (555) 330-7721', status: 'returned', pickupDate: 'Oct 10, 2024', dueDate: 'Oct 15, 2024', days: 5, rate: 280, deposit: 300, lateFee: 0, total: 1700, late: false, deliveryMethod: 'pickup', address: '', notes: '' },
  ];
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, productId, item, customerName, email, phone, status, pickupDate, dueDate, days, rate, deposit, lateFee, total, late, deliveryMethod, address, notes)
    VALUES (@id, @productId, @item, @customerName, @email, @phone, @status, @pickupDate, @dueDate, @days, @rate, @deposit, @lateFee, @total, @late, @deliveryMethod, @address, @notes)
  `);
  const insertOrders = db.transaction((rows: typeof orders) => {
    for (const o of rows) insertOrder.run({ ...o, late: o.late ? 1 : 0 });
  });
  insertOrders(orders);

  // Seed demo users
  const insertUser = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
  insertUser.run('Demo Customer', 'customer@luxrent.com', 'customer', 'customer');
  insertUser.run('Demo Vendor', 'vendor@luxrent.com', 'admin', 'vendor');
}
