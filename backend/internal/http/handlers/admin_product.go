package handlers

import (
	"fmt"
	"strconv"
	"strings"

	api "multi-tennet/internal/http"
	"multi-tennet/internal/model"
	"multi-tennet/internal/util"

	"github.com/gin-gonic/gin"
)

type AdminProductVariantInput struct {
	SKU   string `json:"sku"`
	Color string `json:"color"`
	Size  string `json:"size"`
	Stock int    `json:"stock"`
	PriceOverride float64 `json:"price_override"`
	IsActive *bool `json:"is_active"`
}

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
	Variants         []AdminProductVariantInput `json:"variants"`
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

	if err := h.insertVariants(c, id, req.Variants); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONCreated(c, gin.H{"id": id})
}

func (h *HandlerContainer) AdminUpdateProduct(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}
	idStr := c.Param("id")
	productID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || productID <= 0 {
		api.JSONError(c, 400, errInvalid("id"))
		return
	}

	var req AdminCreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		api.JSONError(c, 400, err)
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

	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		slug = util.Slugify(req.Name)
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	const query = `
		UPDATE products
		SET category_id = $3,
			name = $4,
			slug = $5,
			description = $6,
			short_description = $7,
			sku = $8,
			price = $9,
			discount_price = $10,
			brand = $11,
			gender = $12,
			is_featured = $13,
			is_active = $14,
			updated_at = NOW()
		WHERE id = $1 AND store_id = $2
	`

	if _, err := h.DB.ExecContext(c.Request.Context(), query,
		productID, storeID, req.CategoryID, strings.TrimSpace(req.Name), slug,
		strings.TrimSpace(req.Description), strings.TrimSpace(req.ShortDescription), strings.TrimSpace(req.SKU),
		req.Price, req.DiscountPrice, strings.TrimSpace(req.Brand), strings.TrimSpace(req.Gender),
		req.IsFeatured, isActive,
	); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	if err := h.replaceVariants(c, productID, req.Variants); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, gin.H{"id": productID})
}

func (h *HandlerContainer) insertVariants(c *gin.Context, productID int64, variants []AdminProductVariantInput) error {
	if len(variants) == 0 {
		return nil
	}

	const query = `
		INSERT INTO product_variants (product_id, sku, color, size, stock_quantity, price_override, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
	`

	stmt, err := h.DB.PrepareContext(c.Request.Context(), query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, v := range variants {
		isActive := true
		if v.IsActive != nil {
			isActive = *v.IsActive
		}
		if _, err := stmt.ExecContext(c.Request.Context(),
			productID, strings.TrimSpace(v.SKU), strings.TrimSpace(v.Color), strings.TrimSpace(v.Size), v.Stock, v.PriceOverride, isActive,
		); err != nil {
			return err
		}
	}
	return nil
}

func (h *HandlerContainer) replaceVariants(c *gin.Context, productID int64, variants []AdminProductVariantInput) error {
	if _, err := h.DB.ExecContext(c.Request.Context(), `DELETE FROM product_variants WHERE product_id = $1`, productID); err != nil {
		return err
	}
	return h.insertVariants(c, productID, variants)
}

