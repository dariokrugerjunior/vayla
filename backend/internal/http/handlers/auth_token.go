package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

var (
	errTokenInvalid = errors.New("invalid token")
)

type AuthTokenClaims struct {
	UserID  int64  `json:"uid"`
	StoreID int64  `json:"sid"`
	Role    string `json:"role"`
	Email   string `json:"email"`
	Exp     int64  `json:"exp"`
	Iat     int64  `json:"iat"`
}

func signAuthToken(claims AuthTokenClaims, secret string) (string, error) {
	if strings.TrimSpace(secret) == "" {
		return "", fmt.Errorf("missing JWT_SECRET")
	}

	now := time.Now().Unix()
	claims.Iat = now
	claims.Exp = now + int64((24 * time.Hour).Seconds())

	header := map[string]string{"alg": "HS256", "typ": "JWT"}
	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	payloadJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	h := base64.RawURLEncoding.EncodeToString(headerJSON)
	p := base64.RawURLEncoding.EncodeToString(payloadJSON)
	unsigned := h + "." + p

	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(unsigned))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return unsigned + "." + signature, nil
}

func parseAndValidateAuthToken(token, secret string) (AuthTokenClaims, error) {
	var claims AuthTokenClaims
	if strings.TrimSpace(secret) == "" {
		return claims, fmt.Errorf("missing JWT_SECRET")
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return claims, errTokenInvalid
	}

	unsigned := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(unsigned))
	expectedSig := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expectedSig), []byte(parts[2])) {
		return claims, errTokenInvalid
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return claims, errTokenInvalid
	}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return claims, errTokenInvalid
	}

	now := time.Now().Unix()
	if claims.Exp <= now {
		return claims, fmt.Errorf("token expired")
	}
	if claims.UserID <= 0 || claims.StoreID <= 0 || claims.Role == "" {
		return claims, errTokenInvalid
	}

	return claims, nil
}
