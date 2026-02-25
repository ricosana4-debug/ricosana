# Panduan Migrasi ke MySQL/MariaDB

## 1. Persiapan Database Server

### Buat database di MySQL/MariaDB:
```sql
CREATE DATABASE starlish_bimbel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Buat user (opsional):
```sql
CREATE USER 'starlish'@'localhost' IDENTIFIED BY 'password_aman';
GRANT ALL PRIVILEGES ON starlish_bimbel.* TO 'starlish'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Konfigurasi Environment

Edit file `.env` dan ganti DATABASE_URL:

### Untuk MySQL lokal:
```
DATABASE_URL="mysql://root:password@localhost:3306/starlish_bimbel"
```

### Untuk MySQL remote/server:
```
DATABASE_URL="mysql://username:password@server-ip:3306/starlish_bimbel"
```

### Untuk PlanetScale (cloud MySQL):
```
DATABASE_URL="mysql://username:password@us-east.connect.psdb.cloud/starlish_bimbel?sslaccept=strict"
```

## 3. Update Prisma Schema

Edit `prisma/schema.prisma`, ubah provider:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 4. Migrasi Database

```bash
# Push schema ke database
bunx prisma db push

# Atau gunakan migrasi resmi
bunx prisma migrate dev --name init

# Jalankan seed data
bunx tsx prisma/seed.ts
```

## 5. Verifikasi

Buka admin dashboard dan pastikan semua data tampil dengan benar.

---

## Struktur Data

### Jenjang (5): KB, TK, SD, SMP, SMA

### Kelas (10): 
- Kelas A, B (KB)
- Kelas C, D (TK)
- Kelas E, F (SD)
- Kelas G, H (SMP)
- Kelas I, J (SMA)

### Sesi per Kelas (5):
- Sesi 1: 08:00 - 09:30
- Sesi 2: 09:45 - 11:15
- Sesi 3: 13:00 - 14:30
- Sesi 4: 14:45 - 16:15
- Sesi 5: 16:30 - 18:00

### Siswa (150):
- No. Urut: 001 - 150
- Nama: Kosong (guru akan isi)
- Terdistribusi di 10 kelas

---

## Login Credentials

- **Super Admin**: admin@starlish.com / password123
- **Teacher**: guru1@starlish.com - guru9@starlish.com / password123

---

## API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login admin |
| `/api/auth/logout` | POST | Logout admin |
| `/api/auth/me` | GET | Get current user |
| `/api/admin/classes` | GET | Get all jenjang & classes |
| `/api/admin/students` | GET/POST/PUT/DELETE | CRUD siswa |
| `/api/admin/attendance` | GET/POST/PUT/DELETE | CRUD absensi |
| `/api/admin/finance` | GET/POST/PUT/DELETE | CRUD keuangan |
| `/api/admin/export` | GET | Export Excel |
| `/api/admin/import` | POST | Import Excel |
