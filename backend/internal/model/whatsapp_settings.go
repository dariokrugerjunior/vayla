package model

import "time"

type WhatsAppSettings struct {
	ID                        int64     `json:"id"`
	StoreID                   int64     `json:"store_id"`
	WhatsAppNumber            string    `json:"whatsapp_number"`
	DefaultMessageTemplate    string    `json:"default_message_template"`
	CartMessageTemplate       string    `json:"cart_message_template"`
	SingleProductMessageTemplate string `json:"single_product_message_template"`
	IsActive                  bool      `json:"is_active"`
	CreatedAt                 time.Time `json:"created_at"`
	UpdatedAt                 time.Time `json:"updated_at"`
}

