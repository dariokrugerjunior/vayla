package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"github.com/gin-gonic/gin"
)

type AdminLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AdminLoginResponse struct {
	Token string `json:"token"`
	User  gin.H  `json:"user"`
}

func (h *HandlerContainer) AdminLoginByStoreID(c *gin.Context) {
	storeID, err := getStoreIDParam(c)
	if err != nil {
		JSONError(c, 400, err)
		return
	}

	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONError(c, 400, err)
		return
	}

	email := strings.TrimSpace(strings.ToLower(req.Email))
	if email == "" {
		JSONError(c, 400, errMissing("email"))
		return
	}
	if req.Password == "" {
		JSONError(c, 400, errMissing("password"))
		return
	}

	const query = `
		SELECT id, store_id, name, email, password_hash, role, is_active
		FROM users
		WHERE store_id = $1 AND email = $2
		LIMIT 1
	`

	var (
		userID       int64
		userStoreID  int64
		name         string
		userEmail    string
		passwordHash string
		role         string
		isActive     bool
	)
	if err := h.DB.QueryRowContext(c.Request.Context(), query, storeID, email).Scan(
		&userID, &userStoreID, &name, &userEmail, &passwordHash, &role, &isActive,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			JSONError(c, 401, fmt.Errorf("invalid credentials"))
			return
		}
		JSONError(c, 500, err)
		return
	}
	if !isActive {
		JSONError(c, 401, fmt.Errorf("user is inactive"))
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		JSONError(c, 401, fmt.Errorf("invalid credentials"))
		return
	}

	token, err := signAuthToken(AuthTokenClaims{
		UserID:  userID,
		StoreID: userStoreID,
		Role:    role,
		Email:   userEmail,
	}, h.JWTSecret)
	if err != nil {
		JSONError(c, 500, err)
		return
	}

	JSONOK(c, AdminLoginResponse{
		Token: token,
		User: gin.H{
			"id":       userID,
			"store_id": userStoreID,
			"name":     name,
			"email":    userEmail,
			"role":     role,
		},
	})
}
