import { NextResponse } from 'next/server';
import { getDb, availableQuantity } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/products/[id]/availability?from=ISO&to=ISO
export async function GET(request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const start = Date.parse(from);
  const end = Date.parse(to);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return NextResponse.json({ error: 'Valid from/to dates are required (to must be after from).' }, { status: 400 });
  }

  const product = db.prepare('SELECT id, quantity, status FROM products WHERE id = ?').get(Number(id)) as
    | { id: number; quantity: number; status: string }
    | undefined;
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const availableQty = product.status === 'draft'
    ? 0
    : availableQuantity(db, product.id, new Date(start).toISOString(), new Date(end).toISOString());

  return NextResponse.json({
    productId: product.id,
    quantity: product.quantity,
    availableQty,
    available: availableQty > 0,
  });
}
