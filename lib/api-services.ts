import { api, handleApiError, PaginatedResponse } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  category_id: number;
  status: string;
  stock_quantity: number;
  sku: string | null;
  weight: number | null;
  dimensions: string | null;
  images: string | null;
  features: string | null;
  specifications: string | null;
  is_featured: boolean;
  is_rentable: boolean;
  rental_period_days: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  rental_start_date: string | null;
  rental_end_date: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shipping_address: string;
  billing_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  rental_start_date: string | null;
  rental_end_date: string | null;
  created_at: string;
  product?: Product;
}

export interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Address {
  id: number;
  user_id: number;
  name: string | null;
  street: string;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<TokenResponse & { user: User }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: { email: string; password: string; full_name?: string; phone?: string }): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post('/auth/refresh', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateMe: async (data: { full_name?: string; phone?: string }): Promise<User> => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const productsApi = {
  getAll: async (params?: {
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
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  getFeatured: async (limit = 8): Promise<Product[]> => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  getRentable: async (limit = 12): Promise<Product[]> => {
    const response = await api.get('/products/rentable', { params: { limit } });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data;
  },
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

export const cartApi = {
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get('/cart/');
    return response.data;
  },

  addToCart: async (data: { product_id: number; quantity?: number; rental_start_date?: string; rental_end_date?: string }): Promise<CartItem> => {
    const response = await api.post('/cart/', data);
    return response.data;
  },

  updateCartItem: async (itemId: number, data: { quantity?: number; rental_start_date?: string; rental_end_date?: string }): Promise<CartItem> => {
    const response = await api.put(`/cart/${itemId}`, data);
    return response.data;
  },

  removeFromCart: async (itemId: number): Promise<void> => {
    await api.delete(`/cart/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart/');
  },

  getCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/cart/count');
    return response.data;
  },

  getTotal: async (): Promise<{ subtotal: number; item_count: number }> => {
    const response = await api.get('/cart/total');
    return response.data;
  },
};

export const ordersApi = {
  create: async (data: { shipping_address: string; billing_address?: string; notes?: string }): Promise<Order> => {
    const response = await api.post('/orders/', data);
    return response.data;
  },

  getAll: async (params?: { skip?: number; limit?: number; status?: string }): Promise<Order[]> => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  update: async (id: number, data: { status?: string; shipping_address?: string; billing_address?: string; notes?: string }): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: { full_name?: string; phone?: string }): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getAll: async (params?: { skip?: number; limit?: number }): Promise<User[]> => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

export const reviewsApi = {
  getProductReviews: async (productId: number, params?: { skip?: number; limit?: number }): Promise<Review[]> => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  create: async (data: { product_id: number; rating: number; title?: string; comment?: string }): Promise<Review> => {
    const response = await api.post('/reviews/', data);
    return response.data;
  },

  update: async (id: number, data: { rating?: number; title?: string; comment?: string }): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};

export const contactsApi = {
  create: async (data: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<ContactInquiry> => {
    const response = await api.post('/contacts/', data);
    return response.data;
  },

  getAll: async (params?: { skip?: number; limit?: number; is_read?: boolean }): Promise<ContactInquiry[]> => {
    const response = await api.get('/contacts/', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ContactInquiry> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  markAsRead: async (id: number): Promise<ContactInquiry> => {
    const response = await api.put(`/contacts/${id}/read`);
    return response.data;
  },
};

export const addressesApi = {
  getAll: async (): Promise<Address[]> => {
    const response = await api.get('/addresses/');
    return response.data;
  },

  getById: async (id: number): Promise<Address> => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  create: async (data: { name?: string; street: string; city: string; state?: string; postal_code: string; country: string; is_default?: boolean }): Promise<Address> => {
    const response = await api.post('/addresses/', data);
    return response.data;
  },

  update: async (id: number, data: { name?: string; street?: string; city?: string; state?: string; postal_code?: string; country?: string; is_default?: boolean }): Promise<Address> => {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },

  setDefault: async (id: number): Promise<Address> => {
    const response = await api.post(`/addresses/${id}/default`);
    return response.data;
  },
};