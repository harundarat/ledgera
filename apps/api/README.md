# Ledgera API

Backend API Ledgera dibangun dengan Go 1.26, Fiber v3, pgx v5, PostgreSQL 18,
dan Goose v3. Struktur adapter menjaga use case dan domain tetap independen
dari HTTP maupun database.

## Menjalankan secara lokal

Prasyarat: Go 1.26 dan Docker dengan Compose.

```sh
cp .env.example .env
make setup
make db-up
make migrate-status
make run
```

API tersedia di `http://localhost:8080`:

- `GET /health/live` — proses API sedang hidup.
- `GET /health/ready` — API dapat menjangkau PostgreSQL.
- `/api/v1` — prefix untuk endpoint bisnis mendatang.

Untuk menjalankan API dan PostgreSQL sepenuhnya melalui container:

```sh
docker compose up --build --wait
```

## Perintah pengembangan

```sh
make test
make vet
make build
make check
make migration-create NAME=create_accounts
make migrate-up
make migrate-down
make migrate-status
make migrate-reset
make db-down
```

`migrate-reset` mengembalikan semua migration dan bersifat destruktif terhadap
schema yang dikelola Goose.

## Arsitektur

Alur dependency disusun secara manual di `internal/app`:

```text
HTTP/Fiber adapter -> health use case -> DatabaseHealthChecker port
                                           ^
                                           |
                                 PostgreSQL/pgx adapter
```

- `internal/domain` hanya berisi aturan bisnis dan standard library.
- `internal/usecase` mendefinisikan alur aplikasi dan outbound port.
- `internal/adapter/inbound` mengenal Fiber dan menerjemahkan HTTP.
- `internal/adapter/outbound` mengenal pgx dan mengimplementasikan port.
- `internal/app` adalah satu-satunya composition root.

Setiap package wajib memiliki `doc.go` yang mendokumentasikan tanggung jawab
dan batas dependency. Migration dijalankan sebagai proses terpisah, bukan saat
startup API.

## Konfigurasi

Konfigurasi dibaca dari environment dan divalidasi saat startup. Lihat
`.env.example` untuk daftar lengkap. `DATABASE_URL` wajib diisi dan harus
menggunakan scheme `postgres` atau `postgresql`.

Semua respons HTTP menggunakan JSON envelope yang konsisten. Detail internal
seperti DSN, SQL, cause error, dan stack trace hanya ditulis ke structured log,
tidak dikirim ke client.
