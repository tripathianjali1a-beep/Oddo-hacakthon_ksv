export interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'customer';
  is_active: boolean;
  created_at: string;
}

export interface Token {
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
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock';
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

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
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

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
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

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}