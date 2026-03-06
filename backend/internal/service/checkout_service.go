package service

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"

	"multi-tennet/internal/model"
	"multi-tennet/internal/repository"
)

type CheckoutItemInput struct {
	ProductID int64
	VariantID *int64
	Quantity  int
}

type CheckoutResult struct {
	OrderID         int64  `json:"order_id"`
	WhatsAppMessage string `json:"whatsapp_message"`
	WhatsAppURL     string `json:"whatsapp_url"`
}

type CheckoutService struct {
	db           *sql.DB
	storeRepo    *repository.StoreRepository
	productRepo  *repository.ProductRepository
	orderRepo    *repository.OrderRepository
	whatsRepo    *repository.WhatsAppRepository
}

func NewCheckoutService(db *sql.DB, storeRepo *repository.StoreRepository, productRepo *repository.ProductRepository, orderRepo *repository.OrderRepository, whatsRepo *repository.WhatsAppRepository) *CheckoutService {
	return &CheckoutService{
		db:          db,
		storeRepo:   storeRepo,
		productRepo: productRepo,
		orderRepo:   orderRepo,
		whatsRepo:   whatsRepo,
	}
}

func (s *CheckoutService) CheckoutWhatsApp(ctx context.Context, storeSlug string, items []CheckoutItemInput) (CheckoutResult, error) {
	store, err := s.storeRepo.GetBySlug(ctx, storeSlug)
	if err != nil {
		return CheckoutResult{}, err
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return CheckoutResult{}, err
	}
	defer tx.Rollback()

	orderItems := []model.OrderItem{}
	var subtotal float64

	for _, it := range items {
		product, err := s.productRepo.GetByID(ctx, store.ID, it.ProductID)
		if err != nil {
			return CheckoutResult{}, err
		}

		var variant *model.ProductVariant
		if it.VariantID != nil {
			v, err := s.productRepo.GetVariantByID(ctx, product.ID, *it.VariantID)
			if err != nil {
				return CheckoutResult{}, err
			}
			variant = &v
		}

		unitPrice := resolvePrice(product, variant)
		lineTotal := unitPrice * float64(it.Quantity)
		subtotal += lineTotal

		item := model.OrderItem{
			ProductID:           product.ID,
			ProductVariantID:    it.VariantID,
			ProductNameSnapshot: product.Name,
			ColorSnapshot:       snapshotColor(variant),
			SizeSnapshot:        snapshotSize(variant),
			Quantity:            it.Quantity,
			UnitPrice:           unitPrice,
			TotalPrice:          lineTotal,
		}
		orderItems = append(orderItems, item)
	}

	message := buildWhatsAppMessage(orderItems)
	orderNumber := fmt.Sprintf("%s-%d", store.Slug, time.Now().Unix())

	order := model.Order{
		StoreID:         store.ID,
		CustomerID:      nil,
		OrderNumber:     orderNumber,
		Source:          "storefront",
		Status:          "pending",
		Subtotal:        subtotal,
		DiscountAmount:  0,
		TotalAmount:     subtotal,
		WhatsAppMessage: message,
	}

	orderID, err := s.orderRepo.CreateOrder(ctx, tx, &order)
	if err != nil {
		return CheckoutResult{}, err
	}

	for i := range orderItems {
		orderItems[i].OrderID = orderID
	}

	if err := s.orderRepo.CreateOrderItems(ctx, tx, orderItems); err != nil {
		return CheckoutResult{}, err
	}

	if err := tx.Commit(); err != nil {
		return CheckoutResult{}, err
	}

	whatsNumber := store.WhatsApp
	if settings, err := s.whatsRepo.GetActiveByStoreID(ctx, store.ID); err == nil {
		if strings.TrimSpace(settings.WhatsAppNumber) != "" {
			whatsNumber = settings.WhatsAppNumber
		}
	}

	whatsURL := buildWhatsAppURL(whatsNumber, message)

	return CheckoutResult{
		OrderID:         orderID,
		WhatsAppMessage: message,
		WhatsAppURL:     whatsURL,
	}, nil
}

func resolvePrice(product model.Product, variant *model.ProductVariant) float64 {
	if variant != nil && variant.PriceOverride > 0 {
		return variant.PriceOverride
	}
	if product.DiscountPrice > 0 {
		return product.DiscountPrice
	}
	return product.Price
}

func snapshotColor(variant *model.ProductVariant) string {
	if variant == nil {
		return ""
	}
	return variant.Color
}

func snapshotSize(variant *model.ProductVariant) string {
	if variant == nil {
		return ""
	}
	return variant.Size
}

func buildWhatsAppMessage(items []model.OrderItem) string {
	var b strings.Builder
	b.WriteString("Olá! Quero fazer este pedido:\n\n")

	for i, it := range items {
		b.WriteString(fmt.Sprintf("%d. %s\n", i+1, it.ProductNameSnapshot))
		if it.SizeSnapshot != "" {
			b.WriteString(fmt.Sprintf("Tamanho: %s\n", it.SizeSnapshot))
		}
		if it.ColorSnapshot != "" {
			b.WriteString(fmt.Sprintf("Cor: %s\n", it.ColorSnapshot))
		}
		b.WriteString(fmt.Sprintf("Qtd: %d\n", it.Quantity))
		b.WriteString(fmt.Sprintf("Valor: %s\n\n", formatCurrencyBR(it.TotalPrice)))
	}

	total := 0.0
	for _, it := range items {
		total += it.TotalPrice
	}
	b.WriteString(fmt.Sprintf("Total do pedido: %s", formatCurrencyBR(total)))
	return b.String()
}

func formatCurrencyBR(value float64) string {
	return fmt.Sprintf("R$ %.2f", value)
}

var digitsOnly = regexp.MustCompile(`\D+`)

func buildWhatsAppURL(number, message string) string {
	clean := digitsOnly.ReplaceAllString(number, "")
	encoded := url.QueryEscape(message)
	return fmt.Sprintf("https://wa.me/%s?text=%s", clean, encoded)
}

