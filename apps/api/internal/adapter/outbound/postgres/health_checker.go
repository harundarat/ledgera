package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// HealthChecker implements the health use case's database port.
type HealthChecker struct {
	pool *pgxpool.Pool
}

// NewHealthChecker constructs a PostgreSQL health checker.
func NewHealthChecker(pool *pgxpool.Pool) *HealthChecker {
	return &HealthChecker{pool: pool}
}

// Check verifies that PostgreSQL accepts a round trip.
func (c *HealthChecker) Check(ctx context.Context) error {
	return c.pool.Ping(ctx)
}
