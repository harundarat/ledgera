// Package health implements operational health-check use cases.
//
// It depends on outbound ports and shared application errors, never on Fiber,
// pgx, SQL, or concrete adapter implementations.
package health
