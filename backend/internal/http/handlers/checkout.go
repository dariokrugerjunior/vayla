package handlers

import (
	"fmt"
	"strings"

	"multi-tennet/internal/service"

	"github.com/gin-gonic/gin"
)

type CheckoutItemRequest struct {
	ProductID int64  `json:"product_id"`
	VariantID *int64 `json:"variant_id"`
	Quantity  int    `json:"quantity"`
}

type CheckoutRequest struct {
	StoreSlug string                `json:"store_slug"`
	StoreID   *int64                `json:"store_id"`
	CustomerName  string            `json:"customer_name"`
	CustomerPhone string            `json:"customer_phone"`
	Items     []CheckoutItemRequest `json:"items"`
}

func (h *HandlerContainer) CheckoutWhatsApp(c *gin.Context) {
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	if req.StoreSlug == "" && req.StoreID == nil {
		JSONError(c, 400, fmt.Errorf("store_slug or store_id is required"))
		return
	}
	if req.StoreID != nil && *req.StoreID <= 0 {
		JSONError(c, 400, errInvalid("store_id"))
		return
	}
	if len(req.Items) == 0 {
		JSONError(c, 400, fmt.Errorf("items must not be empty"))
		return
	}
	req.CustomerName = strings.TrimSpace(req.CustomerName)
	req.CustomerPhone = strings.TrimSpace(req.CustomerPhone)
	if req.CustomerName == "" {
		JSONError(c, 400, errMissing("customer_name"))
		return
	}
	if req.CustomerPhone == "" {
		JSONError(c, 400, errMissing("customer_phone"))
		return
	}

	items := make([]service.CheckoutItemInput, 0, len(req.Items))
	for _, it := range req.Items {
		if it.ProductID <= 0 {
			JSONError(c, 400, errInvalid("product_id"))
			return
		}
		if it.Quantity <= 0 {
			JSONError(c, 400, errInvalid("quantity"))
			return
		}

		items = append(items, service.CheckoutItemInput{
			ProductID: it.ProductID,
			VariantID: it.VariantID,
			Quantity:  it.Quantity,
		})
	}

	var (
		result service.CheckoutResult
		err    error
	)
	if req.StoreID != nil {
		result, err = h.CheckoutSvc.CheckoutWhatsAppByStoreID(
			c.Request.Context(),
			*req.StoreID,
			items,
			req.CustomerName,
			req.CustomerPhone,
		)
	} else {
		result, err = h.CheckoutSvc.CheckoutWhatsApp(
			c.Request.Context(),
			req.StoreSlug,
			items,
			req.CustomerName,
			req.CustomerPhone,
		)
	}
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	JSONOK(c, result)
}
