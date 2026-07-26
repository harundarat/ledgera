package config

import (
	"errors"
	"fmt"
	"log/slog"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config contains all runtime configuration.
type Config struct {
	Server   Server
	Database Database
	Log      Log
	CORS     CORS
}

type Server struct {
	Address         string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	RequestTimeout  time.Duration
	ShutdownTimeout time.Duration
	BodyLimit       int
}

type Database struct {
	URL             string
	HealthTimeout   time.Duration
	MaxConnections  int32
	MinConnections  int32
	MaxConnLifetime time.Duration
	MaxConnIdleTime time.Duration
}

type Log struct {
	Level slog.Level
}

type CORS struct {
	AllowedOrigins   []string
	AllowCredentials bool
}

// Load reads the current process environment and validates the result.
func Load() (Config, error) {
	return LoadFromLookup(os.LookupEnv)
}

// LoadFromLookup parses configuration using lookup. It is exported to support
// deterministic tests and alternative environment providers.
func LoadFromLookup(lookup func(string) (string, bool)) (Config, error) {
	if lookup == nil {
		return Config{}, errors.New("environment lookup is required")
	}

	cfg := Config{
		Server: Server{
			Address:         envString(lookup, "SERVER_ADDRESS", ":8080"),
			ReadTimeout:     10 * time.Second,
			WriteTimeout:    15 * time.Second,
			IdleTimeout:     60 * time.Second,
			RequestTimeout:  10 * time.Second,
			ShutdownTimeout: 10 * time.Second,
			BodyLimit:       4 * 1024 * 1024,
		},
		Database: Database{
			URL:             envString(lookup, "DATABASE_URL", ""),
			HealthTimeout:   2 * time.Second,
			MaxConnections:  10,
			MinConnections:  2,
			MaxConnLifetime: time.Hour,
			MaxConnIdleTime: 30 * time.Minute,
		},
		Log: Log{Level: slog.LevelInfo},
		CORS: CORS{
			AllowedOrigins: []string{"http://localhost:3000"},
		},
	}

	var errs []error
	parseDuration(lookup, "SERVER_READ_TIMEOUT", &cfg.Server.ReadTimeout, &errs)
	parseDuration(lookup, "SERVER_WRITE_TIMEOUT", &cfg.Server.WriteTimeout, &errs)
	parseDuration(lookup, "SERVER_IDLE_TIMEOUT", &cfg.Server.IdleTimeout, &errs)
	parseDuration(lookup, "SERVER_REQUEST_TIMEOUT", &cfg.Server.RequestTimeout, &errs)
	parseDuration(lookup, "SERVER_SHUTDOWN_TIMEOUT", &cfg.Server.ShutdownTimeout, &errs)
	parseInt(lookup, "SERVER_BODY_LIMIT", &cfg.Server.BodyLimit, &errs)
	parseDuration(lookup, "DATABASE_HEALTH_TIMEOUT", &cfg.Database.HealthTimeout, &errs)
	parseInt32(lookup, "DATABASE_MAX_CONNS", &cfg.Database.MaxConnections, &errs)
	parseInt32(lookup, "DATABASE_MIN_CONNS", &cfg.Database.MinConnections, &errs)
	parseDuration(lookup, "DATABASE_MAX_CONN_LIFETIME", &cfg.Database.MaxConnLifetime, &errs)
	parseDuration(lookup, "DATABASE_MAX_CONN_IDLE_TIME", &cfg.Database.MaxConnIdleTime, &errs)

	if value, ok := lookup("LOG_LEVEL"); ok && strings.TrimSpace(value) != "" {
		if err := cfg.Log.Level.UnmarshalText([]byte(strings.ToUpper(strings.TrimSpace(value)))); err != nil {
			errs = append(errs, fmt.Errorf("LOG_LEVEL: %w", err))
		}
	}
	if value, ok := lookup("CORS_ALLOWED_ORIGINS"); ok {
		cfg.CORS.AllowedOrigins = splitCSV(value)
	}
	if value, ok := lookup("CORS_ALLOW_CREDENTIALS"); ok && strings.TrimSpace(value) != "" {
		parsed, err := strconv.ParseBool(strings.TrimSpace(value))
		if err != nil {
			errs = append(errs, fmt.Errorf("CORS_ALLOW_CREDENTIALS: %w", err))
		} else {
			cfg.CORS.AllowCredentials = parsed
		}
	}

	errs = append(errs, cfg.validate()...)
	return cfg, errors.Join(errs...)
}

func (c Config) validate() []error {
	var errs []error
	if strings.TrimSpace(c.Database.URL) == "" {
		errs = append(errs, errors.New("DATABASE_URL is required"))
	} else if parsed, err := url.Parse(c.Database.URL); err != nil {
		errs = append(errs, fmt.Errorf("DATABASE_URL: %w", err))
	} else if parsed.Scheme != "postgres" && parsed.Scheme != "postgresql" {
		errs = append(errs, errors.New("DATABASE_URL must use postgres or postgresql scheme"))
	}
	if strings.TrimSpace(c.Server.Address) == "" {
		errs = append(errs, errors.New("SERVER_ADDRESS must not be empty"))
	}
	if c.Server.ReadTimeout <= 0 || c.Server.WriteTimeout <= 0 ||
		c.Server.IdleTimeout <= 0 || c.Server.RequestTimeout <= 0 ||
		c.Server.ShutdownTimeout <= 0 {
		errs = append(errs, errors.New("server timeouts must be greater than zero"))
	}
	if c.Server.BodyLimit <= 0 {
		errs = append(errs, errors.New("SERVER_BODY_LIMIT must be greater than zero"))
	}
	if c.Database.HealthTimeout <= 0 || c.Database.MaxConnLifetime <= 0 ||
		c.Database.MaxConnIdleTime <= 0 {
		errs = append(errs, errors.New("database durations must be greater than zero"))
	}
	if c.Database.MaxConnections <= 0 {
		errs = append(errs, errors.New("DATABASE_MAX_CONNS must be greater than zero"))
	}
	if c.Database.MinConnections < 0 || c.Database.MinConnections > c.Database.MaxConnections {
		errs = append(errs, errors.New("DATABASE_MIN_CONNS must be between zero and DATABASE_MAX_CONNS"))
	}
	if len(c.CORS.AllowedOrigins) == 0 {
		errs = append(errs, errors.New("CORS_ALLOWED_ORIGINS must contain at least one origin"))
	}
	if c.CORS.AllowCredentials {
		for _, origin := range c.CORS.AllowedOrigins {
			if origin == "*" {
				errs = append(errs, errors.New("CORS_ALLOWED_ORIGINS cannot contain * when credentials are enabled"))
			}
		}
	}
	return errs
}

func envString(lookup func(string) (string, bool), key, fallback string) string {
	value, ok := lookup(key)
	if !ok {
		return fallback
	}
	return strings.TrimSpace(value)
}

func parseDuration(lookup func(string) (string, bool), key string, target *time.Duration, errs *[]error) {
	value, ok := lookup(key)
	if !ok || strings.TrimSpace(value) == "" {
		return
	}
	parsed, err := time.ParseDuration(strings.TrimSpace(value))
	if err != nil {
		*errs = append(*errs, fmt.Errorf("%s: %w", key, err))
		return
	}
	*target = parsed
}

func parseInt(lookup func(string) (string, bool), key string, target *int, errs *[]error) {
	value, ok := lookup(key)
	if !ok || strings.TrimSpace(value) == "" {
		return
	}
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		*errs = append(*errs, fmt.Errorf("%s: %w", key, err))
		return
	}
	*target = parsed
}

func parseInt32(lookup func(string) (string, bool), key string, target *int32, errs *[]error) {
	value, ok := lookup(key)
	if !ok || strings.TrimSpace(value) == "" {
		return
	}
	parsed, err := strconv.ParseInt(strings.TrimSpace(value), 10, 32)
	if err != nil {
		*errs = append(*errs, fmt.Errorf("%s: %w", key, err))
		return
	}
	*target = int32(parsed)
}

func splitCSV(value string) []string {
	var result []string
	for item := range strings.SplitSeq(value, ",") {
		if trimmed := strings.TrimSpace(item); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
