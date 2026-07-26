-- +goose Up
-- Bootstrap intentionally performs no business-schema changes.
SELECT 1;

-- +goose Down
-- Bootstrap rollback is intentionally a no-op.
SELECT 1;
