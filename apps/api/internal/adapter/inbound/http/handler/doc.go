// Package handler translates HTTP requests into use-case calls and envelopes.
//
// Its dependencies are restricted to Fiber, use-case-facing interfaces, and
// shared response types. It never imports pgx, PostgreSQL adapters, or domain
// implementation details.
package handler
