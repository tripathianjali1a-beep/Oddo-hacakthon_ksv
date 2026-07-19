import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToUser } from '@/lib/db';
import { pgRowToUser } from '@/lib/db-pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let email: string, password: string;
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password)
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

  const { mode, sqlite, pg, release } = await getClient();
  try {
    const emailLower = String(email).toLowerCase();

    if (mode === 'sqlite' && sqlite) {
      const row = sqlite.prepare('SELECT * FROM users WHERE email = ?').get(emailLower) as
        | { id: number; name: string; email: string; password: string; role: string; createdAt: string }
        | undefined;
      if (!row || row.password !== password)
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      return NextResponse.json({ ok: true, user: rowToUser(row) });
    }

    // PostgreSQL
    const { rows } = await pg!.query('SELECT * FROM users WHERE email = $1', [emailLower]);
    const row = rows[0];
    if (!row || row.password !== password)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    return NextResponse.json({ ok: true, user: pgRowToUser(row) });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
  } finally {
    release();
  }
}
