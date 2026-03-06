export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  variations: ProductVariation[];
  featured?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  views?: number;
  sales?: number;
}

export interface ProductVariation {
  id: string;
  color: string;
  size: string;
  stock: number;
  sku?: string;
}

export interface CartItem {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'contacted' | 'confirmed' | 'completed';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lastInteraction: string;
  totalOrders: number;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  banner: string;
  primaryColor: string;
  domain: string;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}
