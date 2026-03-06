BEGIN;

CREATE TABLE IF NOT EXISTS stores (
	id BIGSERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	description TEXT,
	whatsapp_number TEXT NOT NULL,
	logo_url TEXT,
	banner_url TEXT,
	primary_color TEXT,
	domain TEXT,
	subdomain TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_domain_unique ON stores(domain) WHERE domain IS NOT NULL AND domain <> '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_subdomain_unique ON stores(subdomain) WHERE subdomain IS NOT NULL AND subdomain <> '';
CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores(created_at);

CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL CHECK (role IN ('owner','admin','attendant','stock_manager')),
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (store_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE TABLE IF NOT EXISTS categories (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	name TEXT NOT NULL,
	slug TEXT NOT NULL,
	description TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	sort_order INT NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON categories(created_at);

CREATE TABLE IF NOT EXISTS products (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
	name TEXT NOT NULL,
	slug TEXT NOT NULL,
	description TEXT,
	short_description TEXT,
	sku TEXT,
	price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
	discount_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_price >= 0),
	brand TEXT,
	gender TEXT,
	is_featured BOOLEAN NOT NULL DEFAULT FALSE,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (store_id, slug)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_store_sku_unique ON products(store_id, sku) WHERE sku IS NOT NULL AND sku <> '';
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE TABLE IF NOT EXISTS product_images (
	id BIGSERIAL PRIMARY KEY,
	product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
	image_url TEXT NOT NULL,
	sort_order INT NOT NULL DEFAULT 0,
	is_cover BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_created_at ON product_images(created_at);

CREATE TABLE IF NOT EXISTS product_variants (
	id BIGSERIAL PRIMARY KEY,
	product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
	sku TEXT,
	color TEXT,
	size TEXT,
	stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
	reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
	price_override NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price_override >= 0),
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (product_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_created_at ON product_variants(created_at);

CREATE TABLE IF NOT EXISTS customers (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	name TEXT NOT NULL,
	phone TEXT,
	email TEXT,
	city TEXT,
	state TEXT,
	notes TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

CREATE TABLE IF NOT EXISTS carts (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
	session_id TEXT NOT NULL,
	status TEXT NOT NULL CHECK (status IN ('active','abandoned','converted')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_store_id ON carts(store_id);
CREATE INDEX IF NOT EXISTS idx_carts_customer_id ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_created_at ON carts(created_at);

CREATE TABLE IF NOT EXISTS cart_items (
	id BIGSERIAL PRIMARY KEY,
	cart_id BIGINT NOT NULL REFERENCES carts(id) ON DELETE RESTRICT,
	product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
	product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
	quantity INT NOT NULL CHECK (quantity > 0),
	unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(product_variant_id);

CREATE TABLE IF NOT EXISTS orders (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
	order_number TEXT NOT NULL,
	source TEXT NOT NULL CHECK (source IN ('storefront','admin','instagram','link')),
	status TEXT NOT NULL CHECK (status IN ('pending','contacted','confirmed','completed','cancelled')),
	subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
	discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
	total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
	whatsapp_message TEXT,
	whatsapp_sent_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (store_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
	id BIGSERIAL PRIMARY KEY,
	order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
	product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
	product_variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
	product_name_snapshot TEXT NOT NULL,
	color_snapshot TEXT,
	size_snapshot TEXT,
	quantity INT NOT NULL CHECK (quantity > 0),
	unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
	total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at ON order_items(created_at);

CREATE TABLE IF NOT EXISTS whatsapp_settings (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	whatsapp_number TEXT NOT NULL,
	default_message_template TEXT,
	cart_message_template TEXT,
	single_product_message_template TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (store_id)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_store_id ON whatsapp_settings(store_id);

CREATE TABLE IF NOT EXISTS store_banners (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	title TEXT NOT NULL DEFAULT 'Coleção Outono/Inverno 2026',
	subtitle TEXT NOT NULL DEFAULT 'Descubra as últimas tendências em moda com até 30% de desconto',
	button_text TEXT NOT NULL DEFAULT 'Ver Coleção',
	button_url TEXT NOT NULL DEFAULT '',
	title_color TEXT NOT NULL DEFAULT '#FFFFFF',
	subtitle_color TEXT NOT NULL DEFAULT '#F5F5F5',
	button_bg_color TEXT NOT NULL DEFAULT '#FFFFFF',
	button_text_color TEXT NOT NULL DEFAULT '#111111',
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	UNIQUE (store_id)
);

CREATE INDEX IF NOT EXISTS idx_store_banners_store_id ON store_banners(store_id);

CREATE TABLE IF NOT EXISTS product_views (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
	session_id TEXT NOT NULL,
	customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
	viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_store_id ON product_views(store_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_customer_id ON product_views(customer_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON product_views(viewed_at);

CREATE TABLE IF NOT EXISTS whatsapp_clicks (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
	cart_id BIGINT REFERENCES carts(id) ON DELETE SET NULL,
	order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
	customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
	session_id TEXT NOT NULL,
	clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_store_id ON whatsapp_clicks(store_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_product_id ON whatsapp_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_cart_id ON whatsapp_clicks(cart_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_order_id ON whatsapp_clicks(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_customer_id ON whatsapp_clicks(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_session_id ON whatsapp_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_clicked_at ON whatsapp_clicks(clicked_at);

CREATE TABLE IF NOT EXISTS inventory_movements (
	id BIGSERIAL PRIMARY KEY,
	store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
	product_variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
	type TEXT NOT NULL CHECK (type IN ('in','out','reserve','release','adjust')),
	quantity INT NOT NULL CHECK (quantity > 0),
	reason TEXT,
	reference_id BIGINT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant_id ON inventory_movements(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

COMMIT;

