package response

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
)

func TestOKOmitsEmptyOptionalFields(t *testing.T) {
	payload, err := json.Marshal(OK("done", map[string]any{}, []string{}))
	if err != nil {
		t.Fatal(err)
	}
	got := string(payload)
	if strings.Contains(got, `"data"`) || strings.Contains(got, `"meta"`) || strings.Contains(got, `"error"`) {
		t.Fatalf("optional fields were not omitted: %s", got)
	}
}

func TestOKIncludesNonEmptyValues(t *testing.T) {
	payload, err := json.Marshal(OK("done", map[string]any{"id": 1}, map[string]any{"page": 1}))
	if err != nil {
		t.Fatal(err)
	}
	got := string(payload)
	if !strings.Contains(got, `"data"`) || !strings.Contains(got, `"meta"`) {
		t.Fatalf("non-empty fields were omitted: %s", got)
	}
}

func TestFailOmitsEmptyDetails(t *testing.T) {
	payload, err := json.Marshal(Fail("failed", apperror.CodeBadRequest, map[string]any{}))
	if err != nil {
		t.Fatal(err)
	}
	got := string(payload)
	if strings.Contains(got, `"details"`) || strings.Contains(got, `"data"`) {
		t.Fatalf("empty fields were not omitted: %s", got)
	}
}
