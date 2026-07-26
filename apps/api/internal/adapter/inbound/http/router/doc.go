// Package router wires Fiber routes to inbound HTTP handlers.
//
// It depends only on Fiber and sibling inbound packages. Concrete outbound
// adapters and pgx remain behind use-case interfaces.
package router
