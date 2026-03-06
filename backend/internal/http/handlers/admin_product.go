package handlers

import (
	"fmt"
	"strings"

	api "multi-tennet/internal/http"
	"multi-tennet/internal/model"
	"multi-tennet/internal/util"

	"github.com/gin-gonic/gin"
)

type AdminCreateProductRequest struct {
	StoreID          int64   `json:"store_id"`
	CategoryID       int64   `json:"category_id"`
	Name             string  `json:"name"`
	Slug             string  `json:"slug"`
	Description      string  `json:"description"`
	ShortDescription string  `json:"short_description"`
	SKU              string  `json:"sku"`
	Price            float64 `json:"price"`
	DiscountPrice    float64 `json:"discount_price"`
	Brand            string  `json:"brand"`
	Gender           string  `json:"gender"`
	IsFeatured       bool    `json:"is_featured"`
	IsActive         *bool   `json:"is_active"`
}

func (h *HandlerContainer) AdminCreateProduct(c *gin.Context) {
	var req AdminCreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		api.JSONError(c, 400, err)
		return
	}

	if req.StoreID <= 0 {
		api.JSONError(c, 400, errInvalid("store_id"))
		return
	}
	if req.CategoryID <= 0 {
		api.JSONError(c, 400, errInvalid("category_id"))
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		api.JSONError(c, 400, errMissing("name"))
		return
	}
	if req.Price < 0 {
		api.JSONError(c, 400, fmt.Errorf("price must be >= 0"))
		return
	}
	if req.DiscountPrice < 0 {
		api.JSONError(c, 400, fmt.Errorf("discount_price must be >= 0"))
		return
	}

	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		slug = util.Slugify(req.Name)
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	p := model.Product{
		StoreID:          req.StoreID,
		CategoryID:       req.CategoryID,
		Name:             strings.TrimSpace(req.Name),
		Slug:             slug,
		Description:      strings.TrimSpace(req.Description),
		ShortDescription: strings.TrimSpace(req.ShortDescription),
		SKU:              strings.TrimSpace(req.SKU),
		Price:            req.Price,
		DiscountPrice:    req.DiscountPrice,
		Brand:            strings.TrimSpace(req.Brand),
		Gender:           strings.TrimSpace(req.Gender),
		IsFeatured:       req.IsFeatured,
		IsActive:         isActive,
	}

	id, err := h.ProductRepo.Create(c.Request.Context(), &p)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONCreated(c, gin.H{"id": id})
}

