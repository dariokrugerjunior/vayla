package repository

import (
	"context"
	"database/sql"
	"errors"

	"multi-tennet/internal/model"
)

type WhatsAppRepository struct {
	db *sql.DB
}

func NewWhatsAppRepository(db *sql.DB) *WhatsAppRepository {
	return &WhatsAppRepository{db: db}
}

func (r *WhatsAppRepository) GetActiveByStoreID(ctx context.Context, storeID int64) (model.WhatsAppSettings, error) {
	const query = `
		SELECT id, store_id, whatsapp_number, default_message_template, cart_message_template,
			single_product_message_template, is_active, created_at, updated_at
		FROM whatsapp_settings
		WHERE store_id = $1 AND is_active = true
		LIMIT 1
	`

	var s model.WhatsAppSettings
	row := r.db.QueryRowContext(ctx, query, storeID)
	if err := row.Scan(
		&s.ID, &s.StoreID, &s.WhatsAppNumber, &s.DefaultMessageTemplate, &s.CartMessageTemplate,
		&s.SingleProductMessageTemplate, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return s, errors.New("whatsapp settings not found")
		}
		return s, err
	}

	return s, nil
}

