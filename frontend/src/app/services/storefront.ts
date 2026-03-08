import { apiDelete, apiGet, apiPost, apiPostForm, apiPut, STORE_ID, getAdminToken } from './api';
import { Category, Customer, Order, Product, ProductVariation, Store, StoreBannerSettings } from '../types';

export function getStoreID() {
  return STORE_ID;
}

type ApiStore = {
  id: number;
  name: string;
  slug: string;
  description: string;
  whatsapp_number: string;
  service_hours: string;
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

type ApiBannerSettings = {
  store_id: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  title_color: string;
  subtitle_color: string;
  button_bg_color: string;
  button_text_color: string;
  is_active: boolean;
};

type ApiStoreWhatsAppSettings = {
  store_id: number;
  whatsapp_number: string;
  is_active: boolean;
};

export async function fetchStoreByID(storeId = STORE_ID): Promise<Store> {
  const data = await apiGet<ApiStore>(`/stores/id/${storeId}`);
  return mapStore(data);
}

export async function fetchCategories(storeId = STORE_ID): Promise<Category[]> {
  const data = await apiGet<ApiCategory[]>(`/stores/id/${storeId}/categories`);
  return data.map(mapCategory);
}

export async function fetchStoreBannerSettings(storeId = STORE_ID): Promise<StoreBannerSettings> {
  const data = await apiGet<ApiBannerSettings>(`/stores/id/${storeId}/banner-settings`);
  return mapBannerSettings(data);
}

export async function fetchStoreWhatsAppSettings(storeId = STORE_ID): Promise<{ storeId: number; whatsappNumber: string; isActive: boolean }> {
  const data = await apiGet<ApiStoreWhatsAppSettings>(`/stores/id/${storeId}/whatsapp-settings`);
  return {
    storeId: data.store_id,
    whatsappNumber: data.whatsapp_number || '',
    isActive: data.is_active !== false,
  };
}

export async function trackVisit(payload: {
  store_id: number;
  path: string;
  session_id: string;
  referrer?: string;
}) {
  return apiPost('/tracking/visit', payload);
}

export async function fetchProducts(storeId = STORE_ID): Promise<Product[]> {
  const data = await apiGet<ApiProduct[]>(`/stores/id/${storeId}/products`);
  return data.map((p) => mapProduct(p, []));
}

export async function fetchProduct(storeId: number, productSlug: string): Promise<Product> {
  const data = await apiGet<{ product: ApiProduct; variants: ApiProductVariant[]; images: string[]; category?: { name: string } }>(
    `/stores/id/${storeId}/products/${productSlug}`
  );
  const variations = data.variants.map(mapVariation);
  const product = mapProduct({ ...data.product, images: data.images }, variations, {
    categoryName: data.category?.name,
  });
  return product;
}

export async function checkoutWhatsApp(payload: {
  store_id: number;
  customer_name: string;
  customer_phone: string;
  items: { product_id: number; variant_id?: number; quantity: number }[];
}): Promise<{ order_id: number; whatsapp_message: string; whatsapp_url: string }> {
  return apiPost('/checkout/whatsapp', payload);
}

export async function adminLogin(storeId: number, email: string, password: string): Promise<{ token: string; user: { id: number; store_id: number; name: string; email: string; role: string } }> {
  return apiPost(`/stores/id/${storeId}/admin/login`, { email, password });
}

export async function fetchAdminProducts(storeId: number): Promise<Product[]> {
  const data = await apiGet<ApiAdminProduct[]>(`/stores/id/${storeId}/admin/products`, { token: getAdminToken(storeId) });
  return data.map((p) => mapAdminProduct(p));
}

export async function fetchAdminProduct(storeId: number, id: number): Promise<Product> {
  const p = await apiGet<ApiAdminProduct>(`/stores/id/${storeId}/admin/products/${id}`, { token: getAdminToken(storeId) });
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
  images?: string[];
}): Promise<{ id: number }> {
  return apiPost(`/stores/id/${payload.store_id}/admin/products`, payload, { token: getAdminToken(payload.store_id) });
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
  images?: string[];
}): Promise<{ id: number }> {
  return apiPut(`/stores/id/${storeId}/admin/products/${id}`, payload, { token: getAdminToken(storeId) });
}

export async function uploadAdminImage(
  storeId: number,
  context: 'logo' | 'banner' | 'products' | 'categories' | 'gallery',
  file: File
): Promise<{
  key: string;
  url: string;
  originalName: string;
  fileName: string;
  contentType: string;
  size: number;
}> {
  const form = new FormData();
  form.append('file', file);
  form.append('context', context);
  return apiPostForm(`/stores/id/${storeId}/admin/upload/image`, form, { token: getAdminToken(storeId) });
}

export async function fetchAdminCategories(storeId: number): Promise<Category[]> {
  const data = await apiGet<ApiCategory[]>(`/stores/id/${storeId}/admin/categories`, { token: getAdminToken(storeId) });
  return data.map(mapCategory);
}

export async function createAdminCategory(storeId: number, payload: {
  name: string;
  slug?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<Category> {
  const data = await apiPost<ApiCategory>(`/stores/id/${storeId}/admin/categories`, payload, { token: getAdminToken(storeId) });
  return mapCategory(data);
}


export async function updateAdminCategory(storeId: number, categoryId: number, payload: {
  name: string;
  slug?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}): Promise<Category> {
  const data = await apiPut<ApiCategory>(`/stores/id/${storeId}/admin/categories/${categoryId}`, payload, { token: getAdminToken(storeId) });
  return mapCategory(data);
}

export async function deleteAdminCategory(storeId: number, categoryId: number): Promise<{ id: number }> {
  return apiDelete<{ id: number }>(`/stores/id/${storeId}/admin/categories/${categoryId}`, { token: getAdminToken(storeId) });
}
export async function fetchAdminOrders(storeId: number, filters?: {
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.date_from) params.set('date_from', filters.date_from);
  if (filters?.date_to) params.set('date_to', filters.date_to);
  const query = params.toString();
  const path = `/stores/id/${storeId}/admin/orders${query ? `?${query}` : ''}`;
  const data = await apiGet<ApiOrder[]>(path, { token: getAdminToken(storeId) });
  return data.map(mapOrder);
}

export async function deleteAdminOrder(storeId: number, orderId: number): Promise<{ id: number }> {
  return apiDelete<{ id: number }>(`/stores/id/${storeId}/admin/orders/${orderId}`, { token: getAdminToken(storeId) });
}

export async function updateAdminOrderStatus(
  storeId: number,
  orderId: number,
  status: 'pending' | 'contacted' | 'confirmed' | 'completed' | 'cancelled',
  restoreStock?: boolean
): Promise<{ id: number; status: string }> {
  return apiPut<{ id: number; status: string }>(
    `/stores/id/${storeId}/admin/orders/${orderId}/status`,
    { status, restore_stock: restoreStock },
    { token: getAdminToken(storeId) }
  );
}

export async function fetchAdminCustomers(storeId: number): Promise<Customer[]> {
  const data = await apiGet<ApiCustomer[]>(`/stores/id/${storeId}/admin/customers`, { token: getAdminToken(storeId) });
  return data.map(mapCustomer);
}

export async function updateAdminCustomer(
  storeId: number,
  customerId: number,
  payload: { name?: string; phone?: string }
): Promise<{ id: number; name: string; phone: string }> {
  return apiPut<{ id: number; name: string; phone: string }>(
    `/stores/id/${storeId}/admin/customers/${customerId}`,
    payload,
    { token: getAdminToken(storeId) }
  );
}

export async function deleteAdminCustomer(storeId: number, customerId: number): Promise<{ id: number }> {
  return apiDelete<{ id: number }>(`/stores/id/${storeId}/admin/customers/${customerId}`, { token: getAdminToken(storeId) });
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
  }[]>(`/stores/id/${storeId}/admin/inventory`, { token: getAdminToken(storeId) });

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

export async function updateAdminInventory(
  storeId: number,
  variantId: number,
  stockQuantity: number
): Promise<{ variant_id: number; stock_quantity: number }> {
  return apiPut<{ variant_id: number; stock_quantity: number }>(
    `/stores/id/${storeId}/admin/inventory/${variantId}`,
    { stock_quantity: stockQuantity },
    { token: getAdminToken(storeId) }
  );
}

export async function fetchAdminDashboard(storeId: number) {
  const data = await apiGet<any>(`/stores/id/${storeId}/admin/dashboard`, { token: getAdminToken(storeId) });
  return {
    ...data,
    top_sold_products: (data.top_sold_products || []).map(mapAdminProduct),
    top_viewed_products: (data.top_viewed_products || []).map(mapAdminProduct),
  };
}

export async function fetchAdminAnalytics(storeId: number) {
  const data = await apiGet<any>(`/stores/id/${storeId}/admin/analytics`, { token: getAdminToken(storeId) });
  return {
    ...data,
    product_performance: (data.product_performance || []).map(mapAdminProduct),
  };
}

export async function fetchAdminStore(storeId: number): Promise<Store> {
  const data = await apiGet<ApiStore>(`/stores/id/${storeId}/admin/store`, { token: getAdminToken(storeId) });
  return mapStore(data);
}

export async function updateAdminStore(storeId: number, payload: Partial<Store>): Promise<Store> {
  const data = await apiPut<ApiStore>(`/stores/id/${storeId}/admin/store`, {
    name: payload.name,
    domain: payload.domain,
    subdomain: payload.subdomain,
    primary_color: payload.primaryColor,
    logo_url: payload.logoUrl,
    banner_url: payload.bannerUrl,
    whatsapp_number: payload.whatsappNumber,
    service_hours: payload.serviceHours,
  }, { token: getAdminToken(storeId) });
  return mapStore(data);
}

export async function fetchWhatsAppSettings(storeId: number) {
  return apiGet(`/stores/id/${storeId}/admin/whatsapp-settings`, { token: getAdminToken(storeId) });
}

export async function updateWhatsAppSettings(storeId: number, payload: {
  whatsapp_number: string;
  default_message_template: string;
  cart_message_template: string;
  single_product_message_template: string;
  is_active?: boolean;
}) {
  return apiPut(`/stores/id/${storeId}/admin/whatsapp-settings`, payload, { token: getAdminToken(storeId) });
}

export async function fetchAdminBannerSettings(storeId: number): Promise<StoreBannerSettings> {
  const data = await apiGet<ApiBannerSettings>(`/stores/id/${storeId}/admin/banner-settings`, { token: getAdminToken(storeId) });
  return mapBannerSettings(data);
}

export async function updateAdminBannerSettings(storeId: number, payload: {
  title: string;
  subtitle: string;
  button_text: string;
  button_url: string;
  title_color: string;
  subtitle_color: string;
  button_bg_color: string;
  button_text_color: string;
  is_active?: boolean;
}): Promise<StoreBannerSettings> {
  const data = await apiPut<ApiBannerSettings>(`/stores/id/${storeId}/admin/banner-settings`, payload, { token: getAdminToken(storeId) });
  return mapBannerSettings(data);
}

function mapStore(s: ApiStore): Store {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description || '',
    serviceHours: s.service_hours || '',
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

function mapBannerSettings(b: ApiBannerSettings): StoreBannerSettings {
  return {
    storeId: b.store_id,
    title: b.title || 'Coleção Outono/Inverno 2026',
    subtitle: b.subtitle || 'Descubra as últimas tendências em moda com até 30% de desconto',
    buttonText: b.button_text || 'Ver Coleção',
    buttonUrl: b.button_url || '',
    titleColor: b.title_color || '#FFFFFF',
    subtitleColor: b.subtitle_color || '#F5F5F5',
    buttonBgColor: b.button_bg_color || '#FFFFFF',
    buttonTextColor: b.button_text_color || '#111111',
    isActive: b.is_active !== false,
  };
}

