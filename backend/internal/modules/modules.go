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
	admin.GET("/products/:id", h.AdminGetProduct)
	admin.POST("/products", h.AdminCreateProduct)
	admin.PUT("/products/:id", h.AdminUpdateProduct)
	admin.GET("/categories", h.AdminListCategories)
	admin.GET("/orders", h.AdminListOrders)
	admin.GET("/customers", h.AdminListCustomers)
	admin.GET("/inventory", h.AdminListInventory)
	admin.GET("/dashboard", h.AdminDashboard)
	admin.GET("/analytics", h.AdminAnalytics)
	admin.GET("/store", h.AdminGetStore)
	admin.PUT("/store", h.AdminUpdateStore)
	admin.GET("/whatsapp-settings", h.AdminGetWhatsAppSettings)
	admin.PUT("/whatsapp-settings", h.AdminUpdateWhatsAppSettings)
}

