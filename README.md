This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This repo is a pnpm workspace with the Next.js app in `frontend/` and the NestJS API in `backend/`.

First, install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `frontend/src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Frontend dan backend dideploy sebagai **dua project Vercel terpisah** dari repo yang sama:

1. `frontend` — Root Directory `frontend`, Framework Preset **Next.js**.
2. `backend` — Root Directory `backend`, Framework Preset **NestJS** (lihat `backend/vercel.json`).

### Backend (`backend/`)

- Set environment variables berikut di project Vercel:
  - `NODE_ENV=production`
  - `DATABASE_URL` (Postgres, gunakan connection string pooler)
  - `BETTER_AUTH_SECRET` (minimal 32 karakter)
  - `BETTER_AUTH_URL=https://<domain-backend>`
  - `FRONTEND_URL=https://<domain-frontend>`
  - `AUTH_COOKIE_SAMESITE` (`lax` untuk custom domain, `none` untuk domain `*.vercel.app`)
  - `CRON_SECRET`
  - `BLOB_PRODUCTS_READ_WRITE_TOKEN` dan `BLOB_PROOFS_READ_WRITE_TOKEN`
  - `MAIL_TRANSPORT=smtp` beserta `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
  - `ORDER_EXPIRY_HOURS`, `LOW_STOCK_THRESHOLD`
- Buat dua Vercel Blob store: satu **public** untuk gambar produk, satu **private** untuk bukti pembayaran.
- Untuk pengembangan lokal, tarik environment dari Vercel agar token Blob tersedia:
  ```bash
  cd backend && vercel env pull .env
  ```
- Jalankan migrasi database sekali secara manual/CI:
  ```bash
  pnpm --filter backend db:migrate
  ```
- Endpoint cron `GET /api/internal/orders/expire` dipanggil oleh Vercel Cron harian dengan header
  `Authorization: Bearer $CRON_SECRET`. Order juga kedaluwarsa secara *lazy* saat diakses.
- Di plan Hobby, Vercel Cron hanya boleh berjalan sekali sehari. Untuk expiry tiap 5 menit,
  upgrade ke Pro lalu ubah `schedule` di `backend/vercel.json` menjadi `*/5 * * * *`.

### Frontend (`frontend/`)

- Set `NEXT_PUBLIC_API_URL=https://<domain-backend>` (nilai ini di-*bake* saat build, jadi redeploy setelah berubah).
- `next.config.ts` sudah mengizinkan gambar dari Vercel Blob (`*.public.blob.vercel-storage.com`).

### Auth lintas domain

`SameSite=Lax` tidak dikirim browser pada request lintas-site. Untuk stabilitas terbaik gunakan
custom domain dalam satu registrable domain, mis. `app.example.com` + `api.example.com`. Jika tetap
memakai domain `*.vercel.app`, set `AUTH_COOKIE_SAMESITE=none` dan siapkan fallback karena sebagian
browser memblokir cookie pihak ketiga.
