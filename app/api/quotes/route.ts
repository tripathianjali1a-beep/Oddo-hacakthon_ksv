/**
 * ============================================================================
 * Rentora Quotation API Bridge (`/api/quotes`)
 * ============================================================================
 * Why this endpoint exists:
 * Whenever the user adjusts dates, selects hardware add-ons, or enters a coupon
 * code in their checkout cart, the frontend hits `POST /api/quotes`.
 *
 * This API bridges the client request to our secure server-side `priceQuote()` engine.
 * It ensures that prices, stock availability, and taxes are calculated safely
 * in backend memory (or PostgreSQL) without ever trusting browser-provided prices.
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { getClient } from '@/lib/db-client';
import { priceQuote, priceQuotePg, QuoteError } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { lines?: unknown; promoCode?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }); }

  const { mode, sqlite, pool, release } = await getClient();
  try {
    const lines = Array.isArray(body.lines) ? body.lines : [];
    const promoCode = typeof body.promoCode === 'string' ? body.promoCode : undefined;
    
    // Dispatch to SQLite or PostgreSQL quotation engine based on active environment:
    const quote = mode === 'sqlite' && sqlite
      ? priceQuote(sqlite, lines, promoCode)
      : await priceQuotePg(pool!, lines, promoCode);
      
    return NextResponse.json(quote);
  } catch (err) {
    // Return clean, human-readable status errors (e.g. 409 when out of stock / 400 invalid date):
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  } finally { release(); }
}

