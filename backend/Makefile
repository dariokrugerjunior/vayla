APP_PORT ?= 8080
DB_USER ?= postgres
DB_PASSWORD ?= postgres
DB_NAME ?= multi_tennet
COMPOSE ?= docker compose

.PHONY: up down logs psql migrate seed run

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

psql:
	$(COMPOSE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME)

migrate:
	$(COMPOSE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /migrations/001_init.sql

seed:
	$(COMPOSE) exec -T postgres psql -U $(DB_USER) -d $(DB_NAME) -f /migrations/002_seed.sql

run:
	go run ./cmd/api

