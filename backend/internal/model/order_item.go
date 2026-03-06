package model

import "time"

type OrderItem struct {
	ID                 int64     `json:"id"`
	OrderID            int64     `json:"order_id"`
	ProductID          int64     `json:"product_id"`
	ProductVariantID   *int64    `json:"product_variant_id"`
	ProductNameSnapshot string   `json:"product_name_snapshot"`
	ColorSnapshot      string    `json:"color_snapshot"`
	SizeSnapshot       string    `json:"size_snapshot"`
	Quantity           int       `json:"quantity"`
	UnitPrice          float64   `json:"unit_price"`
	TotalPrice         float64   `json:"total_price"`
	CreatedAt          time.Time `json:"created_at"`
}

