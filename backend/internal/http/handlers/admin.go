package handlers

import (
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"multi-tennet/internal/util"
	"strconv"
	"strings"
	"time"
)

type AdminProductItem struct {
	ID               int64     `json:"id"`
	StoreID          int64     `json:"store_id"`
	CategoryID       int64     `json:"category_id"`
	CategoryName     string    `json:"category_name"`
	Name             string    `json:"name"`
	Slug             string    `json:"slug"`
	Description      string    `json:"description"`
	ShortDescription string    `json:"short_description"`
	SKU              string    `json:"sku"`
	Price            float64   `json:"price"`
	DiscountPrice    float64   `json:"discount_price"`
	Brand            string    `json:"brand"`
	Gender           string    `json:"gender"`
	IsFeatured       bool      `json:"is_featured"`
	IsActive         bool      `json:"is_active"`
	CoverImageURL    string    `json:"cover_image_url"`
	TotalStock       int       `json:"total_stock"`
	Views            int       `json:"views"`
	Sales            int       `json:"sales"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type AdminCategoryItem struct {
	ID           int64     `json:"id"`
	StoreID      int64     `json:"store_id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Description  string    `json:"description"`
	IsActive     bool      `json:"is_active"`
	SortOrder    int       `json:"sort_order"`
	ProductCount int       `json:"product_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
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
	ProductID int64   `json:"product_id"`
	VariantID *int64  `json:"variant_id"`
	Name      string  `json:"name"`
	Color     string  `json:"color"`
	Size      string  `json:"size"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
	ImageURL  string  `json:"image_url"`
}

type AdminOrder struct {
	ID            int64            `json:"id"`
	OrderNumber   string           `json:"order_number"`
	CustomerName  string           `json:"customer_name"`
	CustomerPhone string           `json:"customer_phone"`
	Status        string           `json:"status"`
	TotalAmount   float64          `json:"total_amount"`
	CreatedAt     time.Time        `json:"created_at"`
	Items         []AdminOrderItem `json:"items"`
}

type AdminCustomer struct {
	ID              int64     `json:"id"`
	Name            string    `json:"name"`
	Phone           string    `json:"phone"`
	TotalOrders     int       `json:"total_orders"`
	LastInteraction time.Time `json:"last_interaction"`
}

type DashboardResponse struct {
	TotalProducts     int                `json:"total_products"`
	TotalOrders       int                `json:"total_orders"`
	TotalViews        int                `json:"total_views"`
	ConversionRate    float64            `json:"conversion_rate"`
	OrdersByDay       []DayMetric        `json:"orders_by_day"`
	OrdersByStatus    []StatusMetric     `json:"orders_by_status"`
	TopSoldProducts   []AdminProductItem `json:"top_sold_products"`
	TopViewedProducts []AdminProductItem `json:"top_viewed_products"`
}

type AnalyticsResponse struct {
	DailyTraffic         []TrafficMetric    `json:"daily_traffic"`
	CategoryDistribution []CategoryMetric   `json:"category_distribution"`
	ProductPerformance   []AdminProductItem `json:"product_performance"`
	TotalViews           int                `json:"total_views"`
	TotalSales           int                `json:"total_sales"`
	AverageTicket        float64            `json:"average_ticket"`
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

type StatusMetric struct {
	Status string `json:"status"`
	Orders int    `json:"orders"`
}

type AdminStoreResponse struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Description  string `json:"description"`
	WhatsApp     string `json:"whatsapp_number"`
	ServiceHours string `json:"service_hours"`
	LogoURL      string `json:"logo_url"`
	BannerURL    string `json:"banner_url"`
	PrimaryColor string `json:"primary_color"`
	Domain       string `json:"domain"`
	Subdomain    string `json:"subdomain"`
}

type AdminUpdateStoreRequest struct {
	Name         string `json:"name"`
	Domain       string `json:"domain"`
	Subdomain    string `json:"subdomain"`
	PrimaryColor string `json:"primary_color"`
	LogoURL      string `json:"logo_url"`
	BannerURL    string `json:"banner_url"`
	WhatsApp     string `json:"whatsapp_number"`
	ServiceHours string `json:"service_hours"`
}

type AdminWhatsAppSettings struct {
	ID                           int64  `json:"id"`
	StoreID                      int64  `json:"store_id"`
	WhatsAppNumber               string `json:"whatsapp_number"`
	DefaultMessageTemplate       string `json:"default_message_template"`
	CartMessageTemplate          string `json:"cart_message_template"`
	SingleProductMessageTemplate string `json:"single_product_message_template"`
	IsActive                     bool   `json:"is_active"`
}

type AdminUpdateWhatsAppRequest struct {
	WhatsAppNumber               string `json:"whatsapp_number"`
	DefaultMessageTemplate       string `json:"default_message_template"`
	CartMessageTemplate          string `json:"cart_message_template"`
	SingleProductMessageTemplate string `json:"single_product_message_template"`
	IsActive                     *bool  `json:"is_active"`
}

type AdminUpdateBannerSettingsRequest struct {
	Title           string `json:"title"`
	Subtitle        string `json:"subtitle"`
	ButtonText      string `json:"button_text"`
	ButtonURL       string `json:"button_url"`
	TitleColor      string `json:"title_color"`
	SubtitleColor   string `json:"subtitle_color"`
	ButtonBGColor   string `json:"button_bg_color"`
	ButtonTextColor string `json:"button_text_color"`
	IsActive        *bool  `json:"is_active"`
}

type AdminCreateCategoryRequest struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	SortOrder   *int   `json:"sort_order"`
	IsActive    *bool  `json:"is_active"`
}

type AdminUpdateCategoryRequest struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	SortOrder   *int   `json:"sort_order"`
	IsActive    *bool  `json:"is_active"`
}

type AdminUpdateInventoryRequest struct {
	StockQuantity int `json:"stock_quantity"`
}

type AdminUpdateOrderStatusRequest struct {
	Status       string `json:"status"`
	RestoreStock *bool  `json:"restore_stock"`
}

type AdminUpdateCustomerRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

func getStoreIDParam(c *gin.Context) (int64, error) {
	storeIDStr := c.Param("storeID")
	if storeIDStr == "" {
		storeIDStr = c.Query("store_id")
	}
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
		JSONError(c, 400, err)
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
		JSONError(c, 500, err)
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
			JSONError(c, 500, err)
			return
		}
		items = append(items, p)
	}

	JSONOK(c, items)
}

func (h *HandlerContainer) AdminGetProduct(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}
	idStr := c.Param("id")
	productID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil || productID <= 0 {
		JSONError(c, 400, errInvalid("id"))
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
			JSONError(c, 404, fmt.Errorf("product not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, p)
}

func (h *HandlerContainer) AdminListCategories(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	items, err := h.CategoryRepo.ListWithProductCount(c.Request.Context(), storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, items)
}

func (h *HandlerContainer) AdminCreateCategory(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	var req AdminCreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		JSONError(c, 400, errMissing("name"))
		return
	}

	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		slug = util.Slugify(name)
	}
	if slug == "" {
		JSONError(c, 400, errInvalid("slug"))
		return
	}

	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	const query = `
		INSERT INTO categories (store_id, name, slug, description, is_active, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, store_id, name, slug, COALESCE(description, ''), is_active, sort_order, created_at, updated_at
	`

	var category AdminCategoryItem
	if err := h.DB.QueryRowContext(c.Request.Context(), query,
		storeID, name, slug, strings.TrimSpace(req.Description), isActive, sortOrder,
	).Scan(
		&category.ID, &category.StoreID, &category.Name, &category.Slug, &category.Description, &category.IsActive, &category.SortOrder, &category.CreatedAt, &category.UpdatedAt,
	); err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONCreated(c, category)
}

func (h *HandlerContainer) AdminUpdateCategory(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	categoryID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || categoryID <= 0 {
		JSONError(c, 400, errInvalid("id"))
		return
	}

	var req AdminUpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		JSONError(c, 400, errMissing("name"))
		return
	}

	slug := strings.TrimSpace(req.Slug)
	if slug == "" {
		slug = util.Slugify(name)
	}
	if slug == "" {
		JSONError(c, 400, errInvalid("slug"))
		return
	}

	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	const query = `
		UPDATE categories
		SET name = $3,
			slug = $4,
			description = $5,
			is_active = $6,
			sort_order = $7,
			updated_at = NOW()
		WHERE id = $1 AND store_id = $2
		RETURNING id, store_id, name, slug, COALESCE(description, ''), is_active, sort_order, created_at, updated_at
	`

	var category AdminCategoryItem
	if err := h.DB.QueryRowContext(c.Request.Context(), query,
		categoryID, storeID, name, slug, strings.TrimSpace(req.Description), isActive, sortOrder,
	).Scan(
		&category.ID, &category.StoreID, &category.Name, &category.Slug, &category.Description, &category.IsActive, &category.SortOrder, &category.CreatedAt, &category.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			JSONError(c, 404, fmt.Errorf("category not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, category)
}

func (h *HandlerContainer) AdminDeleteCategory(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	categoryID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || categoryID <= 0 {
		JSONError(c, 400, errInvalid("id"))
		return
	}

	const query = `
		UPDATE categories
		SET is_active = false, updated_at = NOW()
		WHERE id = $1 AND store_id = $2
		RETURNING id
	`

	var id int64
	if err := h.DB.QueryRowContext(c.Request.Context(), query, categoryID, storeID).Scan(&id); err != nil {
		if err == sql.ErrNoRows {
			JSONError(c, 404, fmt.Errorf("category not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{"id": id})
}

func (h *HandlerContainer) AdminListInventory(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
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
		JSONError(c, 500, err)
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
			JSONError(c, 500, err)
			return
		}
		items = append(items, it)
	}

	JSONOK(c, items)
}

func (h *HandlerContainer) AdminUpdateInventory(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	variantID, err := strconv.ParseInt(c.Param("variantID"), 10, 64)
	if err != nil || variantID <= 0 {
		JSONError(c, 400, errInvalid("variantID"))
		return
	}

	var req AdminUpdateInventoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}
	if req.StockQuantity < 0 {
		JSONError(c, 400, fmt.Errorf("stock_quantity must be >= 0"))
		return
	}

	const query = `
		UPDATE product_variants pv
		SET stock_quantity = $3
		FROM products p
		WHERE pv.id = $1
		  AND pv.product_id = p.id
		  AND p.store_id = $2
		RETURNING pv.id, pv.stock_quantity
	`

	var updatedVariantID int64
	var updatedStock int
	if err := h.DB.QueryRowContext(c.Request.Context(), query, variantID, storeID, req.StockQuantity).Scan(&updatedVariantID, &updatedStock); err != nil {
		if err == sql.ErrNoRows {
			JSONError(c, 404, fmt.Errorf("variant not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{
		"variant_id":     updatedVariantID,
		"stock_quantity": updatedStock,
	})
}

func (h *HandlerContainer) AdminListOrders(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	status := strings.TrimSpace(c.Query("status"))
	if status != "" {
		validStatus := map[string]bool{
			"pending":   true,
			"contacted": true,
			"confirmed": true,
			"completed": true,
			"cancelled": true,
		}
		if !validStatus[status] {
			JSONError(c, 400, errInvalid("status"))
			return
		}
	}

	dateFrom := strings.TrimSpace(c.Query("date_from"))
	dateTo := strings.TrimSpace(c.Query("date_to"))

	var dateFromParam any = nil
	var dateToParam any = nil

	if dateFrom != "" {
		if _, err := time.Parse("2006-01-02", dateFrom); err != nil {
			JSONError(c, 400, errInvalid("date_from"))
			return
		}
		dateFromParam = dateFrom
	}
	if dateTo != "" {
		if _, err := time.Parse("2006-01-02", dateTo); err != nil {
			JSONError(c, 400, errInvalid("date_to"))
			return
		}
		dateToParam = dateTo
	}

	const query = `
		SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
			COALESCE(c.name, '') AS customer_name, COALESCE(c.phone, '') AS customer_phone
		FROM orders o
		LEFT JOIN customers c ON c.id = o.customer_id
		WHERE o.store_id = $1
		  AND ($2 = '' OR o.status = $2)
		  AND ($3::date IS NULL OR o.created_at::date >= $3::date)
		  AND ($4::date IS NULL OR o.created_at::date <= $4::date)
		ORDER BY o.created_at DESC
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID, status, dateFromParam, dateToParam)
	if err != nil {
		JSONError(c, 500, err)
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
			JSONError(c, 500, err)
			return
		}
		orders = append(orders, o)
	}

	for i := range orders {
		items, err := h.loadOrderItems(c, orders[i].ID)
		if err != nil {
			JSONError(c, 500, err)
			return
		}
		orders[i].Items = items
	}

	JSONOK(c, orders)
}

func (h *HandlerContainer) AdminDeleteOrder(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || orderID <= 0 {
		JSONError(c, 400, errInvalid("id"))
		return
	}

	tx, err := h.DB.BeginTx(c.Request.Context(), nil)
	if err != nil {
		JSONError(c, 500, err)
		return
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(c.Request.Context(), `
		DELETE FROM order_items
		WHERE order_id = $1
	`, orderID); err != nil {
		JSONError(c, 500, err)
		return
	}

	res, err := tx.ExecContext(c.Request.Context(), `
		DELETE FROM orders
		WHERE id = $1 AND store_id = $2
	`, orderID, storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		JSONError(c, 500, err)
		return
	}
	if rowsAffected == 0 {
		JSONError(c, 404, fmt.Errorf("order not found"))
		return
	}

	if err := tx.Commit(); err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{"id": orderID})
}

func (h *HandlerContainer) AdminUpdateOrderStatus(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	orderID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || orderID <= 0 {
		JSONError(c, 400, errInvalid("id"))
		return
	}

	var req AdminUpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	status := strings.TrimSpace(req.Status)
	validStatus := map[string]bool{
		"pending":   true,
		"contacted": true,
		"confirmed": true,
		"completed": true,
		"cancelled": true,
	}
	if !validStatus[status] {
		JSONError(c, 400, errInvalid("status"))
		return
	}

	restoreStock := req.RestoreStock != nil && *req.RestoreStock
	consumesStock := map[string]bool{
		"confirmed": true,
		"completed": true,
	}

	tx, err := h.DB.BeginTx(c.Request.Context(), nil)
	if err != nil {
		JSONError(c, 500, err)
		return
	}
	defer tx.Rollback()

	var currentStatus string
	if err := tx.QueryRowContext(c.Request.Context(), `
		SELECT status
		FROM orders
		WHERE id = $1 AND store_id = $2
	`, orderID, storeID).Scan(&currentStatus); err != nil {
		if err == sql.ErrNoRows {
			JSONError(c, 404, fmt.Errorf("order not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	shouldConsume := !consumesStock[currentStatus] && consumesStock[status]
	shouldRestore := restoreStock && consumesStock[currentStatus] && status == "cancelled"

	if shouldConsume || shouldRestore {
		type orderItemStock struct {
			variantID int64
			quantity  int
		}
		stockItems := make([]orderItemStock, 0, 8)

		rows, err := tx.QueryContext(c.Request.Context(), `
			SELECT product_variant_id, quantity
			FROM order_items
			WHERE order_id = $1
		`, orderID)
		if err != nil {
			JSONError(c, 500, err)
			return
		}
		for rows.Next() {
			var variantID *int64
			var quantity int
			if err := rows.Scan(&variantID, &quantity); err != nil {
				JSONError(c, 500, err)
				return
			}
			if variantID == nil || *variantID <= 0 || quantity <= 0 {
				continue
			}
			stockItems = append(stockItems, orderItemStock{
				variantID: *variantID,
				quantity:  quantity,
			})
		}
		if err := rows.Err(); err != nil {
			JSONError(c, 500, err)
			return
		}
		if err := rows.Close(); err != nil {
			JSONError(c, 500, err)
			return
		}

		for _, item := range stockItems {
			if shouldConsume {
				var touchedID int64
				if err := tx.QueryRowContext(c.Request.Context(), `
					UPDATE product_variants pv
					SET stock_quantity = pv.stock_quantity - $1,
						updated_at = NOW()
					FROM products p
					WHERE pv.id = $2
					  AND pv.product_id = p.id
					  AND p.store_id = $3
					  AND pv.stock_quantity >= $1
					RETURNING pv.id
				`, item.quantity, item.variantID, storeID).Scan(&touchedID); err != nil {
					if err == sql.ErrNoRows {
						JSONError(c, 400, fmt.Errorf("insufficient stock for variant %d", item.variantID))
						return
					}
					JSONError(c, 500, err)
					return
				}
				if _, err := tx.ExecContext(c.Request.Context(), `
					INSERT INTO inventory_movements (store_id, product_variant_id, type, quantity, reason, reference_id)
					VALUES ($1, $2, 'out', $3, 'order_status_confirmed', $4)
				`, storeID, item.variantID, item.quantity, orderID); err != nil {
					JSONError(c, 500, err)
					return
				}
			}

			if shouldRestore {
				if _, err := tx.ExecContext(c.Request.Context(), `
					UPDATE product_variants pv
					SET stock_quantity = pv.stock_quantity + $1,
						updated_at = NOW()
					FROM products p
					WHERE pv.id = $2
					  AND pv.product_id = p.id
					  AND p.store_id = $3
				`, item.quantity, item.variantID, storeID); err != nil {
					JSONError(c, 500, err)
					return
				}
				if _, err := tx.ExecContext(c.Request.Context(), `
					INSERT INTO inventory_movements (store_id, product_variant_id, type, quantity, reason, reference_id)
					VALUES ($1, $2, 'in', $3, 'order_status_cancelled_restore', $4)
				`, storeID, item.variantID, item.quantity, orderID); err != nil {
					JSONError(c, 500, err)
					return
				}
			}
		}
	}

	var updatedID int64
	var updatedStatus string
	if err := tx.QueryRowContext(c.Request.Context(), `
		UPDATE orders
		SET status = $3, updated_at = NOW()
		WHERE id = $1 AND store_id = $2
		RETURNING id, status
	`, orderID, storeID, status).Scan(&updatedID, &updatedStatus); err != nil {
		JSONError(c, 500, err)
		return
	}

	if err := tx.Commit(); err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{"id": updatedID, "status": updatedStatus})
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
		JSONError(c, 400, err)
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
		JSONError(c, 500, err)
		return
	}
	defer rows.Close()

	items := []AdminCustomer{}
	for rows.Next() {
		var cst AdminCustomer
		if err := rows.Scan(&cst.ID, &cst.Name, &cst.Phone, &cst.LastInteraction, &cst.TotalOrders); err != nil {
			JSONError(c, 500, err)
			return
		}
		items = append(items, cst)
	}

	JSONOK(c, items)
}

func (h *HandlerContainer) AdminUpdateCustomer(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	customerID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || customerID <= 0 {
		JSONError(c, 400, errInvalid("id"))
		return
	}

	var req AdminUpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	name := strings.TrimSpace(req.Name)
	phone := strings.TrimSpace(req.Phone)
	if name == "" && phone == "" {
		JSONError(c, 400, fmt.Errorf("at least one of name or phone is required"))
		return
	}

	const query = `
		UPDATE customers
		SET name = COALESCE(NULLIF($3, ''), name),
			phone = COALESCE(NULLIF($4, ''), phone),
			updated_at = NOW()
		WHERE id = $1 AND store_id = $2
		RETURNING id, name, COALESCE(phone, '')
	`

	var updatedID int64
	var updatedName, updatedPhone string
	if err := h.DB.QueryRowContext(c.Request.Context(), query, customerID, storeID, name, phone).Scan(&updatedID, &updatedName, &updatedPhone); err != nil {
		if err == sql.ErrNoRows {
			JSONError(c, 404, fmt.Errorf("customer not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{
		"id":    updatedID,
		"name":  updatedName,
		"phone": updatedPhone,
	})
}

func (h *HandlerContainer) AdminDeleteCustomer(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	customerID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || customerID <= 0 {
		JSONError(c, 400, errInvalid("id"))
		return
	}

	res, err := h.DB.ExecContext(c.Request.Context(), `
		DELETE FROM customers
		WHERE id = $1 AND store_id = $2
	`, customerID, storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		JSONError(c, 500, err)
		return
	}
	if rowsAffected == 0 {
		JSONError(c, 404, fmt.Errorf("customer not found"))
		return
	}

	JSONOK(c, gin.H{"id": customerID})
}

func (h *HandlerContainer) AdminDashboard(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	var totalProducts, totalOrders, totalViews int
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(*) FROM products WHERE store_id = $1 AND is_active = true`, storeID).Scan(&totalProducts); err != nil {
		JSONError(c, 500, err)
		return
	}
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(*) FROM orders WHERE store_id = $1`, storeID).Scan(&totalOrders); err != nil {
		JSONError(c, 500, err)
		return
	}
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(DISTINCT session_id) FROM store_visits WHERE store_id = $1 AND visited_at >= NOW() - INTERVAL '7 days'`, storeID).Scan(&totalViews); err != nil {
		JSONError(c, 500, err)
		return
	}

	ordersByDay, err := h.getOrdersByDay(c, storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}
	ordersByStatus, err := h.getOrdersByStatus(c, storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	topSold, err := h.getTopSoldProducts(c, storeID, 5)
	if err != nil {
		JSONError(c, 500, err)
		return
	}
	topViewed, err := h.getTopViewedProducts(c, storeID, 5)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	conversionRate := 0.0
	if totalViews > 0 {
		conversionRate = (float64(totalOrders) / float64(totalViews)) * 100
	}

	JSONOK(c, DashboardResponse{
		TotalProducts:     totalProducts,
		TotalOrders:       totalOrders,
		TotalViews:        totalViews,
		ConversionRate:    conversionRate,
		OrdersByDay:       ordersByDay,
		OrdersByStatus:    ordersByStatus,
		TopSoldProducts:   topSold,
		TopViewedProducts: topViewed,
	})
}

func (h *HandlerContainer) getOrdersByStatus(c *gin.Context, storeID int64) ([]StatusMetric, error) {
	const query = `
		SELECT status, COUNT(*) AS orders
		FROM orders
		WHERE store_id = $1
		GROUP BY status
	`

	rows, err := h.DB.QueryContext(c.Request.Context(), query, storeID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	counts := map[string]int{
		"pending":   0,
		"contacted": 0,
		"confirmed": 0,
		"completed": 0,
		"cancelled": 0,
	}

	for rows.Next() {
		var status string
		var orders int
		if err := rows.Scan(&status, &orders); err != nil {
			return nil, err
		}
		if _, ok := counts[status]; ok {
			counts[status] = orders
		}
	}

	return []StatusMetric{
		{Status: "pending", Orders: counts["pending"]},
		{Status: "contacted", Orders: counts["contacted"]},
		{Status: "confirmed", Orders: counts["confirmed"]},
		{Status: "completed", Orders: counts["completed"]},
		{Status: "cancelled", Orders: counts["cancelled"]},
	}, nil
}

func (h *HandlerContainer) AdminAnalytics(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	dailyTraffic, err := h.getTrafficByDay(c, storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	categoryDist, err := h.getCategoryDistribution(c, storeID)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	productPerformance, err := h.getTopViewedProducts(c, storeID, 6)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	var totalViews, totalSales int
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COUNT(DISTINCT session_id) FROM store_visits WHERE store_id = $1`, storeID).Scan(&totalViews); err != nil {
		JSONError(c, 500, err)
		return
	}
	if err := h.DB.QueryRowContext(c.Request.Context(), `SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.store_id = $1`, storeID).Scan(&totalSales); err != nil {
		JSONError(c, 500, err)
		return
	}

	var avgTicket float64
	_ = h.DB.QueryRowContext(c.Request.Context(), `SELECT COALESCE(AVG(total_amount),0) FROM orders WHERE store_id = $1`, storeID).Scan(&avgTicket)

	JSONOK(c, AnalyticsResponse{
		DailyTraffic:         dailyTraffic,
		CategoryDistribution: categoryDist,
		ProductPerformance:   productPerformance,
		TotalViews:           totalViews,
		TotalSales:           totalSales,
		AverageTicket:        avgTicket,
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
			COALESCE(COUNT(DISTINCT sv.session_id), 0) AS visits,
			COALESCE(COUNT(DISTINCT o.id), 0) AS orders
		FROM generate_series(current_date - interval '6 days', current_date, interval '1 day') day
		LEFT JOIN store_visits sv ON sv.store_id = $1 AND sv.visited_at::date = day::date
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
		JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT id, name, slug,
			COALESCE(description, '') AS description,
			whatsapp_number,
			COALESCE(service_hours, '') AS service_hours,
			COALESCE(logo_url, '') AS logo_url,
			COALESCE(banner_url, '') AS banner_url,
			COALESCE(primary_color, '') AS primary_color,
			COALESCE(domain, '') AS domain,
			COALESCE(subdomain, '') AS subdomain
		FROM stores
		WHERE id = $1
		LIMIT 1
	`

	var s AdminStoreResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.ServiceHours, &s.LogoURL, &s.BannerURL, &s.PrimaryColor, &s.Domain, &s.Subdomain,
	); err != nil {
		if err == sql.ErrNoRows {
			JSONError(c, 404, fmt.Errorf("store not found"))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, s)
}

func (h *HandlerContainer) AdminUpdateStore(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	var req AdminUpdateStoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	var oldLogoURL, oldBannerURL string
	_ = h.DB.QueryRowContext(c.Request.Context(),
		`SELECT COALESCE(logo_url, ''), COALESCE(banner_url, '') FROM stores WHERE id = $1`,
		storeID,
	).Scan(&oldLogoURL, &oldBannerURL)

	const query = `
		UPDATE stores
		SET name = $2,
			domain = $3,
			subdomain = $4,
			primary_color = $5,
			logo_url = $6,
			banner_url = $7,
			whatsapp_number = $8,
			service_hours = $9,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, slug,
			COALESCE(description, '') AS description,
			whatsapp_number,
			COALESCE(service_hours, '') AS service_hours,
			COALESCE(logo_url, '') AS logo_url,
			COALESCE(banner_url, '') AS banner_url,
			COALESCE(primary_color, '') AS primary_color,
			COALESCE(domain, '') AS domain,
			COALESCE(subdomain, '') AS subdomain
	`

	var s AdminStoreResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query,
		storeID, req.Name, req.Domain, req.Subdomain, req.PrimaryColor, req.LogoURL, req.BannerURL, req.WhatsApp, req.ServiceHours,
	).Scan(
		&s.ID, &s.Name, &s.Slug, &s.Description, &s.WhatsApp, &s.ServiceHours, &s.LogoURL, &s.BannerURL, &s.PrimaryColor, &s.Domain, &s.Subdomain,
	); err != nil {
		JSONError(c, 500, err)
		return
	}

	h.deleteObsoleteStoreImage(c, oldLogoURL, req.LogoURL)
	h.deleteObsoleteStoreImage(c, oldBannerURL, req.BannerURL)

	JSONOK(c, s)
}

func (h *HandlerContainer) deleteObsoleteStoreImage(c *gin.Context, oldURL, newURL string) {
	if h.StorageSvc == nil {
		return
	}
	oldClean := strings.TrimSpace(oldURL)
	newClean := strings.TrimSpace(newURL)
	if oldClean == "" || oldClean == newClean {
		return
	}
	key, ok := extractObjectKeyFromOracleURL(oldClean)
	if !ok {
		return
	}
	if err := h.StorageSvc.DeleteImage(c.Request.Context(), key); err != nil {
		// Best-effort cleanup: DB update already concluido.
		fmt.Printf("failed to delete obsolete store image key=%s err=%v\n", key, err)
	}
}

func (h *HandlerContainer) AdminGetWhatsAppSettings(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
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
			JSONOK(c, AdminWhatsAppSettings{StoreID: storeID, IsActive: true})
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, s)
}

func (h *HandlerContainer) AdminUpdateWhatsAppSettings(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	var req AdminUpdateWhatsAppRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
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
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, s)
}

func (h *HandlerContainer) AdminGetBannerSettings(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	const query = `
		SELECT store_id, title, subtitle, button_text, button_url, title_color, subtitle_color, button_bg_color, button_text_color, is_active
		FROM store_banners
		WHERE store_id = $1
		LIMIT 1
	`

	var banner StoreBannerSettingsResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&banner.StoreID, &banner.Title, &banner.Subtitle, &banner.ButtonText, &banner.ButtonURL,
		&banner.TitleColor, &banner.SubtitleColor, &banner.ButtonBGColor, &banner.ButtonTextColor, &banner.IsActive,
	); err != nil {
		if err == sql.ErrNoRows {
			JSONOK(c, defaultBannerSettings(storeID))
			return
		}
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, banner)
}

func (h *HandlerContainer) AdminUpdateBannerSettings(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	var req AdminUpdateBannerSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	current := defaultBannerSettings(storeID)
	existing, err := h.getBannerSettingsByStoreID(c, storeID)
	if err == nil {
		current = existing
	}

	isActive := current.IsActive
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	title := strings.TrimSpace(req.Title)
	if title == "" {
		title = current.Title
	}
	subtitle := strings.TrimSpace(req.Subtitle)
	if subtitle == "" {
		subtitle = current.Subtitle
	}
	buttonText := strings.TrimSpace(req.ButtonText)
	if buttonText == "" {
		buttonText = current.ButtonText
	}

	titleColor := strings.TrimSpace(req.TitleColor)
	if titleColor == "" {
		titleColor = current.TitleColor
	}
	subtitleColor := strings.TrimSpace(req.SubtitleColor)
	if subtitleColor == "" {
		subtitleColor = current.SubtitleColor
	}
	buttonBGColor := strings.TrimSpace(req.ButtonBGColor)
	if buttonBGColor == "" {
		buttonBGColor = current.ButtonBGColor
	}
	buttonTextColor := strings.TrimSpace(req.ButtonTextColor)
	if buttonTextColor == "" {
		buttonTextColor = current.ButtonTextColor
	}

	const query = `
		INSERT INTO store_banners (store_id, title, subtitle, button_text, button_url, title_color, subtitle_color, button_bg_color, button_text_color, is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		ON CONFLICT (store_id)
		DO UPDATE SET
			title = EXCLUDED.title,
			subtitle = EXCLUDED.subtitle,
			button_text = EXCLUDED.button_text,
			button_url = EXCLUDED.button_url,
			title_color = EXCLUDED.title_color,
			subtitle_color = EXCLUDED.subtitle_color,
			button_bg_color = EXCLUDED.button_bg_color,
			button_text_color = EXCLUDED.button_text_color,
			is_active = EXCLUDED.is_active,
			updated_at = NOW()
		RETURNING store_id, title, subtitle, button_text, button_url, title_color, subtitle_color, button_bg_color, button_text_color, is_active
	`

	var banner StoreBannerSettingsResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query,
		storeID, title, subtitle, buttonText, strings.TrimSpace(req.ButtonURL), titleColor, subtitleColor, buttonBGColor, buttonTextColor, isActive,
	).Scan(
		&banner.StoreID, &banner.Title, &banner.Subtitle, &banner.ButtonText, &banner.ButtonURL,
		&banner.TitleColor, &banner.SubtitleColor, &banner.ButtonBGColor, &banner.ButtonTextColor, &banner.IsActive,
	); err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, banner)
}

func (h *HandlerContainer) getBannerSettingsByStoreID(c *gin.Context, storeID int64) (StoreBannerSettingsResponse, error) {
	const query = `
		SELECT store_id, title, subtitle, button_text, button_url, title_color, subtitle_color, button_bg_color, button_text_color, is_active
		FROM store_banners
		WHERE store_id = $1
		LIMIT 1
	`
	var banner StoreBannerSettingsResponse
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID).Scan(
		&banner.StoreID, &banner.Title, &banner.Subtitle, &banner.ButtonText, &banner.ButtonURL,
		&banner.TitleColor, &banner.SubtitleColor, &banner.ButtonBGColor, &banner.ButtonTextColor, &banner.IsActive,
	); err != nil {
		return StoreBannerSettingsResponse{}, err
	}
	return banner, nil
}
