import { apiGet, apiPost, apiPut, STORE_SLUG } from './api';
import { Category, Customer, Order, Product, ProductVariation, Store } from '../types';

export function getStoreSlug() {
  return STORE_SLUG as string;
}

type ApiStore = {
  id: number;
  name: string;
  slug: string;
  description: string;
  whatsapp_number: string;
  logo_url: string;
  banner_url: string;
  primary_color: string;
  domain: string;
  subdomain: string;
};

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  product_count?: number;
};

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number;
  category_id: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

type ApiProductVariant = {
  id: number;
  product_id: number;
  sku: string;
  color: string;
  size: string;
  stock_quantity: number;
  price_override: number;
};

type ApiAdminProduct = {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  sku: string;
  price: number;
  discount_price: number;
  brand: string;
  gender: string;
  is_featured: boolean;
  is_active: boolean;
  cover_image_url: string;
  total_stock: number;
  views: number;
  sales: number;
  created_at: string;
};

type ApiOrderItem = {
  product_id: number;
  variant_id?: number;
  name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price: number;
  image_url: string;
};

type ApiOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: ApiOrderItem[];
};

type ApiCustomer = {
  id: number;
  name: string;
  phone: string;
  total_orders: number;
  last_interaction: string;
};

export async function fetchStoreBySlug(slug = STORE_SLUG): Promise<Store> {
  const data = await apiGet<ApiStore>(`/stores/${slug}`);
  return mapStore(data);
}

export async function fetchCategories(slug = STORE_SLUG): Promise<Category[]> {
  const data = await apiGet<ApiCategory[]>(`/stores/${slug}/categories`);
  return data.map(mapCategory);
}

export async function fetchProducts(slug = STORE_SLUG): Promise<Product[]> {
  const data = await apiGet<ApiProduct[]>(`/stores/${slug}/products`);
  return data.map((p) => mapProduct(p, []));
}

export async function fetchProduct(slug: string, productSlug: string): Promise<Product> {
  const data = await apiGet<{ product: ApiProduct; variants: ApiProductVariant[]; images: string[]; category?: { name: string } }>(
    `/stores/${slug}/products/${productSlug}`
  );
  const variations = data.variants.map(mapVariation);
  const product = mapProduct({ ...data.product, images: data.images }, variations, {
    categoryName: data.category?.name,
  });
  return product;
}

export async function checkoutWhatsApp(payload: {
  store_slug: string;
  items: { product_id: number; variant_id?: number; quantity: number }[];
}): Promise<{ order_id: number; whatsapp_message: string; whatsapp_url: string }> {
  return apiPost('/checkout/whatsapp', payload);
}

export async function fetchAdminProducts(storeId: number): Promise<Product[]> {
  const data = await apiGet<ApiAdminProduct[]>(`/admin/products?store_id=${storeId}`);
  return data.map((p) => mapAdminProduct(p));
}

export async function fetchAdminProduct(storeId: number, id: number): Promise<Product> {
  const p = await apiGet<ApiAdminProduct>(`/admin/products/${id}?store_id=${storeId}`);
  return mapAdminProduct(p);
}

export async function createAdminProduct(payload: {
  store_id: number;
  category_id: number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number;
  is_featured: boolean;
  is_active: boolean;
  variants: { sku?: string; color: string; size: string; stock: number }[];
}): Promise<{ id: number }> {
  return apiPost('/admin/products', payload);
}

export async function updateAdminProduct(storeId: number, id: number, payload: {
  category_id: number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  discount_price: number;
  is_featured: boolean;
  is_active: boolean;
  variants: { sku?: string; color: string; size: string; stock: number }[];
}): Promise<{ id: number }> {
  return apiPut(`/admin/products/${id}?store_id=${storeId}`, payload);
}

export async function fetchAdminCategories(storeId: number): Promise<Category[]> {
  const data = await apiGet<ApiCategory[]>(`/admin/categories?store_id=${storeId}`);
  return data.map(mapCategory);
}

export async function fetchAdminOrders(storeId: number): Promise<Order[]> {
  const data = await apiGet<ApiOrder[]>(`/admin/orders?store_id=${storeId}`);
  return data.map(mapOrder);
}

export async function fetchAdminCustomers(storeId: number): Promise<Customer[]> {
  const data = await apiGet<ApiCustomer[]>(`/admin/customers?store_id=${storeId}`);
  return data.map(mapCustomer);
}

export async function fetchAdminInventory(storeId: number): Promise<
  { product: Product; variation: ProductVariation }[]
> {
  const data = await apiGet<{
    variant_id: number;
    product_id: number;
    product_name: string;
    category_name: string;
    sku: string;
    color: string;
    size: string;
    stock_quantity: number;
    cover_image_url: string;
  }[]>(`/admin/inventory?store_id=${storeId}`);

  return data.map((row) => ({
    product: {
      id: row.product_id,
      slug: '',
      name: row.product_name,
      description: '',
      shortDescription: '',
      price: 0,
      discountPrice: 0,
      categoryId: 0,
      categoryName: row.category_name,
      images: row.cover_image_url ? [row.cover_image_url] : [],
      variations: [],
      featured: false,
      status: 'active',
      createdAt: '',
      totalStock: row.stock_quantity,
    },
    variation: {
      id: row.variant_id,
      color: row.color,
      size: row.size,
      stock: row.stock_quantity,
      sku: row.sku,
    },
  }));
}

export async function fetchAdminDashboard(storeId: number) {
  const data = await apiGet<any>(`/admin/dashboard?store_id=${storeId}`);
  return {
    ...data,
    top_sold_products: (data.top_sold_products || []).map(mapAdminProduct),
    top_viewed_products: (data.top_viewed_products || []).map(mapAdminProduct),
  };
}

export async function fetchAdminAnalytics(storeId: number) {
  const data = await apiGet<any>(`/admin/analytics?store_id=${storeId}`);
  return {
    ...data,
    product_performance: (data.product_performance || []).map(mapAdminProduct),
  };
}

export async function fetchAdminStore(storeId: number): Promise<Store> {
  const data = await apiGet<ApiStore>(`/admin/store?store_id=${storeId}`);
  return mapStore(data);
}

export async function updateAdminStore(storeId: number, payload: Partial<Store>): Promise<Store> {
  const data = await apiPut<ApiStore>(`/admin/store?store_id=${storeId}`, {
    name: payload.name,
    domain: payload.domain,
    subdomain: payload.subdomain,
    primary_color: payload.primaryColor,
    logo_url: payload.logoUrl,
    banner_url: payload.bannerUrl,
    whatsapp_number: payload.whatsappNumber,
  });
  return mapStore(data);
}

export async function fetchWhatsAppSettings(storeId: number) {
  return apiGet(`/admin/whatsapp-settings?store_id=${storeId}`);
}

export async function updateWhatsAppSettings(storeId: number, payload: {
  whatsapp_number: string;
  default_message_template: string;
  cart_message_template: string;
  single_product_message_template: string;
  is_active?: boolean;
}) {
  return apiPut(`/admin/whatsapp-settings?store_id=${storeId}`, payload);
}

function mapStore(s: ApiStore): Store {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description || '',
    logoUrl: s.logo_url || '',
    bannerUrl: s.banner_url || '',
    primaryColor: s.primary_color || '#111111',
    domain: s.domain || '',
    subdomain: s.subdomain || '',
    whatsappNumber: s.whatsapp_number || '',
  };
}

function mapCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c.product_count || 0,
  };
}

function mapVariation(v: ApiProductVariant): ProductVariation {
  return {
    id: v.id,
    color: v.color,
    size: v.size,
    stock: v.stock_quantity,
    sku: v.sku,
    priceOverride: v.price_override,
  };
}

function mapProduct(p: ApiProduct, variations: ProductVariation[], extra?: {
  categoryName?: string;
  totalStock?: number;
  views?: number;
  sales?: number;
}): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || '',
    shortDescription: p.short_description || '',
    price: p.price,
    discountPrice: p.discount_price,
    categoryId: p.category_id,
    categoryName: extra?.categoryName,
    images: p.images || [],
    variations,
    featured: p.is_featured,
    status: p.is_active ? 'active' : 'inactive',
    createdAt: p.created_at,
    views: extra?.views,
    sales: extra?.sales,
    totalStock: extra?.totalStock,
  };
}

function mapAdminProduct(p: ApiAdminProduct): Product {
  return mapProduct(
    {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      short_description: p.short_description,
      price: p.price,
      discount_price: p.discount_price,
      category_id: p.category_id,
      images: p.cover_image_url ? [p.cover_image_url] : [],
      is_featured: p.is_featured,
      is_active: p.is_active,
      created_at: p.created_at,
    },
    [],
    {
      categoryName: p.category_name,
      totalStock: p.total_stock,
      views: p.views,
      sales: p.sales,
    }
  );
}

function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    orderNumber: o.order_number,
    customerName: o.customer_name || 'Cliente não informado',
    customerPhone: o.customer_phone || '-',
    status: o.status,
    total: o.total_amount,
    createdAt: o.created_at,
    items: o.items.map((it) => ({
      product: {
        id: it.product_id,
        slug: '',
        name: it.name,
        description: '',
        shortDescription: '',
        price: it.unit_price,
        discountPrice: 0,
        categoryId: 0,
        images: it.image_url ? [it.image_url] : [],
        variations: [],
        featured: false,
        status: 'active',
        createdAt: '',
      },
      variation: {
        id: it.variant_id || 0,
        color: it.color,
        size: it.size,
        stock: 0,
      },
      quantity: it.quantity,
    })),
  };
}

function mapCustomer(c: ApiCustomer): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone || '-',
    lastInteraction: c.last_interaction,
    totalOrders: c.total_orders,
  };
}
