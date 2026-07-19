import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToUser } from '@/lib/db';
import { pgRowToUser } from '@/lib/db-pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(Number(id));
      if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json(rowToUser(row as any));
    }
    const { rows } = await pg!.query('SELECT * FROM users WHERE id = $1', [Number(id)]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pgRowToUser(rows[0]));
  } finally { release(); }
}

const VALID_ROLES = ['customer', 'vendor', 'admin'];

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const existing = sqlite.prepare('SELECT id FROM users WHERE id = ?').get(Number(id));
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const sets: string[] = []; const values: Record<string, unknown> = { id: Number(id) };
      if (typeof body.name === 'string' && body.name.trim()) { sets.push('name = @name'); values.name = body.name.trim(); }
      if (typeof body.email === 'string' && body.email.trim()) {
        const el = body.email.trim().toLowerCase();
        if (sqlite.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(el, Number(id))) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
        sets.push('email = @email'); values.email = el;
      }
      if (typeof body.password === 'string' && body.password) { sets.push('password = @password'); values.password = body.password; }
      if (typeof body.role === 'string' && VALID_ROLES.includes(body.role)) { sets.push('role = @role'); values.role = body.role; }
      if (!sets.length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
      sqlite.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(values);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json(rowToUser(sqlite.prepare('SELECT * FROM users WHERE id = ?').get(Number(id)) as any));
    }
    // PG
    const { rows: ex } = await pg!.query('SELECT id FROM users WHERE id = $1', [Number(id)]);
    if (!ex[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const sets: string[] = []; const vals: unknown[] = []; let i = 1;
    if (typeof body.name === 'string' && body.name.trim()) { sets.push(`name = $${i++}`); vals.push(body.name.trim()); }
    if (typeof body.email === 'string' && body.email.trim()) {
      const el = body.email.trim().toLowerCase();
      const { rows: c } = await pg!.query('SELECT id FROM users WHERE email = $1 AND id != $2', [el, Number(id)]);
      if (c[0]) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
      sets.push(`email = $${i++}`); vals.push(el);
    }
    if (typeof body.password === 'string' && body.password) { sets.push(`password = $${i++}`); vals.push(body.password); }
    if (typeof body.role === 'string' && VALID_ROLES.includes(body.role)) { sets.push(`role = $${i++}`); vals.push(body.role); }
    if (!sets.length) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    vals.push(Number(id));
    await pg!.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i}`, vals);
    const { rows } = await pg!.query('SELECT * FROM users WHERE id = $1', [Number(id)]);
    return NextResponse.json(pgRowToUser(rows[0]));
  } finally { release(); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      const info = sqlite.prepare('DELETE FROM users WHERE id = ?').run(Number(id));
      if (info.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ok: true });
    }
    const { rowCount } = await pg!.query('DELETE FROM users WHERE id = $1', [Number(id)]);
    if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } finally { release(); }
}
