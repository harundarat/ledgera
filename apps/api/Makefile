GOOSE := go tool goose
MIGRATIONS_DIR := migrations
BINARY := bin/ledgera-api

ifneq (,$(wildcard .env))
include .env
export
endif

.PHONY: setup db-up db-down run build test vet check migration-create \
	migrate-up migrate-down migrate-status migrate-reset

setup:
	go mod download
	$(GOOSE) -version

db-up:
	docker compose up -d --wait postgres

db-down:
	docker compose down

run:
	go run ./cmd/api

build:
	mkdir -p $(dir $(BINARY))
	go build -trimpath -o $(BINARY) ./cmd/api

test:
	go test ./...

vet:
	go vet ./...

check: test vet build

migration-create:
	@test -n "$(NAME)" || (echo "NAME is required, for example: make migration-create NAME=create_accounts" && exit 1)
	$(GOOSE) -dir $(MIGRATIONS_DIR) create "$(NAME)" sql

migrate-up:
	@test -n "$(DATABASE_URL)" || (echo "DATABASE_URL is required" && exit 1)
	$(GOOSE) -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" up

migrate-down:
	@test -n "$(DATABASE_URL)" || (echo "DATABASE_URL is required" && exit 1)
	$(GOOSE) -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" down

migrate-status:
	@test -n "$(DATABASE_URL)" || (echo "DATABASE_URL is required" && exit 1)
	$(GOOSE) -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" status

migrate-reset:
	@test -n "$(DATABASE_URL)" || (echo "DATABASE_URL is required" && exit 1)
	$(GOOSE) -dir $(MIGRATIONS_DIR) postgres "$(DATABASE_URL)" reset
