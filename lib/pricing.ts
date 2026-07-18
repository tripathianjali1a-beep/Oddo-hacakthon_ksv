// Server-side pricing engine — the single source of truth for what a rental
// costs. Quotes, checkout, and order creation all price through here; nothing
// money-related is ever trusted from the client.

import type Database from 'better-sqlite3';
import { rowToProduct, availableQuantity } from './db';
import type { Quote, QuoteLine, QuoteLineInput } from './types';

export const TAX_RATE = 0.08;
export const DAMAGE_WAIVER = 75; // flat, per line

// Promo codes live server-side. Percentage off the rental subtotal (not deposit).
const PROMOS: Record<string, number> = {
  RENTORA10: 10,
};

const DAY_MS = 86_400_000;

export class QuoteError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parseDay(iso: string, field: string): number {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) throw new QuoteError(`Invalid ${field} date.`);
  return t;
}

export function rentalDays(startAt: string, endAt: string): number {
  const start = parseDay(startAt, 'start');
  const end = parseDay(endAt, 'end');
  if (end <= start) throw new QuoteError('Return date must be after the pickup date.');
  return Math.max(1, Math.round((end - start) / DAY_MS));
}

export function priceQuote(db: Database.Database, lines: QuoteLineInput[], promoCode?: string): Quote {
  if (!Array.isArray(lines) || lines.length === 0) throw new QuoteError('No items to quote.');
  if (lines.length > 50) throw new QuoteError('Too many items.');

  const quoted: QuoteLine[] = [];
  // Same product with overlapping dates in one quote consumes multiple units:
  // track how many units earlier lines already claim.
  const claimed: { productId: number; startAt: string; endAt: string }[] = [];

  for (const line of lines) {
    const productId = Number(line.productId);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!row) throw new QuoteError(`Product ${line.productId} not found.`, 404);
    const product = rowToProduct(row);
    if (product.status === 'draft') throw new QuoteError(`${product.name} is not available for rent.`, 409);
    if (product.daily <= 0) throw new QuoteError(`${product.name} has no daily rate configured.`, 409);

    const days = rentalDays(line.startAt, line.endAt);
    const attachment =
      product.attachments.find((a) => a.id === line.attachmentId) ??
      product.attachments[0] ??
      { id: 'standard', label: 'Standard', price: 0 };

    const claimedHere = claimed.filter(
      (c) => c.productId === productId && !(c.endAt <= line.startAt || c.startAt >= line.endAt),
    ).length;
    const availableQty = Math.max(
      0,
      availableQuantity(db, productId, line.startAt, line.endAt) - claimedHere,
    );
    claimed.push({ productId, startAt: line.startAt, endAt: line.endAt });

    const rate = product.daily + attachment.price;
    quoted.push({
      productId,
      item: product.name,
      image: product.image,
      attachmentId: attachment.id,
      attachmentLabel: attachment.label,
      startAt: line.startAt,
      endAt: line.endAt,
      days,
      rate,
      subtotal: rate * days,
      waiver: DAMAGE_WAIVER,
      deposit: product.deposit,
      available: availableQty > 0,
      availableQty,
    });
  }

  const subtotal = quoted.reduce((s, l) => s + l.subtotal, 0);
  const waiver = quoted.reduce((s, l) => s + l.waiver, 0);
  const depositTotal = quoted.reduce((s, l) => s + l.deposit, 0);

  const code = (promoCode || '').trim().toUpperCase();
  const promoPct = code ? PROMOS[code] : undefined;
  const promoValid = promoPct !== undefined;
  const discount = promoValid ? Math.round(subtotal * (promoPct / 100)) : 0;

  const tax = Math.round((subtotal + waiver - discount) * TAX_RATE);
  const total = subtotal + waiver - discount + tax + depositTotal;

  return {
    lines: quoted,
    subtotal,
    waiver,
    discount,
    promoCode: promoValid ? code : '',
    promoValid: code ? promoValid : false,
    tax,
    depositTotal,
    total,
  };
}
