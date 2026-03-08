package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"strconv"
)

type StoreBannerSettingsResponse struct {
	StoreID         int64  `json:"store_id"`
	Title           string `json:"title"`
	Subtitle        string `json:"subtitle"`
	ButtonText      string `json:"button_text"`
	ButtonURL       string `json:"button_url"`
	TitleColor      string `json:"title_color"`
	SubtitleColor   string `json:"subtitle_color"`
	ButtonBGColor   string `json:"button_bg_color"`
	ButtonTextColor string `json:"button_text_color"`
	IsActive        bool   `json:"is_active"`
}

type StoreWhatsAppSettingsResponse struct {
	StoreID        int64  `json:"store_id"`
	WhatsAppNumber string `json:"whatsapp_number"`
	IsActive       bool   `json:"is_active"`
}

func defaultBannerSettings(storeID int64) StoreBannerSettingsResponse {
	return StoreBannerSettingsResponse{
		StoreID:         storeID,
		Title:           "Coleção Outono/Inverno 2026",
		Subtitle:        "Descubra as últimas tendências em moda com até 30% de desconto",
		ButtonText:      "Ver Coleção",
		ButtonURL:       "",
		TitleColor:      "#FFFFFF",
		SubtitleColor:   "#F5F5F5",
		ButtonBGColor:   "#FFFFFF",
		ButtonTextColor: "#111111",
		IsActive:        true,
	}
}

func (h *HandlerContainer) GetStore(c *gin.Context) {
	slug := c.Param("slug")
	store, err := h.StoreRepo.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		JSONError(c, 404, err)
		return
	}

	JSONOK(c, store)
}

func (h *HandlerContainer) GetStoreByID(c *gin.Context) {
	storeID, err := strconv.ParseInt(c.Param("storeID"), 10, 64)
	if err != nil || storeID <= 0 {
		JSONError(c, 400, errInvalid("storeID"))
		return
	}

	store, err := h.StoreRepo.GetByID(c.Request.Context(), storeID)
	if err != nil {
		JSONError(c, 404, err)
		return
	}

	JSONOK(c, store)
}

func (h *HandlerContainer) GetStoreBannerSettingsByID(c *gin.Context) {
	storeID, err := strconv.ParseInt(c.Param("storeID"), 10, 64)
	if err != nil || storeID <= 0 {
		JSONError(c, 400, errInvalid("storeID"))
		return
	}

	if _, err := h.StoreRepo.GetByID(c.Request.Context(), storeID); err != nil {
		JSONError(c, 404, err)
		return
	}

	const query = `
		SELECT store_id, title, subtitle, button_text, button_url, title_color, subtitle_color, button_bg_color, button_text_color, is_active
		FROM store_banners
		WHERE store_id = $1
		LIMIT 1
	`

	var banner StoreBannerSettingsResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&banner.StoreID, &banner.Title, &banner.Subtitle, &banner.ButtonText, &banner.ButtonURL,
		&banner.TitleColor, &banner.SubtitleColor, &banner.ButtonBGColor, &banner.ButtonTextColor, &banner.IsActive,
	); err != nil {
		if err == sql.ErrNoRows {
			JSONOK(c, defaultBannerSettings(storeID))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, banner)
}

func (h *HandlerContainer) GetStoreWhatsAppSettingsByID(c *gin.Context) {
	storeID, err := strconv.ParseInt(c.Param("storeID"), 10, 64)
	if err != nil || storeID <= 0 {
		JSONError(c, 400, errInvalid("storeID"))
		return
	}

	if _, err := h.StoreRepo.GetByID(c.Request.Context(), storeID); err != nil {
		JSONError(c, 404, err)
		return
	}

	const query = `
		SELECT store_id, COALESCE(whatsapp_number, '') AS whatsapp_number, is_active
		FROM whatsapp_settings
		WHERE store_id = $1
		LIMIT 1
	`

	var settings StoreWhatsAppSettingsResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&settings.StoreID, &settings.WhatsAppNumber, &settings.IsActive,
	); err != nil {
		if err == sql.ErrNoRows {
			JSONOK(c, StoreWhatsAppSettingsResponse{StoreID: storeID, IsActive: true})
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, settings)
}
