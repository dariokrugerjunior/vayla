package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	App   AppConfig
	DB    DBConfig
	Redis RedisConfig
	JWT   JWTConfig
	Base  BaseConfig
}

type AppConfig struct {
	Env  string
	Port int
	Name string
}

type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
}

type JWTConfig struct {
	Secret string
}

type BaseConfig struct {
	BaseURL string
}

func Load() (Config, error) {
	cfg := Config{}
	cfg.App.Env = getEnv("APP_ENV", "local")
	cfg.App.Name = getEnv("APP_NAME", "multi-tennet")
	cfg.App.Port = getEnvInt("APP_PORT", 8080)

	cfg.DB.Host = getEnv("DB_HOST", "localhost")
	cfg.DB.Port = getEnvInt("DB_PORT", 5432)
	cfg.DB.User = getEnv("DB_USER", "postgres")
	cfg.DB.Password = getEnv("DB_PASSWORD", "postgres")
	cfg.DB.Name = getEnv("DB_NAME", "multi_tennet")
	cfg.DB.SSLMode = getEnv("DB_SSLMODE", "disable")

	cfg.Redis.Host = getEnv("REDIS_HOST", "localhost")
	cfg.Redis.Port = getEnvInt("REDIS_PORT", 6379)
	cfg.Redis.Password = getEnv("REDIS_PASSWORD", "")

	cfg.JWT.Secret = getEnv("JWT_SECRET", "change-me")
	cfg.Base.BaseURL = getEnv("BASE_URL", "http://localhost:8080")

	if cfg.App.Port <= 0 {
		return cfg, fmt.Errorf("invalid APP_PORT")
	}
	return cfg, nil
}

func getEnv(key, def string) string {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	return val
}

func getEnvInt(key string, def int) int {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		return def
	}
	return parsed
}

