import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { rowToUser } from '@/lib/db';
import { pgRowToUser } from '@/lib/db-pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { mode, sqlite, pg, release } = await getClient();
  try {
    if (mode === 'sqlite' && sqlite) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return NextResponse.json(sqlite.prepare('SELECT * FROM users ORDER BY id ASC').all().map((r: any) => rowToUser(r)));
    }
    const { rows } = await pg!.query('SELECT * FROM users ORDER BY id ASC');
    return NextResponse.json(rows.map(pgRowToUser));
  } finally { release(); }
}
