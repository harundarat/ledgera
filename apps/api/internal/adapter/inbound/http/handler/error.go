package handler

import (
	"errors"
	"log/slog"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/requestid"

	"github.com/harundarat/ledgera/apps/api/internal/shared/apperror"
	"github.com/harundarat/ledgera/apps/api/internal/shared/response"
)

// ErrorMapping is the transport representation of an application error.
type ErrorMapping struct {
	Status  int
	Code    apperror.Code
	Message string
	Details map[string]any
}

// MapError translates application and Fiber errors into safe HTTP values.
func MapError(err error) ErrorMapping {
	if appErr, ok := apperror.As(err); ok {
		return ErrorMapping{
			Status:  statusForCode(appErr.Code),
			Code:    appErr.Code,
			Message: safeMessage(appErr),
			Details: appErr.Details,
		}
	}

	var fiberErr *fiber.Error
	if errors.As(err, &fiberErr) {
		switch fiberErr.Code {
		case fiber.StatusBadRequest:
			return ErrorMapping{Status: fiberErr.Code, Code: apperror.CodeBadRequest, Message: "bad request"}
		case fiber.StatusNotFound:
			return ErrorMapping{Status: fiberErr.Code, Code: apperror.CodeNotFound, Message: "resource not found"}
		case fiber.StatusMethodNotAllowed:
			return ErrorMapping{Status: fiberErr.Code, Code: apperror.CodeMethodNotAllowed, Message: "method not allowed"}
		case fiber.StatusRequestTimeout:
			return ErrorMapping{Status: fiberErr.Code, Code: apperror.CodeRequestTimeout, Message: "request timeout"}
		}
	}

	return ErrorMapping{
		Status:  fiber.StatusInternalServerError,
		Code:    apperror.CodeInternal,
		Message: "internal server error",
	}
}

// NewErrorHandler creates Fiber's global error handler.
func NewErrorHandler(logger *slog.Logger) fiber.ErrorHandler {
	return func(c fiber.Ctx, err error) error {
		mapping := MapError(err)
		logger.Error("request failed",
			"request_id", requestid.FromContext(c),
			"method", c.Method(),
			"path", c.Path(),
			"status", mapping.Status,
			"error", err,
		)
		return c.Status(mapping.Status).JSON(response.Fail(mapping.Message, mapping.Code, mapping.Details))
	}
}

func statusForCode(code apperror.Code) int {
	switch code {
	case apperror.CodeBadRequest:
		return fiber.StatusBadRequest
	case apperror.CodeNotFound:
		return fiber.StatusNotFound
	case apperror.CodeMethodNotAllowed:
		return fiber.StatusMethodNotAllowed
	case apperror.CodeRequestTimeout:
		return fiber.StatusRequestTimeout
	case apperror.CodeServiceUnavailable:
		return fiber.StatusServiceUnavailable
	default:
		return fiber.StatusInternalServerError
	}
}

func safeMessage(err *apperror.Error) string {
	switch err.Code {
	case apperror.CodeBadRequest, apperror.CodeNotFound, apperror.CodeMethodNotAllowed,
		apperror.CodeRequestTimeout, apperror.CodeServiceUnavailable:
		if err.Message != "" {
			return err.Message
		}
	}
	return "internal server error"
}
