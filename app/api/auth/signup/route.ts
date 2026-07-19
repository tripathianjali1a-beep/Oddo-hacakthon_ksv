import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToUser } from '@/lib/db';
import { pgRowToUser } from '@/lib/db-pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let name: string, email: string, password: string, role: string;
  try {
    const body = await request.json();
    name = body.name; email = body.email; password = body.password; role = body.role;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!name || !email || !password)
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });

  const { mode, sqlite, pg, release } = await getClient();
  try {
    const emailLower = String(email).toLowerCase();
    const userRole = role === 'vendor' ? 'vendor' : role === 'admin' ? 'admin' : 'customer';

    if (mode === 'sqlite' && sqlite) {
      const existing = sqlite.prepare('SELECT id FROM users WHERE email = ?').get(emailLower);
      if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      const info = sqlite.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
        .run(name, emailLower, password, userRole);
      const row = sqlite.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      return NextResponse.json({ ok: true, user: rowToUser(row) }, { status: 201 });
    }

    // PostgreSQL
    const { rows: existing } = await pg!.query('SELECT id FROM users WHERE email = $1', [emailLower]);
    if (existing.length) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    const { rows } = await pg!.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, emailLower, password, userRole]
    );
    return NextResponse.json({ ok: true, user: pgRowToUser(rows[0]) }, { status: 201 });
  } catch (err) {
    console.error('[signup]', err);
    return NextResponse.json({ error: 'Server error during signup' }, { status: 500 });
  } finally {
    release();
  }
}
