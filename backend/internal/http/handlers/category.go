package handlers

import (
	api "multi-tennet/internal/http"

	"github.com/gin-gonic/gin"
)

func (h *HandlerContainer) ListCategories(c *gin.Context) {
	slug := c.Param("slug")
	store, err := h.StoreRepo.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		api.JSONError(c, 404, err)
		return
	}

	items, err := h.CategoryRepo.ListWithProductCount(c.Request.Context(), store.ID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, items)
}

