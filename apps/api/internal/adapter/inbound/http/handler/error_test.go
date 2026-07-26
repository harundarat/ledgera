package handler

import (
	"errors"
	"testing"

	"github.com/gofiber/fiber/v3"

	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
)

func TestMapError(t *testing.T) {
	tests := []struct {
		name       string
		err        error
		wantStatus int
		wantCode   apperror.Code
		wantMsg    string
	}{
		{
			name:       "application unavailable",
			err:        apperror.Wrap(apperror.CodeServiceUnavailable, "service unavailable", errors.New("dsn secret")),
			wantStatus: fiber.StatusServiceUnavailable,
			wantCode:   apperror.CodeServiceUnavailable,
			wantMsg:    "service unavailable",
		},
		{
			name:       "fiber not found",
			err:        fiber.ErrNotFound,
			wantStatus: fiber.StatusNotFound,
			wantCode:   apperror.CodeNotFound,
			wantMsg:    "resource not found",
		},
		{
			name:       "unknown internal error",
			err:        errors.New("SQL secret"),
			wantStatus: fiber.StatusInternalServerError,
			wantCode:   apperror.CodeInternal,
			wantMsg:    "internal server error",
		},
		{
			name:       "internal application message is hidden",
			err:        apperror.Wrap(apperror.CodeInternal, "do not expose", errors.New("stack")),
			wantStatus: fiber.StatusInternalServerError,
			wantCode:   apperror.CodeInternal,
			wantMsg:    "internal server error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := MapError(tt.err)
			if got.Status != tt.wantStatus || got.Code != tt.wantCode || got.Message != tt.wantMsg {
				t.Fatalf("MapError() = %#v", got)
			}
		})
	}
}
