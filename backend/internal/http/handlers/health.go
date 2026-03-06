package handlers

import (
	"context"
	"time"

	api "multi-tennet/internal/http"

	"github.com/gin-gonic/gin"
)

func (h *HandlerContainer) Health(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	if err := h.DB.PingContext(ctx); err != nil {
		api.JSONError(c, 500, err)
		return
	}
	if err := h.Redis.Ping(ctx).Err(); err != nil {
		api.JSONError(c, 500, err)
		return
	}

	api.JSONOK(c, gin.H{"status": "ok"})
}

