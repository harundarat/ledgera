package app

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"os"

	"github.com/harundarat/ledgera/apps/api/internal/adapter/inbound/http/handler"
	"github.com/harundarat/ledgera/apps/api/internal/adapter/inbound/http/router"
	"github.com/harundarat/ledgera/apps/api/internal/adapter/outbound/postgres"
	"github.com/harundarat/ledgera/apps/api/internal/config"
	"github.com/harundarat/ledgera/apps/api/internal/usecase/health"
)

// Run constructs the dependency graph and blocks until shutdown or server
// failure.
func Run(ctx context.Context, cfg config.Config) error {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: cfg.Log.Level,
	}))
	slog.SetDefault(logger)

	pool, err := postgres.NewPool(ctx, postgres.PoolConfig{
		URL:             cfg.Database.URL,
		MaxConnections:  cfg.Database.MaxConnections,
		MinConnections:  cfg.Database.MinConnections,
		MaxConnLifetime: cfg.Database.MaxConnLifetime,
		MaxConnIdleTime: cfg.Database.MaxConnIdleTime,
	})
	if err != nil {
		return err
	}
	defer pool.Close()

	databaseHealth := postgres.NewHealthChecker(pool)
	healthService := health.NewService(databaseHealth, cfg.Database.HealthTimeout)
	healthHandler := handler.NewHealth(healthService)
	httpApp := router.New(router.Config{
		ReadTimeout:      cfg.Server.ReadTimeout,
		WriteTimeout:     cfg.Server.WriteTimeout,
		IdleTimeout:      cfg.Server.IdleTimeout,
		RequestTimeout:   cfg.Server.RequestTimeout,
		BodyLimit:        cfg.Server.BodyLimit,
		AllowedOrigins:   cfg.CORS.AllowedOrigins,
		AllowCredentials: cfg.CORS.AllowCredentials,
	}, logger, healthHandler)

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("HTTP server starting", "address", cfg.Server.Address)
		serverErr <- router.Listen(httpApp, cfg.Server.Address)
	}()

	select {
	case err := <-serverErr:
		if err == nil {
			return nil
		}
		return fmt.Errorf("serve HTTP: %w", err)
	case <-ctx.Done():
		logger.Info("shutdown requested")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
		defer cancel()

		shutdownErr := httpApp.ShutdownWithContext(shutdownCtx)
		listenErr := <-serverErr
		if shutdownErr != nil {
			return fmt.Errorf("shutdown HTTP server: %w", shutdownErr)
		}
		if listenErr != nil && !errors.Is(listenErr, context.Canceled) {
			return fmt.Errorf("stop HTTP server: %w", listenErr)
		}
		logger.Info("shutdown complete")
		return nil
	}
}
