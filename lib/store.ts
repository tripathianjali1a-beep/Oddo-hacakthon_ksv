'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, CartItem, Product } from '@/lib/api-services';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: { user: User; access_token: string; refresh_token: string }) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (data) =>
        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  recalculate: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      subtotal: 0,
      setItems: (items) => set({ items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0), subtotal: items.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0) }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
          } else {
            newItems = [...state.items, item];
          }
          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: newItems.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0),
          };
        }),
      updateItem: (id, quantity) =>
        set((state) => {
          const newItems = state.items.map((i) => (i.id === id ? { ...i, quantity } : i));
          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: newItems.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0),
          };
        }),
      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: newItems.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0),
          };
        }),
      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
      setOpen: (isOpen) => set({ isOpen }),
      recalculate: () =>
        set((state) => ({
          itemCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: state.items.reduce((sum, i) => sum + i.quantity * (i.product?.price || 0), 0),
        })),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
}));