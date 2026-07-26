package middleware

import (
	"context"
	"errors"
	"log/slog"
	"runtime/debug"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/gofiber/fiber/v3/middleware/requestid"

	"github.com/harundarat/ledgera/apps/api/internal/adapter/inbound/http/handler"
	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
)

// Register adds the standard middleware stack in execution order.
func Register(app *fiber.App, logger *slog.Logger, requestTimeout time.Duration, origins []string, allowCredentials bool) {
	app.Use(requestid.New())
	app.Use(accessLog(logger))
	app.Use(withRequestTimeout(requestTimeout))
	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c fiber.Ctx, recovered any) {
			logger.Error("panic recovered",
				"request_id", requestid.FromContext(c),
				"panic", recovered,
				"stack", string(debug.Stack()),
			)
		},
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{fiber.MethodGet, fiber.MethodHead, fiber.MethodOptions},
		AllowHeaders:     []string{fiber.HeaderContentType, fiber.HeaderAuthorization, fiber.HeaderXRequestID},
		ExposeHeaders:    []string{fiber.HeaderXRequestID},
		AllowCredentials: allowCredentials,
	}))
}

func withRequestTimeout(duration time.Duration) fiber.Handler {
	return func(c fiber.Ctx) error {
		parent := c.Context()
		ctx, cancel := context.WithTimeout(parent, duration)
		c.SetContext(ctx)
		defer func() {
			cancel()
			c.SetContext(parent)
		}()

		err := c.Next()
		if errors.Is(err, context.DeadlineExceeded) || errors.Is(ctx.Err(), context.DeadlineExceeded) {
			return apperror.Wrap(apperror.CodeRequestTimeout, "request timeout", context.DeadlineExceeded)
		}
		return err
	}
}

func accessLog(logger *slog.Logger) fiber.Handler {
	return func(c fiber.Ctx) error {
		started := time.Now()
		err := c.Next()
		status := c.Response().StatusCode()
		if err != nil {
			status = handler.MapError(err).Status
		}
		logger.Info("request completed",
			"request_id", requestid.FromContext(c),
			"method", c.Method(),
			"path", c.Path(),
			"status", status,
			"duration_ms", time.Since(started).Milliseconds(),
		)
		return err
	}
}
