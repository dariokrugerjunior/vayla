package model

import "time"

type Product struct {
	ID               int64     `json:"id"`
	StoreID          int64     `json:"store_id"`
	CategoryID       int64     `json:"category_id"`
	Name             string    `json:"name"`
	Slug             string    `json:"slug"`
	Description      string    `json:"description"`
	ShortDescription string    `json:"short_description"`
	SKU              string    `json:"sku"`
	Price            float64   `json:"price"`
	DiscountPrice    float64   `json:"discount_price"`
	Brand            string    `json:"brand"`
	Gender           string    `json:"gender"`
	IsFeatured       bool      `json:"is_featured"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

