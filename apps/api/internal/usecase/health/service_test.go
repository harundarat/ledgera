package health

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
)

type fakeDatabaseChecker struct {
	check func(context.Context) error
}

func (f fakeDatabaseChecker) Check(ctx context.Context) error {
	return f.check(ctx)
}

func TestServiceReady(t *testing.T) {
	called := false
	service := NewService(fakeDatabaseChecker{check: func(context.Context) error {
		called = true
		return nil
	}}, time.Second)

	if err := service.Ready(context.Background()); err != nil {
		t.Fatalf("Ready() error = %v", err)
	}
	if !called {
		t.Fatal("database checker was not called")
	}
}

func TestServiceReadyWrapsDatabaseFailure(t *testing.T) {
	cause := errors.New("database secret detail")
	service := NewService(fakeDatabaseChecker{check: func(context.Context) error {
		return cause
	}}, time.Second)

	err := service.Ready(context.Background())
	appErr, ok := apperror.As(err)
	if !ok {
		t.Fatalf("Ready() error type = %T, want *apperror.Error", err)
	}
	if appErr.Code != apperror.CodeServiceUnavailable {
		t.Fatalf("Ready() code = %q", appErr.Code)
	}
	if !errors.Is(err, cause) {
		t.Fatal("Ready() did not retain internal cause")
	}
}

func TestServiceReadyAppliesTimeout(t *testing.T) {
	service := NewService(fakeDatabaseChecker{check: func(ctx context.Context) error {
		<-ctx.Done()
		return ctx.Err()
	}}, 5*time.Millisecond)

	err := service.Ready(context.Background())
	appErr, ok := apperror.As(err)
	if !ok || appErr.Code != apperror.CodeServiceUnavailable {
		t.Fatalf("Ready() error = %#v", err)
	}
}
