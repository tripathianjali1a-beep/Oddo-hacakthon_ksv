import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { priceQuote, QuoteError } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/quotes — price a set of rental lines server-side.
// Body: { lines: [{ productId, attachmentId?, startAt, endAt }], promoCode? }
export async function POST(request: Request) {
  const db = getDb();
  let body: { lines?: unknown; promoCode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const quote = priceQuote(
      db,
      Array.isArray(body.lines) ? body.lines : [],
      typeof body.promoCode === 'string' ? body.promoCode : undefined,
    );
    return NextResponse.json(quote);
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
