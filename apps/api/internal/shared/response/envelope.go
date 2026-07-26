package response

import (
	"reflect"

	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
)

// Envelope is the stable JSON shape returned by all HTTP endpoints.
type Envelope struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	Data    any        `json:"data,omitempty"`
	Meta    any        `json:"meta,omitempty"`
	Error   *ErrorBody `json:"error,omitempty"`
}

// ErrorBody contains only information that is safe to expose to clients.
type ErrorBody struct {
	Code    apperror.Code `json:"code"`
	Details any           `json:"details,omitempty"`
}

// OK builds a successful envelope and omits empty optional values.
func OK(message string, data, meta any) Envelope {
	return Envelope{
		Success: true,
		Message: message,
		Data:    nonEmpty(data),
		Meta:    nonEmpty(meta),
	}
}

// Fail builds an error envelope and omits empty details.
func Fail(message string, code apperror.Code, details any) Envelope {
	return Envelope{
		Success: false,
		Message: message,
		Error: &ErrorBody{
			Code:    code,
			Details: nonEmpty(details),
		},
	}
}

func nonEmpty(value any) any {
	if value == nil {
		return nil
	}
	v := reflect.ValueOf(value)
	switch v.Kind() {
	case reflect.Array, reflect.Chan, reflect.Map, reflect.Slice, reflect.String:
		if v.Len() == 0 {
			return nil
		}
	case reflect.Interface, reflect.Pointer:
		if v.IsNil() {
			return nil
		}
	}
	return value
}
