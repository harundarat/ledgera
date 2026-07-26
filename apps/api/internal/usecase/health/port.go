package health

import "context"

// DatabaseHealthChecker is the outbound port required by readiness checks.
type DatabaseHealthChecker interface {
	Check(context.Context) error
}
