package http

import (
	"database/sql"

	"multi-tennet/internal/config"
	"multi-tennet/internal/http/handlers"
	"multi-tennet/internal/modules"

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

	h := handlers.NewHandlerContainer(db, rdb)

	router.GET("/health", h.Health)

	modules.RegisterPublicRoutes(router, h)
	modules.RegisterAdminRoutes(router, h)

	return router
}

