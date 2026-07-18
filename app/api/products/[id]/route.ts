import { NextResponse } from 'next/server';
import { getDb, rowToProduct } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rowToProduct(row));
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const fields = ['name', 'brand', 'sku', 'category', 'description', 'status', 'hourly', 'daily', 'weekly', 'monthly', 'deposit', 'quantity', 'rating', 'reviews', 'image'];
  const sets: string[] = [];
  const values: Record<string, unknown> = { id: Number(id) };
  for (const f of fields) {
    if (body[f] !== undefined) { sets.push(`${f} = @${f}`); values[f] = body[f]; }
  }
  for (const f of ['gallery', 'specs', 'attachments'] as const) {
    if (body[f] !== undefined) { sets.push(`${f} = @${f}`); values[f] = JSON.stringify(body[f]); }
  }
  if (sets.length) db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = @id`).run(values);

  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
  return NextResponse.json(rowToProduct(row));
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const info = db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
  if (info.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
