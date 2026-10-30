# AGENTS.md

Instructions for coding agents working in this repository. Humans should start
with [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## What this is

A community-maintained Railway template that deploys the official open-source
Medusa 2 release (backend and admin) together with a Next.js storefront derived
from Medusa's starter. Medusa is used as published: no fork, no patches to
`node_modules`. Everything this repository adds lives in `backend/src`,
`backend/medusa-config.js` and `storefront/`.

It is not an official Medusa product. Never add Medusa logos, and never name or
describe anything in a way that suggests Medusa, Inc. made or endorses it. The
word "official" only ever describes Medusa's own artifacts ("the official
docs").

## Layout

| Path | What it is |
| --- | --- |
| `backend/` | Medusa server and admin dashboard. Its own pnpm package. |
| `backend/medusa-config.js` | Every optional integration (Redis, S3, MeiliSearch, Stripe, Resend, SendGrid) is registered only when its env vars are present. |
| `backend/src/api/` | Custom routes (`/key-exchange`) and `middlewares.ts`. |
| `backend/src/search/` | Search index declarations for Medusa's Search Module. |
| `backend/src/scripts/` | `seed.ts`, `postBuild.js`, `prepare-migrations.js`. |
| `backend/src/modules/email-notifications/` | Resend provider and react-email templates. |
| `backend/src/store-mcp/` | The store MCP server: OAuth authorization server, MCP tools, consent page. Its tables are `backend/src/modules/store-mcp/`, its admin page and widget `backend/src/admin/`. See [docs/store-mcp.md](docs/store-mcp.md). |
| `storefront/` | Next.js 15 App Router storefront. Its own pnpm package. |
| `storefront/src/lib/data/` | Every Store API call. Read the comment in `regions.ts` before adding one. |
| `storefront/src/lib/ucp/` | The shopper side of AI commerce (UCP): `/.well-known/ucp`, the MCP server at `/ucp/mcp`, REST at `/ucp/v1`. Ported from upstream's dtc-starter; no auth, guest carts only. Not the backend's admin `/mcp`. |
| `storefront/qa/` | The Playwright QA suite. The real test suite of this repo. |
| `docker-compose.yml` | Local Postgres, Redis, MeiliSearch and MinIO, mirroring the Railway services. |
| `docs/` | Brand assets and the architecture diagram source. |

There is no root `package.json` and no workspace. Run every command inside
`backend/` or `storefront/`.

## Toolchain

- **pnpm only.** `postBuild.js` runs `pnpm i --frozen-lockfile` inside the
  compiled server, so an npm or yarn install works locally and fails on deploy.
  Commit both `pnpm-lock.yaml` files after any dependency change.
- **Node 22.22 or later** (`.nvmrc` in both packages). Medusa 2.22 requires it.
- Keep every `@medusajs/*` package on the same version, in both packages, and
  `@medusajs/ui` on the version Medusa co-released with it.

## Run it locally

```bash
docker compose up -d                 # from the repo root

cd backend
cp .env.template .env                # uncomment the S3_* and MEILISEARCH_* lines to use compose
pnpm install
pnpm ib                              # migrate; on an empty database also seed and create the admin user
pnpm dev                             # API on :9000, admin on :9000/app

cd ../storefront
cp .env.local.template .env.local
pnpm install
pnpm dev                             # http://localhost:8000, needs the backend running
```

After pulling an update, run `pnpm ib` in `backend/` again. It migrates every
time and seeds only an empty database.

**Never run a bare `medusa db:migrate` from an agent shell.** When a Medusa
upgrade changes a link table, its link sync waits for an interactive answer
and hangs forever without a terminal. `pnpm ib` passes `--execute-all-links`,
which is what the Railway boot does too.

The storefront fetches its publishable key from the backend's `/key-exchange`
at build and start (through `launch-storefront`), so `next build` on its own
fails. Use `pnpm build` and `pnpm start`.

## Checks

These are what CI runs (`.github/workflows/ci.yml`):

```bash
cd backend    && pnpm exec tsc --noEmit
cd storefront && pnpm typecheck && pnpm lint
```

`storefront/next.config.js` ignores type and lint errors during `next build` on
purpose, so deployers' own edits never brick a deploy. That makes the commands
above the only gate. Run them.

## QA suite

```bash
cd storefront && pnpm test:qa
```

Runs against whatever stack is already up (default `localhost:8000` and
`:9000`, configured from `storefront/.env.local`). Set `QA_BASE_URL` and the
other variables in [storefront/qa/README.md](storefront/qa/README.md) to run
it against a deployed store. Specs that need Stripe or Resend keys skip
themselves, with a reason, when those are absent.

- Run it against a production build (`pnpm build && pnpm start` in both
  packages) before calling anything done. Dev mode hides caching bugs. A full
  run then takes about 4 minutes.
- Keep the local backend on `NODE_ENV=development` (the `.env` default). In
  production mode Medusa marks the admin session cookie `Secure`, plain http
  never receives it, and every admin spec fails on the login page.
- Do not edit `backend/src` while it runs under `pnpm dev`. The watcher
  restarts Medusa and every admin spec in flight fails with connection errors
  that look like real regressions.
- `08-discounts` needs two promotions, `QAFIVE` and `QATEN`; the README has
  the API calls.
- Three specs fail intermittently and pass on a rerun: the address book and
  discount stacking, which sit on an upstream defect where a server action
  succeeds but the page never repaints, and catalogue sorting, whose cause is
  not established. Check the database before believing one of them.

## How it deploys on Railway

Railway builds `backend/` and `storefront/` as separate services from this
repository's default branch. There is no `railway.json`: service settings,
variables and images live in the Railway template, not here. If a change needs
a Railway setting, say so; do not assume it exists.

Two layouts must both keep working:

| Layout | Services |
| --- | --- |
| Full template | Backend, Storefront, Postgres, Redis, MeiliSearch, Bucket, Bucket-proxy |
| Trial template | Backend, Storefront, Postgres only. No Redis, no MeiliSearch (search runs on Medusa's Postgres provider), files on local disk. |

Backend boot (`pnpm start`):

1. `prepare-migrations.js`: a no-op except on a Medusa 2.19 database, where it
   clears the search sync rows that would otherwise abort Medusa's 2.20 search
   migration. A workaround for a Medusa bug, so it stays in this repository
   rather than in `medusajs-launch-utils`.
2. `init-backend` (from `medusajs-launch-utils`, 0.2.0 or later) runs
   `medusa db:migrate --execute-all-links` on every boot, so a store that
   pulls an update is migrated without anyone running a command. On an empty
   database it then seeds and creates the admin user from
   `MEDUSA_ADMIN_EMAIL` and `MEDUSA_ADMIN_PASSWORD`. In worker mode it does
   neither.
3. `medusa start` from `.medusa/server`.

Things that have bitten this template before:

- Env var names are read by `medusajs-launch-utils` too. Do not rename
  `MEILISEARCH_*`, `MEDUSA_ADMIN_*`, `NEXT_PUBLIC_MEDUSA_*` or `DATABASE_URL`.
- The storefront searches through the backend's `POST /store/search`. The
  Search Module keeps each index under a versioned physical name
  (`products_v1`, ...), so nothing may query MeiliSearch by a fixed index name.
- Since Medusa 2.21 every Store API route has a strict field allowlist, and a
  field outside it is dropped silently with a 200. When the storefront needs a
  new field, check it against the route's `allowed` list in
  `@medusajs/medusa/dist/api/store/**/query-config.js`, or add it with the
  `allowFields` middleware registered without a `method` key.
- `--execute-all-links` drops the table of any link that is no longer
  defined in code, for example after removing a module, on the next boot.
  That link data is gone. Make a module conditional on an env var only if
  losing its links when the variable is missing is acceptable.
- A fresh install logs `Search index "products" has no active version yet`
  errors while it seeds. Harmless: the seed fires catalogue events before the
  index exists, and startup then fills the whole index.
- During a Railway redeploy the old container keeps answering `/health`, so a
  200 right after a redeploy proves nothing about the new code.
- A cart completes only with one shipping method per shipping profile among
  its items, and Medusa lists every option for the address whatever its
  profile. So the checkout delivery step asks once per profile, using
  `items.product.shipping_profile.id`, which `src/api/middlewares.ts` allows on
  the cart (`items.variant.product...` is one relation too deep and is
  refused). Upstream asks once; keep this when taking their version.
- After changing payment providers, redeploy the backend first and the
  storefront last. The storefront caches each region's provider list until it
  is redeployed.
- Every storefront route that is not region-prefixed (`/llms.txt`,
  `/.well-known/ucp`, `/ucp/`, `/buy/`) must be excluded in the matcher in
  `src/middleware.ts`, or it is 307'd to `/gb/...` and a 404. Next 15 does
  serve an `app/.well-known/` folder.
- The cart cookie is `SameSite=lax` for the UCP `continue_url`: the shopper
  clicks it on the assistant's site, the browser treats the whole redirect
  chain as cross-site, and a strict cookie leaves the checkout empty.
  `19-ucp` clicks the link from a fake cross-site page because `page.goto`
  counts as same-site and would not catch it. The auth cookie is still
  strict, so that click arrives signed out and the order is a guest order.
- The UCP tools never set a shipping method. Delivery, with its one choice
  per shipping profile, stays in the storefront checkout the link opens.

## Store MCP server

`/mcp` lets AI assistants work on the store as an admin who approved them on
the consent page. Its whole safety model is in what the tools may write, so
keep these when changing it:

- Writes go to drafts only. A published product is never written by a tool;
  changes to it are saved as suggestions that an admin applies in the
  dashboard. No tool publishes, deletes, refunds, cancels, or changes live
  prices. Stock is written directly only on drafts.
- Stock on published products, warehouses, regions, shipping and tax have no
  draft state, so tools only propose them.
  `src/store-mcp/setup.ts` plans a proposal into the sentences the admin reads,
  and Apply plans it again against the current store and runs exactly that. A
  proposal never deletes, never removes a country, and never changes an
  existing shipping price; it may change stock levels and a tax rate, and move
  up to 50 products into a shipping profile.
- A variant is buyable only with stock at a location linked to the cart's sales
  channel, and a shipping option is flagged insufficient unless its own
  location holds the stock. A new variant has an inventory item but no stock
  level anywhere; `src/store-mcp/stock.ts` creates the level as it sets stock.
- Customer data stops at name, email, country and order history, and no tool
  returns more than 50 rows.
- The capability lists on the consent page, the admin page and
  [docs/store-mcp.md](docs/store-mcp.md) must say the same thing. The first two
  share `CAN` and `CANNOT` in `src/store-mcp/oauth/consent-page.ts`.
- Never log a token, code, password or client secret. Codes and tokens are
  stored as SHA-256 hashes only.
- `storefront/qa/17-store-mcp.spec.ts` covers the OAuth flow, the tool limits
  and revocation. Run it after any change here.
- Do not pass `variants` to `updateProductsWorkflow` to change prices: it
  replaces the whole variant list and deletes the variants you left out. Use
  `updateProductVariantsWorkflow` per variant. `countries` on
  `updateRegionsWorkflow` and `geo_zones` on `updateServiceZonesWorkflow`
  replace the whole list the same way: send the existing ones along.

## Medusa knowledge

Prefer Medusa's own material over memory. APIs change between minor releases.

- **Agent Skills** (no account needed). Claude Code:
  `/plugin marketplace add medusajs/medusa-agent-skills`, then
  `/plugin install medusa-dev@medusa`. Other agents:
  `npx skills add medusajs/medusa-agent-skills`.
- **llms.txt**: https://docs.medusajs.com/llms.txt, an index of the docs in
  plain text, readable without any login.
- **Docs MCP server** (optional): `https://docs.medusajs.com/mcp`. It needs a
  Medusa Cloud account to sign in. The `medusa-dev` plugin registers it, so
  Claude Code will ask you to authenticate it; the skills work without it.
- **Release notes**: `gh release view vX.Y.Z -R medusajs/medusa`. Read every
  release between the current version and the target before an upgrade.
- **Storefront upstream**: `medusajs/nextjs-starter-medusa` (deprecated in
  April 2026, succeeded by `medusajs/dtc-starter`). When a storefront component
  is wrong, compare with upstream first and prefer taking their version over a
  local fix. Every local divergence is a future merge conflict.

## House rules

- Match the surrounding code: its comment density, naming and idiom. Comments
  here explain why, often with the incident that made them necessary. Keep
  that habit.
- No em or en dashes in code comments, docs or commit messages.
- Do not add dependencies a change does not strictly need.
- Never put secrets in logs, test output or committed files.
