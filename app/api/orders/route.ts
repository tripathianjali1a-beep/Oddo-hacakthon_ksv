import { NextResponse } from 'next/server';
import { getDb, rowToOrder, nextOrderId } from '@/lib/db';
import { priceQuote, QuoteError } from '@/lib/pricing';
import { isRazorpayConfigured, verifyRazorpaySignature, fetchRazorpayOrder } from '@/lib/razorpay';
import type { QuoteLineInput } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/orders?search=&status=
export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase();
  const status = searchParams.get('status');

  const clauses: string[] = [];
  const params: Record<string, unknown> = {};
  if (search) {
    clauses.push('(LOWER(customerName) LIKE @q OR LOWER(item) LIKE @q OR LOWER(id) LIKE @q)');
    params.q = `%${search}%`;
  }
  if (status && status !== 'all') { clauses.push('status = @status'); params.status = status; }

  let sql = 'SELECT * FROM orders';
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  sql += ' ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC';

  const rows = db.prepare(sql).all(params);
  return NextResponse.json(rows.map(rowToOrder));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/orders — place an order (checkout).
// Body: { customerName, email, phone, deliveryMethod, address, notes, promoCode,
//         lines: [{ productId, attachmentId?, startAt, endAt }] }
// All prices are computed server-side; availability is checked atomically.
export async function POST(request: Request) {
  const db = getDb();
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const customerName = String(body.customerName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const deliveryMethod = body.deliveryMethod === 'delivery' ? 'delivery' : 'pickup';
  const address = String(body.address || '').trim();
  const notes = String(body.notes || '').trim();
  const lines = (Array.isArray(body.lines) ? body.lines : []) as QuoteLineInput[];

  if (!customerName) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  if (!phone) return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
  if (deliveryMethod === 'delivery' && !address) {
    return NextResponse.json({ error: 'Delivery address is required for delivery orders.' }, { status: 400 });
  }
  if (lines.length === 0) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });

  // Rentals cannot start in the past (allow anything from the start of today).
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  for (const line of lines) {
    const start = Date.parse(String(line.startAt || ''));
    if (!Number.isFinite(start)) return NextResponse.json({ error: 'Invalid pickup date.' }, { status: 400 });
    if (start < todayStart.getTime()) {
      return NextResponse.json({ error: 'Pickup date cannot be in the past.' }, { status: 400 });
    }
  }

  const insert = db.prepare(`
    INSERT INTO orders (id, groupId, productId, item, customerName, email, phone, status, startAt, endAt, returnedAt, days, rate, addonLabel, subtotal, waiver, discount, tax, deposit, lateFee, refund, total, promoCode, paymentStatus, paymentRef, deliveryMethod, address, notes)
    VALUES (@id, @groupId, @productId, @item, @customerName, @email, @phone, 'reserved', @startAt, @endAt, NULL, @days, @rate, @addonLabel, @subtotal, @waiver, @discount, @tax, @deposit, 0, 0, @total, @promoCode, @paymentStatus, @paymentRef, @deliveryMethod, @address, @notes)
  `);

  try {
    // ── Payment verification (Razorpay) ───────────────────────
    // With keys configured, an order requires a verified Razorpay payment
    // whose captured amount matches the server-recomputed total.
    let paymentStatus: 'demo' | 'paid' = 'demo';
    let paymentRef = '';
    if (isRazorpayConfigured()) {
      const pay = (body.payment ?? {}) as Record<string, unknown>;
      const rzpOrderId = String(pay.razorpayOrderId || '');
      const rzpPaymentId = String(pay.razorpayPaymentId || '');
      const rzpSignature = String(pay.razorpaySignature || '');
      if (!verifyRazorpaySignature(rzpOrderId, rzpPaymentId, rzpSignature)) {
        return NextResponse.json({ error: 'Payment verification failed. Please complete payment first.' }, { status: 402 });
      }
      const preQuote = priceQuote(db, lines, typeof body.promoCode === 'string' ? body.promoCode : undefined);
      const rzpOrder = await fetchRazorpayOrder(rzpOrderId);
      if (rzpOrder.amount !== Math.round(preQuote.total * 100)) {
        return NextResponse.json({ error: 'Paid amount does not match the order total.' }, { status: 409 });
      }
      paymentStatus = 'paid';
      paymentRef = rzpPaymentId;
    }

    const created: string[] = [];
    // Quote + availability check + inserts run in one transaction on the single
    // shared connection, so a concurrent checkout cannot double-book: each
    // inserted line is visible to the availability check of the next.
    const tx = db.transaction(() => {
      const quote = priceQuote(db, lines, typeof body.promoCode === 'string' ? body.promoCode : undefined);

      const unavailable = quote.lines.filter((l) => !l.available);
      if (unavailable.length) {
        throw new QuoteError(
          `No longer available for the selected dates: ${unavailable.map((l) => l.item).join(', ')}. Please adjust your dates.`,
          409,
        );
      }

      const groupId = `GRP-${nextOrderId(db).slice(4)}`;
      // Spread the order-level discount and tax across lines proportionally so
      // line totals sum to the quote total.
      let discountLeft = quote.discount;
      let taxLeft = quote.tax;
      quote.lines.forEach((l, i) => {
        const isLast = i === quote.lines.length - 1;
        const share = quote.subtotal > 0 ? l.subtotal / quote.subtotal : 1 / quote.lines.length;
        const discount = isLast ? discountLeft : Math.round(quote.discount * share);
        const tax = isLast ? taxLeft : Math.round(quote.tax * share);
        discountLeft -= discount;
        taxLeft -= tax;

        const id = nextOrderId(db);
        insert.run({
          id,
          groupId,
          productId: l.productId,
          item: l.item,
          customerName,
          email,
          phone,
          startAt: new Date(l.startAt).toISOString(),
          endAt: new Date(l.endAt).toISOString(),
          days: l.days,
          rate: l.rate,
          addonLabel: l.attachmentLabel,
          subtotal: l.subtotal,
          waiver: l.waiver,
          discount,
          tax,
          deposit: l.deposit,
          total: l.subtotal + l.waiver - discount + tax + l.deposit,
          promoCode: quote.promoCode,
          paymentStatus,
          paymentRef,
          deliveryMethod,
          address,
          notes,
        });
        created.push(id);
      });
      return quote;
    });
    const quote = tx();

    return NextResponse.json({ ok: true, orderIds: created, total: quote.total }, { status: 201 });
  } catch (err) {
    if (err instanceof QuoteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
