package model

import "time"

type ProductVariant struct {
	ID              int64     `json:"id"`
	ProductID       int64     `json:"product_id"`
	SKU             string    `json:"sku"`
	Color           string    `json:"color"`
	Size            string    `json:"size"`
	StockQuantity   int       `json:"stock_quantity"`
	ReservedQuantity int      `json:"reserved_quantity"`
	PriceOverride   float64   `json:"price_override"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

