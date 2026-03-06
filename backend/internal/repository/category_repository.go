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

