package handlers

import (
	"strconv"

	api "multi-tennet/internal/http"

	"github.com/gin-gonic/gin"
)

func (h *HandlerContainer) ListProducts(c *gin.Context) {
	slug := c.Param("slug")
	store, err := h.StoreRepo.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		api.JSONError(c, 404, err)
		return
	}

	items, err := h.ProductRepo.ListByStoreID(c.Request.Context(), store.ID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, items)
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

	api.JSONOK(c, gin.H{
		"product":  item,
		"variants": variants,
	})
}

func (h *HandlerContainer) AdminListProducts(c *gin.Context) {
	storeIDStr := c.Query("store_id")
	if storeIDStr == "" {
		api.JSONError(c, 400, errMissing("store_id"))
		return
	}
	storeID, err := strconv.ParseInt(storeIDStr, 10, 64)
	if err != nil {
		api.JSONError(c, 400, errInvalid("store_id"))
		return
	}

	items, err := h.ProductRepo.ListByStoreID(c.Request.Context(), storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, items)
}

