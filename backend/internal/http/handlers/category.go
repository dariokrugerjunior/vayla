package handlers

import (
	"github.com/gin-gonic/gin"
	"strconv"
)

func (h *HandlerContainer) ListCategories(c *gin.Context) {
	slug := c.Param("slug")
	store, err := h.StoreRepo.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		JSONError(c, 404, err)
		return
	}

	items, err := h.CategoryRepo.ListWithProductCount(c.Request.Context(), store.ID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, items)
}

func (h *HandlerContainer) ListCategoriesByID(c *gin.Context) {
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

	items, err := h.CategoryRepo.ListWithProductCount(c.Request.Context(), store.ID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, items)
}
