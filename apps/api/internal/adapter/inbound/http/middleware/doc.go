// Package middleware provides HTTP-only cross-cutting behavior.
//
// Its dependencies are restricted to Fiber, slog, shared application errors,
// and sibling inbound error mapping. It never calls databases directly or
// contains domain and use-case decisions.
package middleware
