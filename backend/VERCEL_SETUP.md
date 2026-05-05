# E-Cycle Backend - Vercel Deployment Guide

## Prerequisites
- Backend deployed di Vercel
- Database PostgreSQL (Supabase)

## Setup Steps

### 1. Di Vercel Dashboard Backend Project

Go to **Settings → Environment Variables** dan tambahkan:

```
DATABASE_URL = postgresql://...@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://...@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

Gunakan kredensial Supabase yang sama seperti lokal.

### 2. Test Endpoint

Setelah deploy ulang, tes di browser:

```
https://your-backend.vercel.app/
https://your-backend.vercel.app/api/health
https://your-backend.vercel.app/api/droppoints
```

Jika /api/droppoints return `[]` atau data, berarti berhasil ✓

### 3. Frontend Configuration

Di Vercel Frontend project, set:

```
VITE_API_BASE_URL = https://your-backend.vercel.app
```

## Troubleshooting

- **Error 500 pada /api/droppoints**: DATABASE_URL tidak di-set di Vercel
- **Connection timeout**: Database URL atau network tidak accessible dari Vercel
- **Prisma error**: DIRECT_URL harus berbeda dari DATABASE_URL untuk pgbouncer

## Local Development

```bash
cd backend
npm install
npm run dev
```

Server akan jalan di http://localhost:5000
