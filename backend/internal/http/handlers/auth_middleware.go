package handlers

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *HandlerContainer) RequireStoreAdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		storeID, err := getStoreIDParam(c)
		if err != nil {
			JSONError(c, 400, err)
			c.Abort()
			return
		}

		authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
		if authHeader == "" {
			JSONError(c, 401, errMissing("Authorization"))
			c.Abort()
			return
		}
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") || strings.TrimSpace(parts[1]) == "" {
			JSONError(c, 401, errInvalid("Authorization"))
			c.Abort()
			return
		}

		claims, err := parseAndValidateAuthToken(parts[1], h.JWTSecret)
		if err != nil {
			JSONError(c, 401, err)
			c.Abort()
			return
		}
		if claims.StoreID != storeID {
			JSONError(c, 403, errInvalid("store_id"))
			c.Abort()
			return
		}

		c.Set("auth_user_id", claims.UserID)
		c.Set("auth_store_id", claims.StoreID)
		c.Set("auth_role", claims.Role)
		c.Set("auth_email", claims.Email)
		c.Next()
	}
}
