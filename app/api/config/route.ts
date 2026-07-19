import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const rows = sqlite.prepare('SELECT key, value FROM config').all() as { key: string; value: string }[];
      return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
    }
    const { rows } = await pg!.query('SELECT key, value FROM config');
    return NextResponse.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } finally { release(); }
}

export async function POST(request: Request) {
  let body: Record<string, string>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const upsert = sqlite.prepare(`INSERT INTO config (key, value, updatedAt) VALUES (@key, @value, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = datetime('now')`);
      const tx = sqlite.transaction((entries: [string, string][]) => { for (const [key, value] of entries) upsert.run({ key, value: String(value) }); });
      tx(Object.entries(body));
      return NextResponse.json({ ok: true });
    }
    for (const [key, value] of Object.entries(body)) {
      await pg!.query(`INSERT INTO config (key, value, "updatedAt") VALUES ($1, $2, NOW()) ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()`, [key, String(value)]);
    }
    return NextResponse.json({ ok: true });
  } finally { release(); }
}
