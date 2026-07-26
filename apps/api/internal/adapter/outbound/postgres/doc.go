// Package postgres implements outbound persistence ports with PostgreSQL.
//
// Its dependencies are restricted to use-case ports and pgx. It never depends
// on Fiber or inbound adapters, and it never leaks pgx types into use cases or
// domain.
package postgres
