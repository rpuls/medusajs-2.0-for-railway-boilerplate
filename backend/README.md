<h1 align="center">
  Backend
</h1>

<p align="center">
The Medusa 2.0 backend of this Railway deploy template.<br>
For deployment instructions and the full stack overview, see the <a href="../README.md">main README</a>.</p>

<p align="center">
  <sub>An independent project, not affiliated with MedusaJS, Inc. For questions about Medusa itself, see the <a href="https://docs.medusajs.com/">official documentation</a>.</sub>
</p>

---

Medusa is used as published, with no fork and no patches to the core. Everything
in `src/` is this template's own configuration and additions.

## Running it

```bash
cd backend
cp .env.template .env       # then read it, the top of the file matters
pnpm install
pnpm ib                     # migrate and seed
pnpm dev                    # API on :9000, admin dashboard on :9000/app
```

**pnpm only.** `src/scripts/postBuild.js` calls `pnpm i --frozen-lockfile`
directly when assembling the compiled server, so an npm or yarn install gets you
a tree that works locally and a deploy that fails.

Node 22.12 or later, per `.nvmrc`. The floor is real rather than cautious:
`@medusajs/medusa@2.19` declares `^20.19.0 || >=22.12.0` and the MeiliSearch
plugin declares `>=22`.

To point a local backend at a deployed database, copy `DATABASE_URL` out of
Railway into your `.env`. Run `pnpm ib` only against a database you are willing
to seed.

### Commands

| Command | What it does |
| ------- | ------------ |
| `pnpm ib` | Initialize: run migrations and seed the system data, region, sales channel, publishable key and demo catalogue. |
| `pnpm dev` | Development server with the admin dashboard at `/app`. |
| `pnpm build && pnpm start` | Compile and run from the built output in `.medusa/server`. This is what Railway does, so it is how to reproduce a deploy-only problem. |
| `pnpm seed` | Re-run just the seed script. |
| `pnpm email:dev` | Preview the transactional email templates at `localhost:3002`. |

## Services it expects

All four are provisioned automatically by the Railway template.

- **Postgres.** Required.
- **Redis.** Optional, and it falls back to a simulated in-memory bus, but that
  fallback is single-process and loses events on restart. Set `REDIS_URL` for
  anything real. It backs both the event bus and the workflow engine.
- **S3-compatible storage.** Optional, falls back to local disk, which is
  ephemeral on Railway: uploaded product images vanish on the next deploy.
  Works with Railway buckets, AWS S3, Cloudflare R2 and MinIO. See the `S3_*`
  block in `.env.template`.
- **MeiliSearch.** Optional. Needs server 1.20 or later, because
  `@rokmohar/medusa-plugin-meilisearch@2` uses the `rename` field on
  `POST /swap-indexes`. On an older server the catalogue silently never indexes
  and search returns nothing, with no error anywhere.

The local `docker-compose.yml` in the repository root provides all four.

## What this template adds

| Path | What it is |
| ---- | ---------- |
| `medusa-config.js` | Registers every optional integration behind a presence check on its environment variables, so an unconfigured store starts rather than crashing. |
| `src/modules/email-notifications/` | Resend provider with react-email templates for order confirmation and admin invites. [Its own README](src/modules/email-notifications/README.md). |
| `src/subscribers/` | `order-placed` and `invite-created`, which send those emails. |
| `src/search/products.ts` | The product search index definition consumed by Medusa 2.19's Search Module. |
| `src/api/key-exchange/` | Hands the storefront its publishable API key at boot, since the two services deploy independently. |
| `src/scripts/seed.ts` | The demo store: one Europe region covering gb, de, dk, se, fr, es and it, a sales channel, a publishable key and four products. |
| `src/scripts/postBuild.js` | Assembles the production server after `medusa build`. |
| `src/lib/constants.ts` | Every environment variable this backend reads, in one file, with the fallbacks documented. |

## Configuration

Every variable is documented inline in [`.env.template`](.env.template).

Two are worth calling out because nothing forces you to change them and both are
published in this repository:

- `JWT_SECRET` and `COOKIE_SECRET` sign admin sessions. The backend prints a
  warning at boot when a production deploy is still on the placeholder.
- `MEDUSA_ADMIN_PASSWORD` is the login to your own dashboard.

Email needs both halves of one provider: `RESEND_API_KEY` **and**
`RESEND_FROM_EMAIL` (or the SendGrid pair). With only one set, the notification
module is not registered at all and no order confirmations or admin invites
send, silently.

Stripe likewise needs both `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` before
the payment module is registered. The webhook endpoint is on **this** service,
at `/hooks/payment/stripe_stripe`, not on the storefront.

## Adding your own code

The stock Medusa scaffold docs for each directory are in the
[Medusa documentation](https://docs.medusajs.com/learn), which stays current in
a way a copy here would not.
