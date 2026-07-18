import { api } from './client';
import type {
  Product,
  ProductListResponse,
  Category,
  CartItem,
  Order,
  User,
  ContactInquiry,
  Address,
  Review,
} from './types';

export const productsApi = {
  getAll: (params?: {
    page?: number;
    size?: number;
    category_id?: number;
    search?: string;
    status?: string;
    is_featured?: boolean;
    is_rentable?: boolean;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: string;
  }) => api.get<ProductListResponse>('/products', { params }),

  getFeatured: (limit?: number) => api.get<Product[]>('/products/featured', { params: { limit } }),

  getRentable: (limit?: number) => api.get<Product[]>('/products/rentable', { params: { limit } }),

  getById: (id: number) => api.get<Product>(`/products/${id}`),

  getBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`),

  create: (data: Partial<Product>) => api.post<Product>('/products', data),

  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),

  delete: (id: number) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),

  getById: (id: number) => api.get<Category>(`/categories/${id}`),

  create: (data: Partial<Category>) => api.post<Category>('/categories', data),

  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),

  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const cartApi = {
  getAll: () => api.get<CartItem[]>('/cart'),

  add: (data: { product_id: number; quantity?: number; rental_start_date?: string; rental_end_date?: string }) =>
    api.post<CartItem>('/cart', data),

  update: (id: number, data: { quantity?: number; rental_start_date?: string; rental_end_date?: string }) =>
    api.put<CartItem>(`/cart/${id}`, data),

  remove: (id: number) => api.delete(`/cart/${id}`),

  clear: () => api.delete('/cart'),

  getCount: () => api.get<{ count: number }>('/cart/count'),

  getTotal: () => api.get<{ subtotal: number; item_count: number }>('/cart/total'),
};

export const ordersApi = {
  getAll: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get<Order[]>('/orders', { params }),

  getById: (id: number) => api.get<Order>(`/orders/${id}`),

  getByNumber: (orderNumber: string) => api.get<Order>(`/orders/number/${orderNumber}`),

  create: (data: { shipping_address: string; billing_address?: string; notes?: string }) =>
    api.post<Order>('/orders', data),

  update: (id: number, data: Partial<Order>) => api.put<Order>(`/orders/${id}`, data),

  cancel: (id: number) => api.delete(`/orders/${id}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string; token_type: string }>('/auth/login', { email, password }),

  register: (data: { email: string; password: string; full_name?: string; phone?: string }) =>
    api.post<User>('/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post<{ access_token: string; refresh_token: string; token_type: string }>('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }),

  getMe: () => api.get<User>('/auth/me'),

  updateMe: (data: Partial<User>) => api.put<User>('/auth/me', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/change-password', data),

  logout: () => api.post('/auth/logout'),
};

export const usersApi = {
  getAll: (params?: { skip?: number; limit?: number }) => api.get<User[]>('/users', { params }),

  getById: (id: number) => api.get<User>(`/users/${id}`),

  create: (data: Partial<User>) => api.post<User>('/users', data),

  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),

  delete: (id: number) => api.delete(`/users/${id}`),

  activate: (id: number) => api.post<User>(`/users/${id}/activate`),

  deactivate: (id: number) => api.post<User>(`/users/${id}/deactivate`),
};

export const reviewsApi = {
  getByProduct: (productId: number, params?: { skip?: number; limit?: number }) =>
    api.get<Review[]>(`/reviews/product/${productId}`, { params }),

  create: (data: { product_id: number; rating: number; title?: string; comment?: string }) =>
    api.post<Review>('/reviews', data),

  update: (id: number, data: Partial<Review>) => api.put<Review>(`/reviews/${id}`, data),

  delete: (id: number) => api.delete(`/reviews/${id}`),
};

export const contactsApi = {
  create: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    api.post<ContactInquiry>('/contacts', data),

  getAll: (params?: { skip?: number; limit?: number; is_read?: boolean }) =>
    api.get<ContactInquiry[]>('/contacts', { params }),

  getById: (id: number) => api.get<ContactInquiry>(`/contacts/${id}`),

  markAsRead: (id: number) => api.put<ContactInquiry>(`/contacts/${id}/read`),

  delete: (id: number) => api.delete(`/contacts/${id}`),
};

export const addressesApi = {
  getAll: () => api.get<Address[]>('/addresses'),

  getById: (id: number) => api.get<Address>(`/addresses/${id}`),

  create: (data: Partial<Address>) => api.post<Address>('/addresses', data),

  update: (id: number, data: Partial<Address>) => api.put<Address>(`/addresses/${id}`, data),

  delete: (id: number) => api.delete(`/addresses/${id}`),

  setDefault: (id: number) => api.post<Address>(`/addresses/${id}/default`),
};

// Utility exports used by api-services.ts
export { api } from './client';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export function handleApiError(error: unknown): never {
  const err = error as { response?: { data?: { detail?: string } }; message?: string };
  const message = err?.response?.data?.detail || err?.message || 'An unexpected error occurred';
  throw new Error(message);
}

// Dashboard stats API
export const dashboardApi = {
  getStats: () => api.get<{
    active_rentals: number;
    rentals_due_today: number;
    upcoming_pickups: number;
    upcoming_returns: number;
    overdue_rentals: number;
    total_revenue: number;
    deposits_held: number;
    late_fee_collected: number;
  }>('/orders/admin/dashboard-stats'),

  getAllOrders: (params?: { skip?: number; limit?: number; order_status?: string }) =>
    api.get('/orders/admin/all', { params }),
};

export const rentalConfigApi = {
  get: () => api.get('/rental-config/'),
  update: (data: Record<string, unknown>) => api.put('/rental-config/', data),
};
