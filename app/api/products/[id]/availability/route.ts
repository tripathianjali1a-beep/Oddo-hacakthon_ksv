import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { availableQuantity } from '@/lib/db';
import { pgAvailableQuantity } from '@/lib/db-pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to   = searchParams.get('to')   || '';
  const start = Date.parse(from);
  const end   = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
    return NextResponse.json({ error: 'Valid from/to dates are required.' }, { status: 400 });

  const startIso = new Date(start).toISOString();
  const endIso   = new Date(end).toISOString();

  const { mode, sqlite, pg, pool, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const product = sqlite.prepare('SELECT id, quantity, status FROM products WHERE id = ?').get(Number(id)) as
        | { id: number; quantity: number; status: string } | undefined;
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const availableQty = product.status === 'draft' ? 0 : availableQuantity(sqlite, product.id, startIso, endIso);
      return NextResponse.json({ productId: product.id, quantity: product.quantity, availableQty, available: availableQty > 0 });
    }
    const { rows } = await pg!.query('SELECT id, quantity, status FROM products WHERE id = $1', [Number(id)]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const p = rows[0];
    const availableQty = p.status === 'draft' ? 0 : await pgAvailableQuantity(pool!, Number(p.id), startIso, endIso);
    return NextResponse.json({ productId: Number(p.id), quantity: Number(p.quantity), availableQty, available: availableQty > 0 });
  } finally { release(); }
}
