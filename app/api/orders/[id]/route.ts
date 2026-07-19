/**
 * ============================================================================
 * Rentora Order Operations & State Transition Gateway (`/api/orders/[id]`)
 * ============================================================================
 * Why this file is vital for explaining to judges:
 * This endpoint governs the lifecycle of an existing order after checkout.
 * Store staff use this API to execute physical operations: picking up assets,
 * inspecting/returning items, and settling security deposits against late fees.
 *
 * Key Architectural Highlights:
 * 1. Finite State Machine (FSM) Enforcement: The `TRANSITIONS` table explicitly
 *    maps allowed state mutations. If staff try to pick up an order that is
 *    already 'returned' or 'cancelled', the API rejects it with HTTP 409.
 * 2. Automated Financial Settlement on Return: When action === 'return', we compare
 *    the assessed `lateFee` against the customer's upfront `deposit`.
 *    The net `refund = max(0, deposit - lateFee)` is automatically computed!
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToOrder } from '@/lib/db';
import { pgRowToOrder } from '@/lib/db-pg';
import type { OrderStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

/**
 * Valid FSM Transition Table:
 * - 'reserved': Can transition to 'active' (customer picks up) or 'cancelled'.
 * - 'active': Can transition to 'returned' (customer brings asset back to store).
 * - 'returned' / 'cancelled': Terminal states. No further transitions permitted.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  reserved: ['active', 'cancelled'],
  active: ['returned'],
  returned: [],
  cancelled: [],
};

// ============================================================================
// GET /api/orders/[id] — Retrieve Single Order with Derived Overdue Status
// ============================================================================
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const row = sqlite.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json(rowToOrder(row as any));
    }
    const { rows } = await pg!.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pgRowToOrder(rows[0]));
  } finally { release(); }
}

// ============================================================================
// PATCH /api/orders/[id] — Execute State Transitions & Settle Security Deposits
// ============================================================================
export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { mode, sqlite, pg, release } = await getClient();
  try {
    // ── 1. Fetch Existing Order State ────────────────────────
    let order;
    if (mode === 'sqlite' && sqlite) {
      const row = sqlite.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order = rowToOrder(row as any);
    } else {
      const { rows } = await pg!.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      order = pgRowToOrder(rows[0]);
    }

    const action = body.action as string | undefined;
    const sets: string[] = []; const values: Record<string, unknown> = { id };
    const pgSets: string[] = []; const pgVals: unknown[] = []; let pi = 1;

    // ── 2. Validate & Execute Action Transition ──────────────
    if (action) {
      const target: OrderStatus | null =
        action === 'pickup' ? 'active' :
        action === 'return' ? 'returned' :
        action === 'cancel' ? 'cancelled' : null;
        
      if (!target) return NextResponse.json({ error: `Unknown action "${action}".` }, { status: 400 });
      
      // Enforce transition guard:
      if (!TRANSITIONS[order.status].includes(target))
        return NextResponse.json({ error: `Cannot ${action} an order that is ${order.status}.` }, { status: 409 });

      sets.push('status = @status'); values.status = target;
      pgSets.push(`status = $${pi++}`); pgVals.push(target);

      // ── 3. Handle Return Settlement & Late Fee Deduction ───
      if (target === 'returned') {
        const lateFee = Number(body.lateFee);
        if (!Number.isFinite(lateFee) || lateFee < 0)
          return NextResponse.json({ error: 'Late fee must be ≥ 0.' }, { status: 400 });
        if (lateFee > order.deposit)
          return NextResponse.json({ error: `Late fee cannot exceed deposit (₹${order.deposit}).` }, { status: 400 });
          
        // Net refundable deposit to customer:
        const refund = Math.max(0, order.deposit - lateFee);
        const returnedAt = new Date().toISOString();
        
        sets.push('"lateFee" = @lateFee', 'refund = @refund', '"returnedAt" = @returnedAt');
        Object.assign(values, { lateFee, refund, returnedAt });
        
        pgSets.push(`"lateFee" = $${pi++}`, `refund = $${pi++}`, `"returnedAt" = $${pi++}`);
        pgVals.push(lateFee, refund, returnedAt);
      }
    }

    // Optional staff notes update:
    if (body.notes !== undefined) {
      sets.push('notes = @notes'); values.notes = String(body.notes);
      pgSets.push(`notes = $${pi++}`); pgVals.push(String(body.notes));
    }

    if (!sets.length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

    // ── 4. Persist Mutation & Return Updated Order ───────────
    if (mode === 'sqlite' && sqlite) {
      sqlite.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = @id`).run(values);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json(rowToOrder(sqlite.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any));
    }
    pgVals.push(id);
    await pg!.query(`UPDATE orders SET ${pgSets.join(', ')} WHERE id = $${pi}`, pgVals);
    const { rows } = await pg!.query('SELECT * FROM orders WHERE id = $1', [id]);
    return NextResponse.json(pgRowToOrder(rows[0]));
  } finally { release(); }
}

