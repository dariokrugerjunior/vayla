package http

import (
	"context"
	"database/sql"
	"log"

	"multi-tennet/internal/config"
	"multi-tennet/internal/http/handlers"
	"multi-tennet/internal/modules"
	"multi-tennet/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func NewServer(cfg config.Config, db *sql.DB, rdb *redis.Client) *gin.Engine {
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(gin.Logger())
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	var storageSvc service.StorageService
	if svc, err := service.NewOracleObjectStorageService(context.Background(), cfg.Storage); err != nil {
		log.Printf("storage disabled: %v", err)
	} else {
		storageSvc = svc
	}

	h := handlers.NewHandlerContainer(db, rdb, cfg.JWT.Secret, storageSvc)

	router.GET("/health", h.Health)

	modules.RegisterPublicRoutes(router, h)
	modules.RegisterAdminRoutes(router, h)

	return router
}
