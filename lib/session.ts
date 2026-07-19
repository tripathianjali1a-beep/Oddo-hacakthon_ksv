// Shared client-side session helper around the localStorage-based auth used
// across the app. Single source of truth so the storefront header, admin
// sidebar, and admin route gate all agree on what "logged in" means.
'use client';
import type { User } from './types';

export type SessionUser = Pick<User, 'id' | 'name' | 'email' | 'role'>;

const KEY = 'luxrent.user';

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser): void {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('storage'));
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event('storage'));
}

export const isStaff = (role: string | undefined) => role === 'vendor' || role === 'admin';
