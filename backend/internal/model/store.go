package model

import "time"

type Store struct {
	ID            int64     `json:"id"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Description   string    `json:"description"`
	WhatsApp      string    `json:"whatsapp_number"`
	ServiceHours  string    `json:"service_hours"`
	LogoURL       string    `json:"logo_url"`
	BannerURL     string    `json:"banner_url"`
	PrimaryColor  string    `json:"primary_color"`
	Domain        string    `json:"domain"`
	Subdomain     string    `json:"subdomain"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

