package handlers

import (
	"context"
	"github.com/gin-gonic/gin"
	"time"
)

func (h *HandlerContainer) Health(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	if err := h.DB.PingContext(ctx); err != nil {
		JSONError(c, 500, err)
		return
	}
	if err := h.Redis.Ping(ctx).Err(); err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{"status": "ok"})
}
