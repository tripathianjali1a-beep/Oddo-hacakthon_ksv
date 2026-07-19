import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToProduct } from '@/lib/db';
import { pgRowToProduct } from '@/lib/db-pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const row = sqlite.prepare('SELECT * FROM products WHERE id = ?').get(Number(id));
      if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(rowToProduct(row));
    }
    const { rows } = await pg!.query('SELECT * FROM products WHERE id = $1', [Number(id)]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pgRowToProduct(rows[0]));
  } finally { release(); }
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const existing = sqlite.prepare('SELECT id FROM products WHERE id = ?').get(Number(id));
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const fields = ['name','brand','sku','category','description','status','hourly','daily','weekly','monthly','deposit','quantity','rating','reviews','image'];
      const sets: string[] = []; const values: Record<string, unknown> = { id: Number(id) };
      for (const f of fields) if (body[f] !== undefined) { sets.push(`${f} = @${f}`); values[f] = body[f]; }
      for (const f of ['gallery','specs','attachments'] as const) if (body[f] !== undefined) { sets.push(`${f} = @${f}`); values[f] = JSON.stringify(body[f]); }
      if (sets.length) sqlite.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = @id`).run(values);
      return NextResponse.json(rowToProduct(sqlite.prepare('SELECT * FROM products WHERE id = ?').get(Number(id))));
    }
    // PG
    const { rows: ex } = await pg!.query('SELECT id FROM products WHERE id = $1', [Number(id)]);
    if (!ex[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const fields = ['name','brand','sku','category','description','status','hourly','daily','weekly','monthly','deposit','quantity','rating','reviews','image'];
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    for (const f of fields) if (body[f] !== undefined) { sets.push(`${f} = $${i++}`); vals.push(body[f]); }
    for (const f of ['gallery','specs','attachments']) if (body[f] !== undefined) { sets.push(`${f} = $${i++}`); vals.push(JSON.stringify(body[f])); }
    if (sets.length) { vals.push(Number(id)); await pg!.query(`UPDATE products SET ${sets.join(', ')} WHERE id = $${i}`, vals); }
    const { rows } = await pg!.query('SELECT * FROM products WHERE id = $1', [Number(id)]);
    return NextResponse.json(pgRowToProduct(rows[0]));
  } finally { release(); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const info = sqlite.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
      if (info.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    const { rowCount } = await pg!.query('DELETE FROM products WHERE id = $1', [Number(id)]);
    if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } finally { release(); }
}
