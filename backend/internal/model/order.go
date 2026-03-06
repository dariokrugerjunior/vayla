package model

import "time"

type Order struct {
	ID              int64      `json:"id"`
	StoreID         int64      `json:"store_id"`
	CustomerID      *int64     `json:"customer_id"`
	OrderNumber     string     `json:"order_number"`
	Source          string     `json:"source"`
	Status          string     `json:"status"`
	Subtotal        float64    `json:"subtotal"`
	DiscountAmount  float64    `json:"discount_amount"`
	TotalAmount     float64    `json:"total_amount"`
	WhatsAppMessage string     `json:"whatsapp_message"`
	WhatsAppSentAt  *time.Time `json:"whatsapp_sent_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

