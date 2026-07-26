# Database migrations

Direktori ini sengaja belum berisi migration bisnis. Migration
`00001_bootstrap.sql` adalah no-op agar lifecycle Goose dapat diverifikasi
sejak awal; migration tersebut tidak membuat entity, tabel, atau schema
Ledgera.

Buat migration baru dengan nama deskriptif:

```sh
make migration-create NAME=create_accounts
```

Migration tidak dijalankan otomatis saat API dimulai. Jalankan `make
migrate-up` sebagai langkah deployment terpisah.
