package handlers

import (
	"database/sql"

	"multi-tennet/internal/repository"
	"multi-tennet/internal/service"

	"github.com/redis/go-redis/v9"
)

type HandlerContainer struct {
	StoreRepo    *repository.StoreRepository
	CategoryRepo *repository.CategoryRepository
	ProductRepo  *repository.ProductRepository
	OrderRepo    *repository.OrderRepository
	WhatsRepo    *repository.WhatsAppRepository
	CheckoutSvc  *service.CheckoutService
	JWTSecret    string
	DB           *sql.DB
	Redis        *redis.Client
}

func NewHandlerContainer(db *sql.DB, rdb *redis.Client, jwtSecret string) *HandlerContainer {
	storeRepo := repository.NewStoreRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	productRepo := repository.NewProductRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	whatsRepo := repository.NewWhatsAppRepository(db)

	checkoutSvc := service.NewCheckoutService(db, storeRepo, productRepo, orderRepo, whatsRepo)

	return &HandlerContainer{
		StoreRepo:    storeRepo,
		CategoryRepo: categoryRepo,
		ProductRepo:  productRepo,
		OrderRepo:    orderRepo,
		WhatsRepo:    whatsRepo,
		CheckoutSvc:  checkoutSvc,
		JWTSecret:    jwtSecret,
		DB:           db,
		Redis:        rdb,
	}
}
