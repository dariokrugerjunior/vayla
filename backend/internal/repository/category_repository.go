package repository

import (
	"context"
	"database/sql"

	"multi-tennet/internal/model"
)

type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) ListByStoreID(ctx context.Context, storeID int64) ([]model.Category, error) {
	const query = `
		SELECT id, store_id, name, slug, description, is_active, sort_order, created_at, updated_at
		FROM categories
		WHERE store_id = $1 AND is_active = true
		ORDER BY sort_order ASC, name ASC
	`

	rows, err := r.db.QueryContext(ctx, query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.Category{}
	for rows.Next() {
		var c model.Category
		if err := rows.Scan(
			&c.ID, &c.StoreID, &c.Name, &c.Slug, &c.Description, &c.IsActive, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, c)
	}

	return items, nil
}

func (r *CategoryRepository) ListWithProductCount(ctx context.Context, storeID int64) ([]model.Category, error) {
	const query = `
		SELECT c.id, c.store_id, c.name, c.slug, c.description, c.is_active, c.sort_order, c.created_at, c.updated_at,
			COUNT(p.id) FILTER (WHERE p.is_active = true) AS product_count
		FROM categories c
		LEFT JOIN products p ON p.category_id = c.id
		WHERE c.store_id = $1 AND c.is_active = true
		GROUP BY c.id
		ORDER BY c.sort_order ASC, c.name ASC
	`

	rows, err := r.db.QueryContext(ctx, query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []model.Category{}
	for rows.Next() {
		var c model.Category
		if err := rows.Scan(
			&c.ID, &c.StoreID, &c.Name, &c.Slug, &c.Description, &c.IsActive, &c.SortOrder, &c.CreatedAt, &c.UpdatedAt, &c.ProductCount,
		); err != nil {
			return nil, err
		}
		items = append(items, c)
	}

	return items, nil
}

