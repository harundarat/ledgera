package apperror

import (
	"errors"
	"fmt"
)

// Code is a stable, machine-readable application error code.
type Code string

const (
	CodeBadRequest         Code = "BAD_REQUEST"
	CodeNotFound           Code = "NOT_FOUND"
	CodeMethodNotAllowed   Code = "METHOD_NOT_ALLOWED"
	CodeRequestTimeout     Code = "REQUEST_TIMEOUT"
	CodeServiceUnavailable Code = "SERVICE_UNAVAILABLE"
	CodeInternal           Code = "INTERNAL_ERROR"
)

// Error carries safe client-facing information while retaining an internal
// cause for logs and error inspection.
type Error struct {
	Code    Code
	Message string
	Details map[string]any
	Err     error
}

func (e *Error) Error() string {
	if e == nil {
		return ""
	}
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap exposes the internal cause without serializing it.
func (e *Error) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

// New constructs an application error without an internal cause.
func New(code Code, message string, details map[string]any) *Error {
	return &Error{Code: code, Message: message, Details: details}
}

// Wrap constructs an application error that retains an internal cause.
func Wrap(code Code, message string, err error) *Error {
	return &Error{Code: code, Message: message, Err: err}
}

// As extracts an application error from an error chain.
func As(err error) (*Error, bool) {
	var target *Error
	ok := errors.As(err, &target)
	return target, ok
}
