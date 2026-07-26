package router

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/harundarat/ledgera/apps/api/internal/adapter/inbound/http/handler"
	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
	"github.com/harundarat/ledgera/apps/api/internal/shared/response"
)

type fakeHealthService struct {
	err error
}

func (f fakeHealthService) Ready(context.Context) error {
	return f.err
}

func TestHealthAndErrorResponses(t *testing.T) {
	tests := []struct {
		name        string
		method      string
		path        string
		healthError error
		wantStatus  int
		wantSuccess bool
		wantCode    apperror.Code
	}{
		{name: "liveness", method: http.MethodGet, path: "/health/live", wantStatus: http.StatusOK, wantSuccess: true},
		{name: "readiness", method: http.MethodGet, path: "/health/ready", wantStatus: http.StatusOK, wantSuccess: true},
		{
			name:        "readiness failure",
			method:      http.MethodGet,
			path:        "/health/ready",
			healthError: apperror.Wrap(apperror.CodeServiceUnavailable, "service unavailable", errors.New("postgres detail")),
			wantStatus:  http.StatusServiceUnavailable,
			wantCode:    apperror.CodeServiceUnavailable,
		},
		{name: "not found", method: http.MethodGet, path: "/missing", wantStatus: http.StatusNotFound, wantCode: apperror.CodeNotFound},
		{name: "method not allowed", method: http.MethodPost, path: "/health/live", wantStatus: http.StatusMethodNotAllowed, wantCode: apperror.CodeMethodNotAllowed},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			app := testApp(tt.healthError)
			result := perform(t, app, tt.method, tt.path, "")
			if result.StatusCode != tt.wantStatus {
				t.Fatalf("status = %d, want %d", result.StatusCode, tt.wantStatus)
			}
			if result.Envelope.Success != tt.wantSuccess {
				t.Fatalf("success = %v, want %v", result.Envelope.Success, tt.wantSuccess)
			}
			if tt.wantCode != "" && (result.Envelope.Error == nil || result.Envelope.Error.Code != tt.wantCode) {
				t.Fatalf("error = %#v, want code %q", result.Envelope.Error, tt.wantCode)
			}
			if strings.Contains(result.Body, "postgres detail") {
				t.Fatalf("internal detail leaked: %s", result.Body)
			}
		})
	}
}

func TestRecoveryUsesInternalErrorEnvelope(t *testing.T) {
	app := testApp(nil)
	app.Get("/panic", func(fiber.Ctx) error {
		panic("secret panic")
	})

	result := perform(t, app, http.MethodGet, "/panic", "")
	if result.StatusCode != http.StatusInternalServerError {
		t.Fatalf("status = %d", result.StatusCode)
	}
	if result.Envelope.Error == nil || result.Envelope.Error.Code != apperror.CodeInternal {
		t.Fatalf("error = %#v", result.Envelope.Error)
	}
	if strings.Contains(result.Body, "secret panic") {
		t.Fatalf("panic leaked: %s", result.Body)
	}
}

func TestRequestIDIsPreservedOrGenerated(t *testing.T) {
	app := testApp(nil)

	preserved := perform(t, app, http.MethodGet, "/health/live", "caller-id")
	if got := preserved.Header.Get(fiber.HeaderXRequestID); got != "caller-id" {
		t.Fatalf("request ID = %q, want caller-id", got)
	}

	generated := perform(t, app, http.MethodGet, "/health/live", "")
	if got := generated.Header.Get(fiber.HeaderXRequestID); got == "" {
		t.Fatal("generated request ID is empty")
	}
}

func TestRequestTimeoutUsesEnvelope(t *testing.T) {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	app := New(Config{
		ReadTimeout:    time.Second,
		WriteTimeout:   time.Second,
		IdleTimeout:    time.Second,
		RequestTimeout: 5 * time.Millisecond,
		BodyLimit:      1024,
		AllowedOrigins: []string{"http://localhost:3000"},
	}, logger, handler.NewHealth(fakeHealthService{}))
	app.Get("/slow", func(c fiber.Ctx) error {
		<-c.Context().Done()
		return c.Context().Err()
	})

	result := perform(t, app, http.MethodGet, "/slow", "")
	if result.StatusCode != http.StatusRequestTimeout {
		t.Fatalf("status = %d", result.StatusCode)
	}
	if result.Envelope.Error == nil || result.Envelope.Error.Code != apperror.CodeRequestTimeout {
		t.Fatalf("error = %#v", result.Envelope.Error)
	}
}

func testApp(healthError error) *fiber.App {
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	return New(Config{
		ReadTimeout:      time.Second,
		WriteTimeout:     time.Second,
		IdleTimeout:      time.Second,
		RequestTimeout:   time.Second,
		BodyLimit:        1024,
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: false,
	}, logger, handler.NewHealth(fakeHealthService{err: healthError}))
}

type testResult struct {
	StatusCode int
	Header     http.Header
	Body       string
	Envelope   response.Envelope
}

func perform(t *testing.T, app *fiber.App, method, path, requestID string) testResult {
	t.Helper()
	request, err := http.NewRequest(method, "http://example.com"+path, nil)
	if err != nil {
		t.Fatal(err)
	}
	if requestID != "" {
		request.Header.Set(fiber.HeaderXRequestID, requestID)
	}
	httpResponse, err := app.Test(request)
	if err != nil {
		t.Fatalf("app.Test() error = %v", err)
	}
	defer httpResponse.Body.Close()
	body, err := io.ReadAll(httpResponse.Body)
	if err != nil {
		t.Fatal(err)
	}

	var envelope response.Envelope
	if err := json.Unmarshal(body, &envelope); err != nil {
		t.Fatalf("decode envelope %q: %v", body, err)
	}
	return testResult{
		StatusCode: httpResponse.StatusCode,
		Header:     httpResponse.Header,
		Body:       string(body),
		Envelope:   envelope,
	}
}
