import { NextResponse } from 'next/server';
import { getDb, rowToOrder } from '@/lib/db';
import type { OrderStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rowToOrder(row));
}

// Valid lifecycle transitions.
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  reserved: ['active', 'cancelled'],
  active: ['returned'],
  returned: [],
  cancelled: [],
};

// PATCH /api/orders/[id] — lifecycle actions and note edits.
// Body: { action: 'pickup' | 'return' | 'cancel', lateFee?, notes? } or { notes }
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const order = rowToOrder(existing);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const action = body.action as string | undefined;
  const sets: string[] = [];
  const values: Record<string, unknown> = { id };

  if (action) {
    const target: OrderStatus | null =
      action === 'pickup' ? 'active' :
      action === 'return' ? 'returned' :
      action === 'cancel' ? 'cancelled' : null;
    if (!target) return NextResponse.json({ error: `Unknown action "${action}".` }, { status: 400 });
    if (!TRANSITIONS[order.status].includes(target)) {
      return NextResponse.json(
        { error: `Cannot ${action} an order that is ${order.status}.` },
        { status: 409 },
      );
    }

    sets.push('status = @status');
    values.status = target;

    if (target === 'returned') {
      const lateFee = Number(body.lateFee);
      if (!Number.isFinite(lateFee) || lateFee < 0) {
        return NextResponse.json({ error: 'Late fee must be a number ≥ 0.' }, { status: 400 });
      }
      if (lateFee > order.deposit) {
        return NextResponse.json(
          { error: `Late fee cannot exceed the held deposit (₹${order.deposit}).` },
          { status: 400 },
        );
      }
      sets.push('lateFee = @lateFee', 'refund = @refund', 'returnedAt = @returnedAt');
      values.lateFee = lateFee;
      values.refund = Math.max(0, order.deposit - lateFee);
      values.returnedAt = new Date().toISOString();
    }
  }

  if (body.notes !== undefined) {
    sets.push('notes = @notes');
    values.notes = String(body.notes);
  }

  if (!sets.length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = @id`).run(values);
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  return NextResponse.json(rowToOrder(row));
}
