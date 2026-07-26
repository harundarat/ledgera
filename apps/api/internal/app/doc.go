// Package app is the application's composition root and lifecycle coordinator.
//
// It is the only internal package allowed to assemble config, pgx-backed
// outbound adapters, use cases, Fiber inbound adapters, and process resources.
// Dependencies are constructed from outbound infrastructure toward inbound
// delivery and closed in reverse order.
package app
