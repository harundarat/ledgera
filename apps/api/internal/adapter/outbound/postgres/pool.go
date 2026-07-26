package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PoolConfig contains pgx pool settings supplied by the composition root.
type PoolConfig struct {
	URL             string
	MaxConnections  int32
	MinConnections  int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

// NewPool creates a lazily connected PostgreSQL pool. Startup deliberately
// does not ping so liveness is independent from database availability.
func NewPool(ctx context.Context, settings PoolConfig) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(settings.URL)
	if err != nil {
		return nil, fmt.Errorf("parse database pool configuration: %w", err)
	}
	cfg.MaxConns = settings.MaxConnections
	cfg.MinConns = settings.MinConnections
	cfg.MaxConnLifetime = settings.MaxConnLifetime
	cfg.MaxConnIdleTime = settings.MaxConnIdleTime

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("create database pool: %w", err)
	}
	return pool, nil
}
