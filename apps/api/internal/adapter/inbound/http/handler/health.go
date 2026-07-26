package handler

import (
	"context"

	"github.com/gofiber/fiber/v3"

	"github.com/harundarat/ledgera/apps/api/internal/shared/response"
)

// HealthService describes the health use case consumed by HTTP.
type HealthService interface {
	Ready(context.Context) error
}

// Health handles operational health endpoints.
type Health struct {
	service HealthService
}

// NewHealth constructs a health handler.
func NewHealth(service HealthService) *Health {
	return &Health{service: service}
}

// Live reports whether the API process can serve HTTP.
func (h *Health) Live(c fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(response.OK("service is live", nil, nil))
}

// Ready reports whether required external dependencies are available.
func (h *Health) Ready(c fiber.Ctx) error {
	if err := h.service.Ready(c.Context()); err != nil {
		return err
	}
	return c.Status(fiber.StatusOK).JSON(response.OK("service is ready", nil, nil))
}
