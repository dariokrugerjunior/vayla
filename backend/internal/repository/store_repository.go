package repository

import (
	"context"
	"database/sql"
	"errors"

	"multi-tennet/internal/model"
)

type StoreRepository struct {
	db *sql.DB
}

func NewStoreRepository(db *sql.DB) *StoreRepository {
	return &StoreRepository{db: db}
}

func (r *StoreRepository) GetBySlug(ctx context.Context, slug string) (model.Store, error) {
	const query = `
		SELECT id, name, slug, description, whatsapp_number, logo_url, banner_url, primary_color,
			domain, subdomain, is_active, created_at, updated_at
		FROM stores
		WHERE slug = $1 AND is_active = true
		LIMIT 1
	`

	var s model.Store
	row := r.db.QueryRowContext(ctx, query, slug)
	if err := row.Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.LogoURL, &s.BannerURL,
		&s.PrimaryColor, &s.Domain, &s.Subdomain, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return s, errors.New("store not found")
		}
		return s, err
	}

	return s, nil
}

