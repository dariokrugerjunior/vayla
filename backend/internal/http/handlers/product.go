package handlers

import (
	"time"

	api "multi-tennet/internal/http"

	"github.com/gin-gonic/gin"
)

type PublicProductResponse struct {
	ID            int64    `json:"id"`
	Slug          string   `json:"slug"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	ShortDescription string `json:"short_description"`
	Price         float64  `json:"price"`
	DiscountPrice float64  `json:"discount_price"`
	CategoryID    int64    `json:"category_id"`
	Images        []string `json:"images"`
	IsFeatured    bool     `json:"is_featured"`
	IsActive      bool     `json:"is_active"`
	CreatedAt     string   `json:"created_at"`
}

func (h *HandlerContainer) ListProducts(c *gin.Context) {
	slug := c.Param("slug")
	store, err := h.StoreRepo.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		api.JSONError(c, 404, err)
		return
	}

	items, err := h.ProductRepo.ListByStoreIDWithCover(c.Request.Context(), store.ID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	resp := make([]PublicProductResponse, 0, len(items))
	for _, p := range items {
		images := []string{}
		if p.CoverImageURL != "" {
			images = append(images, p.CoverImageURL)
		}
		resp = append(resp, PublicProductResponse{
			ID:            p.ID,
			Slug:          p.Slug,
			Name:          p.Name,
			Description:   p.Description,
			ShortDescription: p.ShortDescription,
			Price:         p.Price,
			DiscountPrice: p.DiscountPrice,
			CategoryID:    p.CategoryID,
			Images:        images,
			IsFeatured:    p.IsFeatured,
			IsActive:      p.IsActive,
			CreatedAt:     p.CreatedAt.Format(time.RFC3339),
		})
	}

	api.JSONOK(c, resp)
}

func (h *HandlerContainer) GetProduct(c *gin.Context) {
	slug := c.Param("slug")
	productSlug := c.Param("productSlug")

	store, err := h.StoreRepo.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		api.JSONError(c, 404, err)
		return
	}

	item, err := h.ProductRepo.GetBySlug(c.Request.Context(), store.ID, productSlug)
	if err != nil {
		api.JSONError(c, 404, err)
		return
	}

	variants, err := h.ProductRepo.ListVariantsByProductID(c.Request.Context(), item.ID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	images, err := h.ProductRepo.ListImagesByProductID(c.Request.Context(), item.ID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	var category struct {
		ID   int64  `json:"id"`
		Name string `json:"name"`
		Slug string `json:"slug"`
	}
	_ = h.DB.QueryRowContext(c.Request.Context(), `SELECT id, name, slug FROM categories WHERE id = $1`, item.CategoryID).
		Scan(&category.ID, &category.Name, &category.Slug)

	api.JSONOK(c, gin.H{
		"product":  item,
		"variants": variants,
		"images":   images,
		"category": category,
	})
}
