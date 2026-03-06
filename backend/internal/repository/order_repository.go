package repository

import (
	"context"
	"database/sql"

	"multi-tennet/internal/model"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) CreateOrder(ctx context.Context, tx *sql.Tx, o *model.Order) (int64, error) {
	const query = `
		INSERT INTO orders (
			store_id, customer_id, order_number, source, status, subtotal, discount_amount, total_amount, whatsapp_message
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		RETURNING id
	`

	var id int64
	if err := tx.QueryRowContext(ctx, query,
		o.StoreID, o.CustomerID, o.OrderNumber, o.Source, o.Status, o.Subtotal, o.DiscountAmount, o.TotalAmount, o.WhatsAppMessage,
	).Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r *OrderRepository) CreateOrderItems(ctx context.Context, tx *sql.Tx, items []model.OrderItem) error {
	const query = `
		INSERT INTO order_items (
			order_id, product_id, product_variant_id, product_name_snapshot, color_snapshot, size_snapshot,
			quantity, unit_price, total_price
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
	`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, it := range items {
		if _, err := stmt.ExecContext(ctx,
			it.OrderID, it.ProductID, it.ProductVariantID, it.ProductNameSnapshot, it.ColorSnapshot,
			it.SizeSnapshot, it.Quantity, it.UnitPrice, it.TotalPrice,
		); err != nil {
			return err
		}
	}

	return nil
}

