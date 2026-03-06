export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice: number;
  categoryId: number;
  categoryName?: string;
  images: string[];
  variations: ProductVariation[];
  featured?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  views?: number;
  sales?: number;
  totalStock?: number;
}

export interface ProductVariation {
  id: number;
  color: string;
  size: string;
  stock: number;
  sku?: string;
  priceOverride?: number;
}

export interface CartItem {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  lastInteraction: string;
  totalOrders: number;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  domain: string;
  subdomain: string;
  whatsappNumber: string;
}

export interface StoreBannerSettings {
  storeId: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  titleColor: string;
  subtitleColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}
