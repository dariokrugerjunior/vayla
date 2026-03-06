package handlers

import (
	"strings"

	"github.com/gin-gonic/gin"
)

type TrackVisitRequest struct {
	StoreID   int64  `json:"store_id"`
	Path      string `json:"path"`
	SessionID string `json:"session_id"`
	Referrer  string `json:"referrer"`
}

func (h *HandlerContainer) TrackVisit(c *gin.Context) {
	var req TrackVisitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	req.Path = strings.TrimSpace(req.Path)
	req.SessionID = strings.TrimSpace(req.SessionID)
	req.Referrer = strings.TrimSpace(req.Referrer)

	if req.StoreID <= 0 {
		JSONError(c, 400, errInvalid("store_id"))
		return
	}
	if req.Path == "" {
		JSONError(c, 400, errMissing("path"))
		return
	}
	if req.SessionID == "" {
		JSONError(c, 400, errMissing("session_id"))
		return
	}

	const dedupeQuery = `
		SELECT id
		FROM store_visits
		WHERE store_id = $1
		  AND session_id = $2
		  AND path = $3
		  AND visited_at >= NOW() - INTERVAL '30 seconds'
		LIMIT 1
	`

	var existingID int64
	if err := h.DB.QueryRowContext(c.Request.Context(), dedupeQuery, req.StoreID, req.SessionID, req.Path).Scan(&existingID); err == nil {
		JSONOK(c, gin.H{"tracked": false})
		return
	}

	const insertQuery = `
		INSERT INTO store_visits (store_id, path, session_id, referrer, user_agent)
		VALUES ($1, $2, $3, $4, $5)
	`

	if _, err := h.DB.ExecContext(c.Request.Context(), insertQuery,
		req.StoreID,
		req.Path,
		req.SessionID,
		req.Referrer,
		strings.TrimSpace(c.GetHeader("User-Agent")),
	); err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, gin.H{"tracked": true})
}

