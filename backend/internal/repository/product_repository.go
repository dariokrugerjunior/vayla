package repository

import (
	"context"
	"database/sql"
	"errors"

	"multi-tennet/internal/model"
)

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) ListByStoreID(ctx context.Context, storeID int64) ([]model.Product, error) {
	const query = `
		SELECT id, store_id, category_id, name, slug, description, short_description, sku,
			price, discount_price, brand, gender, is_featured, is_active, created_at, updated_at
		FROM products
		WHERE store_id = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.Product{}
	for rows.Next() {
		var p model.Product
		if err := rows.Scan(
			&p.ID, &p.StoreID, &p.CategoryID, &p.Name, &p.Slug, &p.Description, &p.ShortDescription,
			&p.SKU, &p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, p)
	}

	return items, nil
}

func (r *ProductRepository) ListByStoreIDWithCover(ctx context.Context, storeID int64) ([]model.ProductWithCover, error) {
	const query = `
		SELECT p.id, p.store_id, p.category_id, p.name, p.slug, p.description, p.short_description, p.sku,
			p.price, p.discount_price, p.brand, p.gender, p.is_featured, p.is_active,
			COALESCE(pi.image_url, '') AS cover_image_url, p.created_at, p.updated_at
		FROM products p
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = p.id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		WHERE p.store_id = $1 AND p.is_active = true
		ORDER BY p.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.ProductWithCover{}
	for rows.Next() {
		var p model.ProductWithCover
		if err := rows.Scan(
			&p.ID, &p.StoreID, &p.CategoryID, &p.Name, &p.Slug, &p.Description, &p.ShortDescription,
			&p.SKU, &p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
			&p.CoverImageURL, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, p)
	}

	return items, nil
}

func (r *ProductRepository) GetBySlug(ctx context.Context, storeID int64, slug string) (model.Product, error) {
	const query = `
		SELECT id, store_id, category_id, name, slug, description, short_description, sku,
			price, discount_price, brand, gender, is_featured, is_active, created_at, updated_at
		FROM products
		WHERE store_id = $1 AND slug = $2 AND is_active = true
		LIMIT 1
	`

	var p model.Product
	row := r.db.QueryRowContext(ctx, query, storeID, slug)
	if err := row.Scan(
		&p.ID, &p.StoreID, &p.CategoryID, &p.Name, &p.Slug, &p.Description, &p.ShortDescription,
		&p.SKU, &p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
		&p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return p, errors.New("product not found")
		}
		return p, err
	}

	return p, nil
}

func (r *ProductRepository) GetByID(ctx context.Context, storeID, productID int64) (model.Product, error) {
	const query = `
		SELECT id, store_id, category_id, name, slug, description, short_description, sku,
			price, discount_price, brand, gender, is_featured, is_active, created_at, updated_at
		FROM products
		WHERE store_id = $1 AND id = $2 AND is_active = true
		LIMIT 1
	`

	var p model.Product
	row := r.db.QueryRowContext(ctx, query, storeID, productID)
	if err := row.Scan(
		&p.ID, &p.StoreID, &p.CategoryID, &p.Name, &p.Slug, &p.Description, &p.ShortDescription,
		&p.SKU, &p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
		&p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return p, errors.New("product not found")
		}
		return p, err
	}

	return p, nil
}

func (r *ProductRepository) ListVariantsByProductID(ctx context.Context, productID int64) ([]model.ProductVariant, error) {
	const query = `
		SELECT id, product_id, sku, color, size, stock_quantity, reserved_quantity, price_override, is_active, created_at, updated_at
		FROM product_variants
		WHERE product_id = $1 AND is_active = true
		ORDER BY created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.ProductVariant{}
	for rows.Next() {
		var v model.ProductVariant
		if err := rows.Scan(
			&v.ID, &v.ProductID, &v.SKU, &v.Color, &v.Size, &v.StockQuantity,
			&v.ReservedQuantity, &v.PriceOverride, &v.IsActive, &v.CreatedAt, &v.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, v)
	}

	return items, nil
}

func (r *ProductRepository) GetVariantByID(ctx context.Context, productID, variantID int64) (model.ProductVariant, error) {
	const query = `
		SELECT id, product_id, sku, color, size, stock_quantity, reserved_quantity, price_override, is_active, created_at, updated_at
		FROM product_variants
		WHERE product_id = $1 AND id = $2 AND is_active = true
		LIMIT 1
	`

	var v model.ProductVariant
	row := r.db.QueryRowContext(ctx, query, productID, variantID)
	if err := row.Scan(
		&v.ID, &v.ProductID, &v.SKU, &v.Color, &v.Size, &v.StockQuantity,
		&v.ReservedQuantity, &v.PriceOverride, &v.IsActive, &v.CreatedAt, &v.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return v, errors.New("variant not found")
		}
		return v, err
	}

	return v, nil
}

func (r *ProductRepository) ListImagesByProductID(ctx context.Context, productID int64) ([]string, error) {
	const query = `
		SELECT image_url
		FROM product_images
		WHERE product_id = $1
		ORDER BY is_cover DESC, sort_order ASC, id ASC
	`

	rows, err := r.db.QueryContext(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	images := []string{}
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			return nil, err
		}
		images = append(images, url)
	}

	return images, nil
}

func (r *ProductRepository) Create(ctx context.Context, p *model.Product) (int64, error) {
	const query = `
		INSERT INTO products (store_id, category_id, name, slug, description, short_description, sku, price,
			discount_price, brand, gender, is_featured, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
		RETURNING id
	`

	var id int64
	if err := r.db.QueryRowContext(ctx, query,
		p.StoreID, p.CategoryID, p.Name, p.Slug, p.Description, p.ShortDescription, p.SKU,
		p.Price, p.DiscountPrice, p.Brand, p.Gender, p.IsFeatured, p.IsActive,
	).Scan(&id); err != nil {
		return 0, err
	}

	return id, nil
}

