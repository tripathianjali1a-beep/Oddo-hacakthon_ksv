/**
 * ============================================================================
 * Rentora Server-Side Pricing & Quotation Engine
 * ============================================================================
 * Why this engine is critical for enterprise rental platforms:
 * In any production rental system, financial and pricing logic MUST live on the
 * server. If prices were computed on the client, malicious users could modify
 * network payloads or local state to check out items for ₹0.
 *
 * This engine serves as our single source of truth across both SQLite (local dev)
 * and PostgreSQL (Railway production). It computes:
 * 1. Rental Duration: Exactly how many days the asset is booked.
 * 2. Dynamic Rates: Base daily rate + any hardware/attachment add-ons.
 * 3. Inventory Checks: Real-time unit availability verification (`availableQty`).
 * 4. Transparent Billing: Subtotal, damage waivers, promo codes, taxes, and security deposits.
 * ============================================================================
 */
import { rowToProduct, availableQuantity } from './db';
import { pgRowToProduct, pgAvailableQuantity } from './db-pg';
import type { Pool } from 'pg';
import type Database from 'better-sqlite3';
import type { Quote, QuoteLine, QuoteLineInput } from './types';

// Standard business configuration constants
export const TAX_RATE = 0.08;      // 8% baseline tax / GST allocation
export const DAMAGE_WAIVER = 75;   // Fixed mandatory ₹75 damage protection waiver per line item

// Supported promotional coupons and their percentage discount values
const PROMOS: Record<string, number> = { RENTORA10: 10 };
const DAY_MS = 86_400_000;         // Number of milliseconds in a 24-hour day

/**
 * Custom error class for clean, status-code-aware API responses during quoting.
 */
export class QuoteError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

/**
 * Safely parses and validates ISO date strings submitted during checkout.
 */
function parseDay(iso: string, field: string): number {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) throw new QuoteError(`Invalid ${field} date.`);
  return t;
}

/**
 * Computes the billable rental duration in full days.
 * Ensures the return date is strictly after the pickup date and enforces a minimum 1-day rental.
 */
export function rentalDays(startAt: string, endAt: string): number {
  const start = parseDay(startAt, 'start');
  const end = parseDay(endAt, 'end');
  if (end <= start) throw new QuoteError('Return date must be after the pickup date.');
  return Math.max(1, Math.round((end - start) / DAY_MS));
}

// ============================================================================
// SQLite Quotation Engine (Synchronous - Local Development & Fast Demo Mode)
// ============================================================================
export function priceQuote(db: Database.Database, lines: QuoteLineInput[], promoCode?: string): Quote {
  if (!Array.isArray(lines) || lines.length === 0) throw new QuoteError('No items to quote.');
  if (lines.length > 50) throw new QuoteError('Too many items.');

  const quoted: QuoteLine[] = [];
  // Tracks items already claimed within this same cart/quote request so multiple
  // identical lines correctly decrement available stock sequentially.
  const claimed: { productId: number; startAt: string; endAt: string }[] = [];

  for (const line of lines) {
    const productId = Number(line.productId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
    if (!row) throw new QuoteError(`Product ${line.productId} not found.`, 404);
    const product = rowToProduct(row);
    
    // Safety guardrails against quoting unrentable catalog entries:
    if (product.status === 'draft') throw new QuoteError(`${product.name} is not available for rent.`, 409);
    if (product.daily <= 0) throw new QuoteError(`${product.name} has no daily rate configured.`, 409);

    const days = rentalDays(line.startAt, line.endAt);
    
    // Resolve chosen attachment add-on or default to standard configuration:
    const attachment = product.attachments.find((a) => a.id === line.attachmentId)
      ?? product.attachments[0]
      ?? { id: 'standard', label: 'Standard', price: 0 };

    // Calculate how many units are already claimed by overlapping lines in this exact quote:
    const claimedHere = claimed.filter(
      (c) => c.productId === productId && !(c.endAt <= line.startAt || c.startAt >= line.endAt),
    ).length;
    
    // Check database stock availability and subtract in-cart claims:
    const availableQty = Math.max(0, availableQuantity(db, productId, line.startAt, line.endAt) - claimedHere);
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
      availableQty
    });
  }

  return buildQuote(quoted, promoCode);
}

// ============================================================================
// PostgreSQL Quotation Engine (Asynchronous - Railway / Production Mode)
// ============================================================================
export async function priceQuotePg(pool: Pool, lines: QuoteLineInput[], promoCode?: string): Promise<Quote> {
  if (!Array.isArray(lines) || lines.length === 0) throw new QuoteError('No items to quote.');
  if (lines.length > 50) throw new QuoteError('Too many items.');

  const quoted: QuoteLine[] = [];
  const claimed: { productId: number; startAt: string; endAt: string }[] = [];

  for (const line of lines) {
    const productId = Number(line.productId);
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (!rows[0]) throw new QuoteError(`Product ${line.productId} not found.`, 404);
    const product = pgRowToProduct(rows[0]);
    
    if (product.status === 'draft') throw new QuoteError(`${product.name} is not available for rent.`, 409);
    if (product.daily <= 0) throw new QuoteError(`${product.name} has no daily rate configured.`, 409);

    const days = rentalDays(line.startAt, line.endAt);
    const attachment = product.attachments.find((a) => a.id === line.attachmentId)
      ?? product.attachments[0]
      ?? { id: 'standard', label: 'Standard', price: 0 };

    const claimedHere = claimed.filter(
      (c) => c.productId === productId && !(c.endAt <= line.startAt || c.startAt >= line.endAt),
    ).length;
    const availableQty = Math.max(0, (await pgAvailableQuantity(pool, productId, line.startAt, line.endAt)) - claimedHere);
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
      availableQty
    });
  }

  return buildQuote(quoted, promoCode);
}

/**
 * Aggregates all quoted line items into a unified financial summary.
 * Applies promotional discounts before tax calculation so tax is assessed fairly on net subtotal.
 */
function buildQuote(quoted: QuoteLine[], promoCode?: string): Quote {
  const subtotal = quoted.reduce((s, l) => s + l.subtotal, 0);
  const waiver = quoted.reduce((s, l) => s + l.waiver, 0);
  const depositTotal = quoted.reduce((s, l) => s + l.deposit, 0);
  
  const code = (promoCode || '').trim().toUpperCase();
  const promoPct = code ? PROMOS[code] : undefined;
  const promoValid = promoPct !== undefined;
  
  // Calculate discount percentage across subtotal:
  const discount = promoValid ? Math.round(subtotal * (promoPct! / 100)) : 0;
  
  // Tax is assessed on taxable items (subtotal + waiver - discount):
  const tax = Math.round((subtotal + waiver - discount) * TAX_RATE);
  
  // Grand total payable upfront:
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
    total
  };
}

