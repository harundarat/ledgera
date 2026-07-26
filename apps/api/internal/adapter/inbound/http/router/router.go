package router

import (
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/harundarat/ledgera/apps/api/internal/adapter/inbound/http/handler"
	httpmiddleware "github.com/harundarat/ledgera/apps/api/internal/adapter/inbound/http/middleware"
)

// Config contains HTTP server and middleware settings.
type Config struct {
	ReadTimeout      time.Duration
	WriteTimeout     time.Duration
	IdleTimeout      time.Duration
	RequestTimeout   time.Duration
	BodyLimit        int
	AllowedOrigins   []string
	AllowCredentials bool
}

// New constructs the fully routed Fiber application.
func New(cfg Config, logger *slog.Logger, health *handler.Health) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      "Ledgera API",
		BodyLimit:    cfg.BodyLimit,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
		ErrorHandler: handler.NewErrorHandler(logger),
	})

	httpmiddleware.Register(app, logger, cfg.RequestTimeout, cfg.AllowedOrigins, cfg.AllowCredentials)

	app.Get("/health/live", health.Live)
	app.Get("/health/ready", health.Ready)

	// Business endpoints are registered under this group as they are added.
	app.Group("/api/v1")

	return app
}

// Listen starts Fiber without its plaintext banner so process logs remain
// structured through slog.
func Listen(app *fiber.App, address string) error {
	return app.Listen(address, fiber.ListenConfig{DisableStartupMessage: true})
}
