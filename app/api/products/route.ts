import { NextResponse } from 'next/server';
import { getDb, rowToProduct } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/products?search=&category=&status=&sort=&all=1
// Drafts are hidden unless all=1 (admin views pass it).
export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase();
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort');
  const includeDrafts = searchParams.get('all') === '1';

  const clauses: string[] = [];
  const params: Record<string, unknown> = {};
  if (!includeDrafts) clauses.push(`status != 'draft'`);
  if (search) {
    clauses.push('(LOWER(name) LIKE @q OR LOWER(brand) LIKE @q OR LOWER(sku) LIKE @q)');
    params.q = `%${search}%`;
  }
  if (category && category !== 'all') { clauses.push('category = @category'); params.category = category; }
  if (status && status !== 'all') { clauses.push('status = @status'); params.status = status; }

  let sql = 'SELECT * FROM products';
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  if (sort === 'price-asc') sql += ' ORDER BY daily ASC';
  else if (sort === 'price-desc') sql += ' ORDER BY daily DESC';
  else sql += ' ORDER BY id ASC';

  const rows = db.prepare(sql).all(params);
  return NextResponse.json(rows.map(rowToProduct));
}

const VALID_STATUS = ['available', 'low-stock', 'booked', 'draft'];

function nonNegative(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// POST /api/products
export async function POST(request: Request) {
  const db = getDb();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  const status = VALID_STATUS.includes(String(body.status)) ? String(body.status) : 'available';

  const info = db.prepare(`
    INSERT INTO products (name, brand, sku, category, description, status, hourly, daily, weekly, monthly, deposit, quantity, rating, reviews, image, gallery, specs, attachments)
    VALUES (@name, @brand, @sku, @category, @description, @status, @hourly, @daily, @weekly, @monthly, @deposit, @quantity, @rating, @reviews, @image, @gallery, @specs, @attachments)
  `).run({
    name: String(body.name).trim(),
    brand: String(body.brand || ''),
    sku: String(body.sku || ''),
    category: String(body.category || 'Furniture'),
    description: String(body.description || ''),
    status,
    hourly: nonNegative(body.hourly),
    daily: nonNegative(body.daily),
    weekly: nonNegative(body.weekly),
    monthly: nonNegative(body.monthly),
    deposit: nonNegative(body.deposit),
    quantity: Math.max(1, Math.round(nonNegative(body.quantity, 1))),
    rating: nonNegative(body.rating, 4.8),
    reviews: Math.round(nonNegative(body.reviews)),
    image: String(body.image || ''),
    gallery: JSON.stringify(body.gallery || []),
    specs: JSON.stringify(body.specs || []),
    attachments: JSON.stringify(body.attachments || [{ id: 'standard', label: 'Standard', price: 0 }]),
  });

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  return NextResponse.json(rowToProduct(row), { status: 201 });
}
