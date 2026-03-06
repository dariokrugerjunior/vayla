package handlers

import (
	"fmt"

	api "multi-tennet/internal/http"
	"multi-tennet/internal/service"

	"github.com/gin-gonic/gin"
)

type CheckoutItemRequest struct {
	ProductID int64  `json:"product_id"`
	VariantID *int64 `json:"variant_id"`
	Quantity  int    `json:"quantity"`
}

type CheckoutRequest struct {
	StoreSlug string               `json:"store_slug"`
	Items     []CheckoutItemRequest `json:"items"`
}

func (h *HandlerContainer) CheckoutWhatsApp(c *gin.Context) {
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		api.JSONError(c, 400, err)
		return
	}

	if req.StoreSlug == "" {
		api.JSONError(c, 400, errMissing("store_slug"))
		return
	}
	if len(req.Items) == 0 {
		api.JSONError(c, 400, fmt.Errorf("items must not be empty"))
		return
	}

	items := make([]service.CheckoutItemInput, 0, len(req.Items))
	for _, it := range req.Items {
		if it.ProductID <= 0 {
			api.JSONError(c, 400, errInvalid("product_id"))
			return
		}
		if it.Quantity <= 0 {
			api.JSONError(c, 400, errInvalid("quantity"))
			return
		}

		items = append(items, service.CheckoutItemInput{
			ProductID: it.ProductID,
			VariantID: it.VariantID,
			Quantity:  it.Quantity,
		})
	}

	result, err := h.CheckoutSvc.CheckoutWhatsApp(c.Request.Context(), req.StoreSlug, items)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	api.JSONOK(c, result)
}

