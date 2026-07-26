package health

import (
	"context"
	"time"

	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
)

// Service coordinates API health checks.
type Service struct {
	database DatabaseHealthChecker
	timeout  time.Duration
}

// NewService constructs a health service.
func NewService(database DatabaseHealthChecker, timeout time.Duration) *Service {
	return &Service{database: database, timeout: timeout}
}

// Ready checks all dependencies required to serve normal traffic.
func (s *Service) Ready(ctx context.Context) error {
	checkCtx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	if err := s.database.Check(checkCtx); err != nil {
		return apperror.Wrap(apperror.CodeServiceUnavailable, "service unavailable", err)
	}
	return nil
}
