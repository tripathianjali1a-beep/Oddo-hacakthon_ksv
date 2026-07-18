'use client';

// Lightweight localStorage-backed cart, shared across storefront pages.
// Items only identify WHAT is rented and WHEN — all prices are computed
// server-side via POST /api/quotes, so nothing money-related lives here.

export interface CartItem {
  key: string;             // unique per line
  productId: number;
  attachmentId: string;
  startAt: string;         // ISO date
  endAt: string;           // ISO date
  // Display-only hints (server re-derives the real values):
  title: string;
  attachmentLabel: string;
  image: string;
}

const KEY = 'luxrent.cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(items)) return [];
    // Drop entries from older cart formats that can't be quoted.
    return items.filter((i) => i && typeof i.productId === 'number' && typeof i.startAt === 'string' && typeof i.endAt === 'string');
  } catch { return []; }
}

export function setCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:changed'));
}

export function addToCart(item: Omit<CartItem, 'key'>) {
  const items = getCart();
  items.push({ ...item, key: `${item.productId}-${Date.now()}` });
  setCart(items);
}

export function removeFromCart(key: string) {
  setCart(getCart().filter((i) => i.key !== key));
}

export function clearCart() {
  setCart([]);
}

export function cartCount(): number {
  return getCart().length;
}
