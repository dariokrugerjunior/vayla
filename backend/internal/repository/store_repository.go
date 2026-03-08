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
		SELECT id, name, slug,
			COALESCE(description, '') AS description,
			whatsapp_number,
			COALESCE(service_hours, '') AS service_hours,
			COALESCE(logo_url, '') AS logo_url,
			COALESCE(banner_url, '') AS banner_url,
			COALESCE(primary_color, '') AS primary_color,
			COALESCE(domain, '') AS domain,
			COALESCE(subdomain, '') AS subdomain,
			is_active, created_at, updated_at
		FROM stores
		WHERE slug = $1 AND is_active = true
		LIMIT 1
	`

	var s model.Store
	row := r.db.QueryRowContext(ctx, query, slug)
	if err := row.Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.ServiceHours, &s.LogoURL, &s.BannerURL,
		&s.PrimaryColor, &s.Domain, &s.Subdomain, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return s, errors.New("store not found")
		}
		return s, err
	}

	return s, nil
}

func (r *StoreRepository) GetByID(ctx context.Context, storeID int64) (model.Store, error) {
	const query = `
		SELECT id, name, slug,
			COALESCE(description, '') AS description,
			whatsapp_number,
			COALESCE(service_hours, '') AS service_hours,
			COALESCE(logo_url, '') AS logo_url,
			COALESCE(banner_url, '') AS banner_url,
			COALESCE(primary_color, '') AS primary_color,
			COALESCE(domain, '') AS domain,
			COALESCE(subdomain, '') AS subdomain,
			is_active, created_at, updated_at
		FROM stores
		WHERE id = $1 AND is_active = true
		LIMIT 1
	`

	var s model.Store
	row := r.db.QueryRowContext(ctx, query, storeID)
	if err := row.Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.ServiceHours, &s.LogoURL, &s.BannerURL,
		&s.PrimaryColor, &s.Domain, &s.Subdomain, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return s, errors.New("store not found")
		}
		return s, err
	}

	return s, nil
}

func (r *StoreRepository) GetByDomain(ctx context.Context, host string) (model.Store, error) {
	const query = `
		SELECT id, name, slug,
			COALESCE(description, '') AS description,
			whatsapp_number,
			COALESCE(service_hours, '') AS service_hours,
			COALESCE(logo_url, '') AS logo_url,
			COALESCE(banner_url, '') AS banner_url,
			COALESCE(primary_color, '') AS primary_color,
			COALESCE(domain, '') AS domain,
			COALESCE(subdomain, '') AS subdomain,
			is_active, created_at, updated_at
		FROM stores
		WHERE is_active = true
			AND (
				lower(COALESCE(domain, '')) = lower($1)
				OR lower(COALESCE(subdomain, '')) = lower($1)
				OR lower(COALESCE(subdomain, '')) = lower(split_part($1, '.', 1))
			)
		LIMIT 1
	`

	var s model.Store
	row := r.db.QueryRowContext(ctx, query, host)
	if err := row.Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.ServiceHours, &s.LogoURL, &s.BannerURL,
		&s.PrimaryColor, &s.Domain, &s.Subdomain, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return s, errors.New("store not found")
		}
		return s, err
	}

	return s, nil
}
