package config

import (
	"strings"
	"testing"
	"time"
)

func TestLoadFromLookupUsesDefaults(t *testing.T) {
	cfg, err := LoadFromLookup(mapLookup(map[string]string{
		"DATABASE_URL": "postgres://ledgera:secret@localhost:5432/ledgera?sslmode=disable",
	}))
	if err != nil {
		t.Fatalf("LoadFromLookup() error = %v", err)
	}

	if cfg.Server.Address != ":8080" {
		t.Fatalf("Server.Address = %q, want :8080", cfg.Server.Address)
	}
	if cfg.Database.MaxConnections != 10 {
		t.Fatalf("Database.MaxConnections = %d, want 10", cfg.Database.MaxConnections)
	}
	if got := cfg.CORS.AllowedOrigins; len(got) != 1 || got[0] != "http://localhost:3000" {
		t.Fatalf("CORS.AllowedOrigins = %#v", got)
	}
}

func TestLoadFromLookupParsesOverrides(t *testing.T) {
	cfg, err := LoadFromLookup(mapLookup(map[string]string{
		"DATABASE_URL":                "postgresql://localhost/ledgera",
		"SERVER_ADDRESS":              "127.0.0.1:9090",
		"SERVER_REQUEST_TIMEOUT":      "750ms",
		"DATABASE_MAX_CONNS":          "20",
		"DATABASE_MIN_CONNS":          "3",
		"LOG_LEVEL":                   "debug",
		"CORS_ALLOWED_ORIGINS":        "https://app.example.com, https://admin.example.com",
		"CORS_ALLOW_CREDENTIALS":      "true",
		"DATABASE_MAX_CONN_IDLE_TIME": "5m",
		"DATABASE_MAX_CONN_LIFETIME":  "30m",
		"DATABASE_HEALTH_TIMEOUT":     "500ms",
		"SERVER_SHUTDOWN_TIMEOUT":     "3s",
	}))
	if err != nil {
		t.Fatalf("LoadFromLookup() error = %v", err)
	}

	if cfg.Server.RequestTimeout != 750*time.Millisecond {
		t.Fatalf("Server.RequestTimeout = %v", cfg.Server.RequestTimeout)
	}
	if cfg.Database.MaxConnections != 20 || cfg.Database.MinConnections != 3 {
		t.Fatalf("database connections = %d/%d", cfg.Database.MinConnections, cfg.Database.MaxConnections)
	}
	if len(cfg.CORS.AllowedOrigins) != 2 || !cfg.CORS.AllowCredentials {
		t.Fatalf("CORS = %#v", cfg.CORS)
	}
}

func TestLoadFromLookupRejectsInvalidConfiguration(t *testing.T) {
	_, err := LoadFromLookup(mapLookup(map[string]string{
		"DATABASE_URL":           "mysql://localhost/ledgera",
		"DATABASE_MAX_CONNS":     "2",
		"DATABASE_MIN_CONNS":     "3",
		"SERVER_REQUEST_TIMEOUT": "not-a-duration",
		"CORS_ALLOWED_ORIGINS":   "*",
		"CORS_ALLOW_CREDENTIALS": "true",
	}))
	if err == nil {
		t.Fatal("LoadFromLookup() error = nil, want validation error")
	}

	for _, expected := range []string{
		"DATABASE_URL must use postgres",
		"DATABASE_MIN_CONNS",
		"SERVER_REQUEST_TIMEOUT",
		"cannot contain *",
	} {
		if !strings.Contains(err.Error(), expected) {
			t.Errorf("error %q does not contain %q", err, expected)
		}
	}
}

func TestLoadFromLookupRequiresDatabaseURL(t *testing.T) {
	_, err := LoadFromLookup(mapLookup(nil))
	if err == nil || !strings.Contains(err.Error(), "DATABASE_URL is required") {
		t.Fatalf("LoadFromLookup() error = %v", err)
	}
}

func mapLookup(values map[string]string) func(string) (string, bool) {
	return func(key string) (string, bool) {
		value, ok := values[key]
		return value, ok
	}
}
