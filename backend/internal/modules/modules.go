package modules

import (
	"multi-tennet/internal/http/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterPublicRoutes(router *gin.Engine, h *handlers.HandlerContainer) {
	router.GET("/stores/:slug", h.GetStore)
	router.GET("/stores/:slug/categories", h.ListCategories)
	router.GET("/stores/:slug/products", h.ListProducts)
	router.GET("/stores/:slug/products/:productSlug", h.GetProduct)
	router.POST("/checkout/whatsapp", h.CheckoutWhatsApp)
}

func RegisterAdminRoutes(router *gin.Engine, h *handlers.HandlerContainer) {
	admin := router.Group("/admin")
	admin.GET("/products", h.AdminListProducts)
	admin.POST("/products", h.AdminCreateProduct)
}

