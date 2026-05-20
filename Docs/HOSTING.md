# SC Prints — hosting (Fly / DigitalOcean / Cloudflare / Vercel)

Railway was retired after the May 2026 outage. Production now runs on the stack below.

## Architecture

| Component | Provider | Notes |
| --- | --- | --- |
| Medusa backend + admin | [Fly.io](https://fly.io) | App `sc-prints-backend`, region `syd`, `backend/fly.toml` |
| Next.js storefront | Vercel | Custom domain `sc-prints.com.au` |
| PostgreSQL | DigitalOcean Managed Database | Connection string in Fly secret `DATABASE_URL` |
| Media / uploads | Cloudflare R2 | Via MinIO-compatible `MINIO_*` env vars |
| Redis | Upstash, DO Managed Redis, or similar | **Required** for production sessions, event bus, workflows |

## URLs

| Surface | URL |
| --- | --- |
| Backend API + Admin | https://sc-prints-backend.fly.dev |
| Admin UI | https://sc-prints-backend.fly.dev/app |
| Storefront (production) | https://sc-prints.com.au |
| Health check | https://sc-prints-backend.fly.dev/health |

## Operations

### Deploy backend

```bash
cd backend
fly deploy --app sc-prints-backend
```

Migrations run as a Fly release command (once per deploy via `[deploy] release_command` in `fly.toml`). Boot just runs `medusa start`. Suspend mode means idle resume is ~500ms, not a 2-4 minute cold start.

### Logs

```bash
fly logs --app sc-prints-backend
```

### Run a one-off script in production

```bash
fly ssh console --app sc-prints-backend
cd /app/.medusa/server && npx medusa exec src/scripts/<script-name>.js
```

Compiled `.js` paths live under `.medusa/server` inside the container (`WORKDIR /app` in `backend/Dockerfile`).

### Local dev against production DB (careful)

Copy `DATABASE_URL` from Fly secrets into `backend/.env` — never commit it.

```bash
fly secrets list --app sc-prints-backend
```

## Environment variables

### Fly (`sc-prints-backend`)

| Variable | Purpose |
| --- | --- |
| `BACKEND_PUBLIC_URL` | `https://sc-prints-backend.fly.dev` — admin SPA + emails |
| `DATABASE_URL` | DigitalOcean Postgres |
| `REDIS_URL` | Production Redis (omit = fake redis + memory sessions) |
| `JWT_SECRET` / `COOKIE_SECRET` | Must stay stable across migrations or all users re-auth |
| `STOREFRONT_URL` | `https://sc-prints.com.au` |
| `STORE_CORS` / `ADMIN_CORS` / `AUTH_CORS` | Include storefront + admin origins |
| `MINIO_ENDPOINT` / `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_BUCKET` / `MINIO_PUBLIC_URL` | Cloudflare R2 |

Fly sets `FLY_APP_NAME=sc-prints-backend` automatically; `BACKEND_URL` in code falls back to `https://${FLY_APP_NAME}.fly.dev` if `BACKEND_PUBLIC_URL` is unset.

### Vercel (storefront)

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `https://sc-prints-backend.fly.dev` |
| `NEXT_PUBLIC_BASE_URL` | `https://sc-prints.com.au` |

## Webhooks (update from Railway)

- Stripe cart: `https://sc-prints-backend.fly.dev/hooks/payment/stripe_stripe`
- Stripe payment links: `https://sc-prints-backend.fly.dev/hooks/stripe-payment-link`
- PayPal / ShipStation: same host, paths unchanged

## Repo name note

The GitHub repo is still named `medusajs-2-0-for-railway-vercel`; the Vercel project may keep that name. That is **not** the backend host — backend is Fly only.
