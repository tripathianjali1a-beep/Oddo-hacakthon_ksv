import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToOrder } from '@/lib/db';
import { pgRowToOrder } from '@/lib/db-pg';
import type { DashboardData, Order } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function relTime(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

function buildDashboard(orders: Order[]): DashboardData {
  const nowIso = new Date().toISOString();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthStartIso = monthStart.toISOString();
  const active = orders.filter((o) => o.status === 'active');
  const overdue = active.filter((o) => o.late);
  const held = orders.filter((o) => o.status === 'active' || o.status === 'reserved');
  const revenueMtd = orders.filter((o) => o.status !== 'cancelled' && o.createdAt >= monthStartIso).reduce((s, o) => s + (o.total - o.deposit), 0);
  const depositsHeld = held.reduce((s, o) => s + o.deposit, 0);
  const attention: Order[] = [...overdue, ...active.filter((o) => !o.late && o.endAt <= new Date(Date.now() + 86_400_000).toISOString())];
  const dayTotals = Array.from({ length: 7 }, (_, i) => {
    const ds = new Date(); ds.setHours(0, 0, 0, 0); ds.setDate(ds.getDate() - (6 - i));
    const de = new Date(ds.getTime() + 86_400_000);
    return orders.filter((o) => o.status !== 'cancelled' && o.createdAt >= ds.toISOString() && o.createdAt < de.toISOString()).reduce((s, o) => s + (o.total - o.deposit), 0);
  });
  const trendMax = Math.max(1, ...dayTotals);
  const revenueTrend = dayTotals.map((t) => Math.round((t / trendMax) * 90) + 5);
  const events: { at: string; icon: string; color: string; text: string }[] = [];
  for (const o of orders) {
    events.push({ at: o.createdAt, icon: 'add_circle', color: 'text-navy', text: `New rental: ${o.item} booked by ${o.customerName} (${o.id})` });
    if (o.status === 'returned' && o.returnedAt) events.push({ at: o.returnedAt, icon: 'assignment_return', color: 'text-slate', text: `Return processed: ${o.item} — ${o.customerName}, ₹${o.refund.toLocaleString()} refunded` });
    if (o.late) events.push({ at: nowIso, icon: 'error', color: 'text-amber', text: `${o.item} is ${o.daysLate} day${o.daysLate !== 1 ? 's' : ''} overdue — ${o.customerName}` });
  }
  events.sort((a, b) => (a.at < b.at ? 1 : -1));
  return {
    kpis: { activeRentals: active.length, overdue: overdue.length, revenueMtd, depositsHeld },
    overdue: attention.map((o) => ({ id: o.id, customer: o.customerName, item: o.item, amount: o.total, daysLate: o.daysLate, badge: o.late ? 'badge-red' : 'badge-amber', badgeLabel: o.late ? 'Overdue' : 'Due Soon' })),
    activity: events.slice(0, 6).map((e) => ({ icon: e.icon, color: e.color, text: e.text, time: relTime(e.at) })),
    revenueTrend,
  };
}

export async function GET() {
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orders = (sqlite.prepare('SELECT * FROM orders').all() as any[]).map(rowToOrder);
      return NextResponse.json(buildDashboard(orders));
    }
    const { rows } = await pg!.query('SELECT * FROM orders');
    const orders = rows.map(pgRowToOrder);
    return NextResponse.json(buildDashboard(orders));
  } finally { release(); }
}
