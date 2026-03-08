package http

import (
	"context"
	"database/sql"
	"log"
	"net/http"

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
	router.StaticFile("/openapi.yaml", "./openapi.yaml")
	router.GET("/docs", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vayla API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`))
	})

	modules.RegisterPublicRoutes(router, h)
	modules.RegisterAdminRoutes(router, h)

	return router
}
