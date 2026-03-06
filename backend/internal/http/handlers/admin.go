package handlers

import (
	"database/sql"
	"fmt"
	"strconv"
	"time"

	api "multi-tennet/internal/http"

	"github.com/gin-gonic/gin"
)

type AdminProductItem struct {
	ID            int64   `json:"id"`
	StoreID       int64   `json:"store_id"`
	CategoryID    int64   `json:"category_id"`
	CategoryName  string  `json:"category_name"`
	Name          string  `json:"name"`
	Slug          string  `json:"slug"`
	Description   string  `json:"description"`
	ShortDescription string `json:"short_description"`
	SKU           string  `json:"sku"`
	Price         float64 `json:"price"`
	DiscountPrice float64 `json:"discount_price"`
	Brand         string  `json:"brand"`
	Gender        string  `json:"gender"`
	IsFeatured    bool    `json:"is_featured"`
	IsActive      bool    `json:"is_active"`
	CoverImageURL string  `json:"cover_image_url"`
	TotalStock    int     `json:"total_stock"`
	Views         int     `json:"views"`
	Sales         int     `json:"sales"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type AdminInventoryItem struct {
	VariantID     int64  `json:"variant_id"`
	ProductID     int64  `json:"product_id"`
	ProductName   string `json:"product_name"`
	CategoryName  string `json:"category_name"`
	SKU           string `json:"sku"`
	Color         string `json:"color"`
	Size          string `json:"size"`
	StockQuantity int    `json:"stock_quantity"`
	CoverImageURL string `json:"cover_image_url"`
}

type AdminOrderItem struct {
	ProductID   int64  `json:"product_id"`
	VariantID   *int64 `json:"variant_id"`
	Name        string `json:"name"`
	Color       string `json:"color"`
	Size        string `json:"size"`
	Quantity    int    `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	ImageURL    string `json:"image_url"`
}

type AdminOrder struct {
	ID           int64         `json:"id"`
	OrderNumber  string        `json:"order_number"`
	CustomerName string        `json:"customer_name"`
	CustomerPhone string       `json:"customer_phone"`
	Status       string        `json:"status"`
	TotalAmount  float64       `json:"total_amount"`
	CreatedAt    time.Time     `json:"created_at"`
	Items        []AdminOrderItem `json:"items"`
}

type AdminCustomer struct {
	ID              int64     `json:"id"`
	Name            string    `json:"name"`
	Phone           string    `json:"phone"`
	TotalOrders     int       `json:"total_orders"`
	LastInteraction time.Time `json:"last_interaction"`
}

type DashboardResponse struct {
	TotalProducts int `json:"total_products"`
	TotalOrders   int `json:"total_orders"`
	TotalViews    int `json:"total_views"`
	ConversionRate float64 `json:"conversion_rate"`
	OrdersByDay   []DayMetric `json:"orders_by_day"`
	TopSoldProducts []AdminProductItem `json:"top_sold_products"`
	TopViewedProducts []AdminProductItem `json:"top_viewed_products"`
}

type AnalyticsResponse struct {
	DailyTraffic []TrafficMetric `json:"daily_traffic"`
	CategoryDistribution []CategoryMetric `json:"category_distribution"`
	ProductPerformance []AdminProductItem `json:"product_performance"`
	TotalViews int `json:"total_views"`
	TotalSales int `json:"total_sales"`
	AverageTicket float64 `json:"average_ticket"`
}

type DayMetric struct {
	Label  string `json:"label"`
	Orders int    `json:"orders"`
}

type TrafficMetric struct {
	Label  string `json:"label"`
	Visits int    `json:"visits"`
	Orders int    `json:"orders"`
}

type CategoryMetric struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type AdminStoreResponse struct {
	ID            int64  `json:"id"`
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Description   string `json:"description"`
	WhatsApp      string `json:"whatsapp_number"`
	LogoURL       string `json:"logo_url"`
	BannerURL     string `json:"banner_url"`
	PrimaryColor  string `json:"primary_color"`
	Domain        string `json:"domain"`
	Subdomain     string `json:"subdomain"`
}

type AdminUpdateStoreRequest struct {
	Name         string `json:"name"`
	Domain       string `json:"domain"`
	Subdomain    string `json:"subdomain"`
	PrimaryColor string `json:"primary_color"`
	LogoURL      string `json:"logo_url"`
	BannerURL    string `json:"banner_url"`
	WhatsApp     string `json:"whatsapp_number"`
}

type AdminWhatsAppSettings struct {
	ID                        int64  `json:"id"`
	StoreID                   int64  `json:"store_id"`
	WhatsAppNumber            string `json:"whatsapp_number"`
	DefaultMessageTemplate    string `json:"default_message_template"`
	CartMessageTemplate       string `json:"cart_message_template"`
	SingleProductMessageTemplate string `json:"single_product_message_template"`
	IsActive                  bool   `json:"is_active"`
}

type AdminUpdateWhatsAppRequest struct {
	WhatsAppNumber            string `json:"whatsapp_number"`
	DefaultMessageTemplate    string `json:"default_message_template"`
	CartMessageTemplate       string `json:"cart_message_template"`
	SingleProductMessageTemplate string `json:"single_product_message_template"`
	IsActive                  *bool  `json:"is_active"`
}

func getStoreIDParam(c *gin.Context) (int64, error) {
	storeIDStr := c.Query("store_id")
	if storeIDStr == "" {
		return 0, errMissing("store_id")
	}
	storeID, err := strconv.ParseInt(storeIDStr, 10, 64)
	if err != nil || storeID <= 0 {
		return 0, errInvalid("store_id")
	}
	return storeID, nil
}

func (h *HandlerContainer) AdminListProducts(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT p.id, p.store_id, p.category_id, c.name AS category_name,
			p.name, p.slug, p.description, p.short_description, p.sku,
			p.price, p.discount_price, p.brand, p.gender, p.is_featured, p.is_active,
			COALESCE(pi.image_url, '') AS cover_image_url,
			COALESCE(SUM(v.stock_quantity), 0) AS total_stock,
			COALESCE(views.view_count, 0) AS views,
			COALESCE(sales.sales_count, 0) AS sales,
			p.created_at, p.updated_at
		FROM products p
		JOIN categories c ON c.id = p.category_id
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = p.id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = true
		LEFT JOIN LATERAL (
			SELECT COUNT(*) AS view_count
			FROM product_views pv
			WHERE pv.product_id = p.id
		) views ON true
		LEFT JOIN LATERAL (
			SELECT COALESCE(SUM(oi.quantity),0) AS sales_count
			FROM order_items oi
			WHERE oi.product_id = p.id
		) sales ON true
		WHERE p.store_id = $1
		GROUP BY p.id, c.name, pi.image_url, views.view_count, sales.sales_count
		ORDER BY p.created_at DESC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}
	defer rows.Close()

	items := []AdminProductItem{}
	for rows.Next() {
		var p AdminProductItem
		if err := rows.Scan(
			&p.ID, &p.StoreID, &p.CategoryID, &p.CategoryName,
			&p.Name, &p.Slug, &p.Description, &p.ShortDescription, &p.SKU,
			&p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
			&p.CoverImageURL, &p.TotalStock, &p.Views, &p.Sales, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			api.JSONError(c, 500, err)
			return
		}
		items = append(items, p)
	}

	api.JSONOK(c, items)
}

func (h *HandlerContainer) AdminGetProduct(c *gin.Context) {
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

	const query = `
		SELECT p.id, p.store_id, p.category_id, c.name AS category_name,
			p.name, p.slug, p.description, p.short_description, p.sku,
			p.price, p.discount_price, p.brand, p.gender, p.is_featured, p.is_active,
			COALESCE(pi.image_url, '') AS cover_image_url,
			COALESCE(SUM(v.stock_quantity), 0) AS total_stock,
			COALESCE(views.view_count, 0) AS views,
			COALESCE(sales.sales_count, 0) AS sales,
			p.created_at, p.updated_at
		FROM products p
		JOIN categories c ON c.id = p.category_id
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = p.id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = true
		LEFT JOIN LATERAL (
			SELECT COUNT(*) AS view_count
			FROM product_views pv
			WHERE pv.product_id = p.id
		) views ON true
		LEFT JOIN LATERAL (
			SELECT COALESCE(SUM(oi.quantity),0) AS sales_count
			FROM order_items oi
			WHERE oi.product_id = p.id
		) sales ON true
		WHERE p.store_id = $1 AND p.id = $2
		GROUP BY p.id, c.name, pi.image_url, views.view_count, sales.sales_count
		LIMIT 1
	`

	var p AdminProductItem
	row := h.DB.QueryRowContext(c.Request.Context(), query, storeID, productID)
	if err := row.Scan(
		&p.ID, &p.StoreID, &p.CategoryID, &p.CategoryName,
		&p.Name, &p.Slug, &p.Description, &p.ShortDescription, &p.SKU,
		&p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
		&p.CoverImageURL, &p.TotalStock, &p.Views, &p.Sales, &p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			api.JSONError(c, 404, fmt.Errorf("product not found"))
			return
		}
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, p)
}

func (h *HandlerContainer) AdminListCategories(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	items, err := h.CategoryRepo.ListWithProductCount(c.Request.Context(), storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, items)
}

func (h *HandlerContainer) AdminListInventory(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT v.id, v.product_id, p.name, c.name AS category_name, v.sku, v.color, v.size,
			v.stock_quantity, COALESCE(pi.image_url, '') AS cover_image_url
		FROM product_variants v
		JOIN products p ON p.id = v.product_id
		JOIN categories c ON c.id = p.category_id
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = p.id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		WHERE p.store_id = $1 AND v.is_active = true
		ORDER BY p.name ASC, v.color ASC, v.size ASC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}
	defer rows.Close()

	items := []AdminInventoryItem{}
	for rows.Next() {
		var it AdminInventoryItem
		if err := rows.Scan(
			&it.VariantID, &it.ProductID, &it.ProductName, &it.CategoryName,
			&it.SKU, &it.Color, &it.Size, &it.StockQuantity, &it.CoverImageURL,
		); err != nil {
			api.JSONError(c, 500, err)
			return
		}
		items = append(items, it)
	}

	api.JSONOK(c, items)
}

func (h *HandlerContainer) AdminListOrders(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
			COALESCE(c.name, '') AS customer_name, COALESCE(c.phone, '') AS customer_phone
		FROM orders o
		LEFT JOIN customers c ON c.id = o.customer_id
		WHERE o.store_id = $1
		ORDER BY o.created_at DESC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}
	defer rows.Close()

	orders := []AdminOrder{}
	for rows.Next() {
		var o AdminOrder
		if err := rows.Scan(
			&o.ID, &o.OrderNumber, &o.Status, &o.TotalAmount, &o.CreatedAt,
			&o.CustomerName, &o.CustomerPhone,
		); err != nil {
			api.JSONError(c, 500, err)
			return
		}
		orders = append(orders, o)
	}

	for i := range orders {
		items, err := h.loadOrderItems(c, orders[i].ID)
		if err != nil {
			api.JSONError(c, 500, err)
			return
		}
		orders[i].Items = items
	}

	api.JSONOK(c, orders)
}

func (h *HandlerContainer) loadOrderItems(c *gin.Context, orderID int64) ([]AdminOrderItem, error) {
	const query = `
		SELECT oi.product_id, oi.product_variant_id, oi.product_name_snapshot, oi.color_snapshot,
			oi.size_snapshot, oi.quantity, oi.unit_price,
			COALESCE(pi.image_url, '') AS image_url
		FROM order_items oi
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = oi.product_id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		WHERE oi.order_id = $1
		ORDER BY oi.id ASC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []AdminOrderItem{}
	for rows.Next() {
		var it AdminOrderItem
		if err := rows.Scan(
			&it.ProductID, &it.VariantID, &it.Name, &it.Color, &it.Size, &it.Quantity, &it.UnitPrice, &it.ImageURL,
		); err != nil {
			return nil, err
		}
		items = append(items, it)
	}

	return items, nil
}

func (h *HandlerContainer) AdminListCustomers(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT c.id, c.name, COALESCE(c.phone, ''),
			COALESCE(MAX(o.created_at), c.created_at) AS last_interaction,
			COUNT(o.id) AS total_orders
		FROM customers c
		LEFT JOIN orders o ON o.customer_id = c.id
		WHERE c.store_id = $1
		GROUP BY c.id
		ORDER BY last_interaction DESC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}
	defer rows.Close()

	items := []AdminCustomer{}
	for rows.Next() {
		var cst AdminCustomer
		if err := rows.Scan(&cst.ID, &cst.Name, &cst.Phone, &cst.LastInteraction, &cst.TotalOrders); err != nil {
			api.JSONError(c, 500, err)
			return
		}
		items = append(items, cst)
	}

	api.JSONOK(c, items)
}

func (h *HandlerContainer) AdminDashboard(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	var totalProducts, totalOrders, totalViews int
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(*) FROM products WHERE store_id = $1 AND is_active = true`, storeID).Scan(&totalProducts); err != nil {
		api.JSONError(c, 500, err)
		return
	}
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(*) FROM orders WHERE store_id = $1`, storeID).Scan(&totalOrders); err != nil {
		api.JSONError(c, 500, err)
		return
	}
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(*) FROM product_views WHERE store_id = $1 AND viewed_at >= NOW() - INTERVAL '7 days'`, storeID).Scan(&totalViews); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	ordersByDay, err := h.getOrdersByDay(c, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	topSold, err := h.getTopSoldProducts(c, storeID, 5)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}
	topViewed, err := h.getTopViewedProducts(c, storeID, 5)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	conversionRate := 0.0
	if totalViews > 0 {
		conversionRate = (float64(totalOrders) / float64(totalViews)) * 100
	}

	api.JSONOK(c, DashboardResponse{
		TotalProducts: totalProducts,
		TotalOrders:   totalOrders,
		TotalViews:    totalViews,
		ConversionRate: conversionRate,
		OrdersByDay:   ordersByDay,
		TopSoldProducts: topSold,
		TopViewedProducts: topViewed,
	})
}

func (h *HandlerContainer) AdminAnalytics(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	dailyTraffic, err := h.getTrafficByDay(c, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	categoryDist, err := h.getCategoryDistribution(c, storeID)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	productPerformance, err := h.getTopViewedProducts(c, storeID, 6)
	if err != nil {
		api.JSONError(c, 500, err)
		return
	}

	var totalViews, totalSales int
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(*) FROM product_views WHERE store_id = $1`, storeID).Scan(&totalViews); err != nil {
		api.JSONError(c, 500, err)
		return
	}
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.store_id = $1`, storeID).Scan(&totalSales); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	var avgTicket float64
	_ = h.DB.QueryRowContext(c.Request.Context(), `SELECT COALESCE(AVG(total_amount),0) FROM orders WHERE store_id = $1`, storeID).Scan(&avgTicket)

	api.JSONOK(c, AnalyticsResponse{
		DailyTraffic: dailyTraffic,
		CategoryDistribution: categoryDist,
		ProductPerformance: productPerformance,
		TotalViews: totalViews,
		TotalSales: totalSales,
		AverageTicket: avgTicket,
	})
}

func (h *HandlerContainer) getOrdersByDay(c *gin.Context, storeID int64) ([]DayMetric, error) {
	const query = `
		SELECT to_char(day, 'DD/MM') AS label,
			COALESCE(COUNT(o.id), 0) AS orders
		FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') day
		LEFT JOIN orders o ON o.store_id = $1 AND o.created_at::date = day::date
		GROUP BY day
		ORDER BY day
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []DayMetric{}
	for rows.Next() {
		var d DayMetric
		if err := rows.Scan(&d.Label, &d.Orders); err != nil {
			return nil, err
		}
		items = append(items, d)
	}
	return items, nil
}

func (h *HandlerContainer) getTrafficByDay(c *gin.Context, storeID int64) ([]TrafficMetric, error) {
	const query = `
		SELECT to_char(day, 'DD/MM') AS label,
			COALESCE(COUNT(DISTINCT pv.id), 0) AS visits,
			COALESCE(COUNT(DISTINCT o.id), 0) AS orders
		FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') day
		LEFT JOIN product_views pv ON pv.store_id = $1 AND pv.viewed_at::date = day::date
		LEFT JOIN orders o ON o.store_id = $1 AND o.created_at::date = day::date
		GROUP BY day
		ORDER BY day
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []TrafficMetric{}
	for rows.Next() {
		var d TrafficMetric
		if err := rows.Scan(&d.Label, &d.Visits, &d.Orders); err != nil {
			return nil, err
		}
		items = append(items, d)
	}
	return items, nil
}

func (h *HandlerContainer) getCategoryDistribution(c *gin.Context, storeID int64) ([]CategoryMetric, error) {
	const query = `
		SELECT c.name, COUNT(p.id) AS value
		FROM categories c
		LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
		WHERE c.store_id = $1
		GROUP BY c.name
		ORDER BY value DESC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []CategoryMetric{}
	for rows.Next() {
		var m CategoryMetric
		if err := rows.Scan(&m.Name, &m.Value); err != nil {
			return nil, err
		}
		items = append(items, m)
	}
	return items, nil
}

func (h *HandlerContainer) getTopSoldProducts(c *gin.Context, storeID int64, limit int) ([]AdminProductItem, error) {
	const query = `
		SELECT p.id, p.store_id, p.category_id, c.name AS category_name,
			p.name, p.slug, p.description, p.short_description, p.sku,
			p.price, p.discount_price, p.brand, p.gender, p.is_featured, p.is_active,
			COALESCE(pi.image_url, '') AS cover_image_url,
			COALESCE(stock.total_stock, 0) AS total_stock,
			COALESCE(views.view_count, 0) AS views,
			COALESCE(SUM(oi.quantity), 0) AS sales,
			p.created_at, p.updated_at
		FROM products p
		JOIN categories c ON c.id = p.category_id
		LEFT JOIN order_items oi ON oi.product_id = p.id
		LEFT JOIN LATERAL (
			SELECT COALESCE(SUM(stock_quantity), 0) AS total_stock
			FROM product_variants
			WHERE product_id = p.id AND is_active = true
		) stock ON true
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = p.id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		LEFT JOIN LATERAL (
			SELECT COUNT(*) AS view_count
			FROM product_views pv
			WHERE pv.product_id = p.id
		) views ON true
		WHERE p.store_id = $1
		GROUP BY p.id, c.name, pi.image_url, views.view_count, stock.total_stock
		ORDER BY sales DESC
		LIMIT $2
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []AdminProductItem{}
	for rows.Next() {
		var p AdminProductItem
		if err := rows.Scan(
			&p.ID, &p.StoreID, &p.CategoryID, &p.CategoryName,
			&p.Name, &p.Slug, &p.Description, &p.ShortDescription, &p.SKU,
			&p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
			&p.CoverImageURL, &p.TotalStock, &p.Views, &p.Sales, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, p)
	}
	return items, nil
}

func (h *HandlerContainer) getTopViewedProducts(c *gin.Context, storeID int64, limit int) ([]AdminProductItem, error) {
	const query = `
		SELECT p.id, p.store_id, p.category_id, c.name AS category_name,
			p.name, p.slug, p.description, p.short_description, p.sku,
			p.price, p.discount_price, p.brand, p.gender, p.is_featured, p.is_active,
			COALESCE(pi.image_url, '') AS cover_image_url,
			COALESCE(SUM(v.stock_quantity), 0) AS total_stock,
			COALESCE(views.view_count, 0) AS views,
			COALESCE(sales.sales_count, 0) AS sales,
			p.created_at, p.updated_at
		FROM products p
		JOIN categories c ON c.id = p.category_id
		LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = true
		LEFT JOIN LATERAL (
			SELECT image_url
			FROM product_images
			WHERE product_id = p.id
			ORDER BY is_cover DESC, sort_order ASC, id ASC
			LIMIT 1
		) pi ON true
		LEFT JOIN LATERAL (
			SELECT COUNT(*) AS view_count
			FROM product_views pv
			WHERE pv.product_id = p.id
		) views ON true
		LEFT JOIN LATERAL (
			SELECT COALESCE(SUM(oi.quantity),0) AS sales_count
			FROM order_items oi
			WHERE oi.product_id = p.id
		) sales ON true
		WHERE p.store_id = $1
		GROUP BY p.id, c.name, pi.image_url, views.view_count, sales.sales_count
		ORDER BY views DESC
		LIMIT $2
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []AdminProductItem{}
	for rows.Next() {
		var p AdminProductItem
		if err := rows.Scan(
			&p.ID, &p.StoreID, &p.CategoryID, &p.CategoryName,
			&p.Name, &p.Slug, &p.Description, &p.ShortDescription, &p.SKU,
			&p.Price, &p.DiscountPrice, &p.Brand, &p.Gender, &p.IsFeatured, &p.IsActive,
			&p.CoverImageURL, &p.TotalStock, &p.Views, &p.Sales, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, p)
	}
	return items, nil
}

func (h *HandlerContainer) AdminGetStore(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT id, name, slug, description, whatsapp_number, logo_url, banner_url, primary_color, domain, subdomain
		FROM stores
		WHERE id = $1
		LIMIT 1
	`

	var s AdminStoreResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.LogoURL, &s.BannerURL, &s.PrimaryColor, &s.Domain, &s.Subdomain,
	); err != nil {
		if err == sql.ErrNoRows {
			api.JSONError(c, 404, fmt.Errorf("store not found"))
			return
		}
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, s)
}

func (h *HandlerContainer) AdminUpdateStore(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	var req AdminUpdateStoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		UPDATE stores
		SET name = $2,
			domain = $3,
			subdomain = $4,
			primary_color = $5,
			logo_url = $6,
			banner_url = $7,
			whatsapp_number = $8,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, slug, description, whatsapp_number, logo_url, banner_url, primary_color, domain, subdomain
	`

	var s AdminStoreResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query,
		storeID, req.Name, req.Domain, req.Subdomain, req.PrimaryColor, req.LogoURL, req.BannerURL, req.WhatsApp,
	).Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.LogoURL, &s.BannerURL, &s.PrimaryColor, &s.Domain, &s.Subdomain,
	); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, s)
}

func (h *HandlerContainer) AdminGetWhatsAppSettings(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT id, store_id, whatsapp_number, default_message_template, cart_message_template,
			single_product_message_template, is_active
		FROM whatsapp_settings
		WHERE store_id = $1
		LIMIT 1
	`

	var s AdminWhatsAppSettings
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&s.ID, &s.StoreID, &s.WhatsAppNumber, &s.DefaultMessageTemplate, &s.CartMessageTemplate,
		&s.SingleProductMessageTemplate, &s.IsActive,
	); err != nil {
		if err == sql.ErrNoRows {
			api.JSONOK(c, AdminWhatsAppSettings{StoreID: storeID, IsActive: true})
			return
		}
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, s)
}

func (h *HandlerContainer) AdminUpdateWhatsAppSettings(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		api.JSONError(c, 400, err)
		return
	}

	var req AdminUpdateWhatsAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		api.JSONError(c, 400, err)
		return
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	const query = `
		INSERT INTO whatsapp_settings (store_id, whatsapp_number, default_message_template, cart_message_template, single_product_message_template, is_active)
		VALUES ($1,$2,$3,$4,$5,$6)
		ON CONFLICT (store_id)
		DO UPDATE SET
			whatsapp_number = EXCLUDED.whatsapp_number,
			default_message_template = EXCLUDED.default_message_template,
			cart_message_template = EXCLUDED.cart_message_template,
			single_product_message_template = EXCLUDED.single_product_message_template,
			is_active = EXCLUDED.is_active,
			updated_at = NOW()
		RETURNING id, store_id, whatsapp_number, default_message_template, cart_message_template, single_product_message_template, is_active
	`

	var s AdminWhatsAppSettings
	if err := h.DB.QueryRowContext(c.Request.Context(), query,
		storeID, req.WhatsAppNumber, req.DefaultMessageTemplate, req.CartMessageTemplate, req.SingleProductMessageTemplate, isActive,
	).Scan(
		&s.ID, &s.StoreID, &s.WhatsAppNumber, &s.DefaultMessageTemplate, &s.CartMessageTemplate, &s.SingleProductMessageTemplate, &s.IsActive,
	); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, s)
}

