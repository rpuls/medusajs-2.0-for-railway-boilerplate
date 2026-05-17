# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SC Prints — Medusa.js + Next.js storefront

Custom-print e-commerce platform built on Medusa v2 (`backend/`) and Next.js 15 (`storefront/`). Customers design garments in a Fabric.js canvas, save them to a personal "My Designs" library, re-order from past orders, and see live production status as their job moves through the shop.

## Commands

Each app has its own `node_modules` — always `cd` into the app first, or use `pnpm --filter`.

### Backend (`cd backend`)

```bash
pnpm dev                  # start Medusa dev server (hot reload)
pnpm build                # production build: medusa build + postBuild.js (needs DATABASE_URL set)
pnpm test                 # run all Jest tests
pnpm test -- --testPathPattern=src/lib/__tests__/production-stage  # single test file
pnpm email:dev            # preview Resend email templates at localhost:3002
```

### Storefront (`cd storefront`)

```bash
pnpm dev                  # start Next.js dev server (waits for backend to be healthy first)
pnpm build:next           # Next.js build only, skipping the backend health-check wrapper
pnpm lint                 # ESLint via next lint
pnpm test                 # run all Jest tests
pnpm test -- --testPathPattern=src/modules/customizer/lib/dpi  # single test file
pnpm test-e2e             # Playwright E2E tests
```

### Repo root

```bash
pnpm check-production-stage-sync   # validate backend & storefront production-stage files are in sync
```

### One-off backend scripts (run via Railway exec or local medusa exec)

```bash
# Local
cd backend && npx medusa exec src/scripts/import-as-colour-from-api.ts
# Railway
cd /app/.medusa/server && npx medusa exec src/scripts/<name>.js
```

Always use the `.medusa/server` path on Railway — other forms fail.

## Repo layout

- `backend/` — Medusa v2.12.1 server. Custom modules in `src/modules/`. Custom routes in `src/api/`. Admin widgets in `src/admin/widgets/`. Email templates (Resend) in `src/modules/email-notifications/templates/`.
- `storefront/` — Next.js 15 App Router. Country-code prefixed routes (`[countryCode]`). Customer account dashboard at `account/@dashboard/`. Fabric.js customizer at `/customizer`.
- `scripts/` — Repo-level utilities (CSV transforms + the production-stage sync check).

The two apps are sibling packages, **not** a workspace — separate `node_modules`, separate `tsconfig.json`. Code that needs to live in both must be hand-mirrored (see "Production-stage sync" below).

## Brands (single source of truth)

One `Brand` entity owns every product's brand identity. Storefront filtering, brand landing pages (`/brands/[handle]`), and reporting all read from it.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/brand/](backend/src/modules/brand/) |
| Model | [backend/src/modules/brand/models/brand.ts](backend/src/modules/brand/models/brand.ts) |
| Migration | [backend/src/modules/brand/migrations/Migration20260511000000.ts](backend/src/modules/brand/migrations/Migration20260511000000.ts) |
| Product↔Brand link | [backend/src/links/product-brand.ts](backend/src/links/product-brand.ts) |
| Admin REST | [backend/src/api/admin/brands/route.ts](backend/src/api/admin/brands/route.ts) + [\[id\]/route.ts](backend/src/api/admin/brands/[id]/route.ts) |
| Store REST | [backend/src/api/store/brands/route.ts](backend/src/api/store/brands/route.ts) + [\[handle\]/route.ts](backend/src/api/store/brands/[handle]/route.ts) |
| Per-product assignment | [backend/src/api/admin/products/\[id\]/brand/route.ts](backend/src/api/admin/products/[id]/brand/route.ts) |
| Admin CRUD page | [backend/src/admin/routes/brands/page.tsx](backend/src/admin/routes/brands/page.tsx) |
| Admin product widget | [backend/src/admin/widgets/product-brand.tsx](backend/src/admin/widgets/product-brand.tsx) |
| Brand picker (reusable) | [backend/src/admin/components/brands/brand-picker.tsx](backend/src/admin/components/brands/brand-picker.tsx) |
| Spreadsheet importer resolver | [backend/src/admin/lib/spreadsheet-sync-brands.ts](backend/src/admin/lib/spreadsheet-sync-brands.ts) |
| Storefront data layer | [storefront/src/lib/data/brands.ts](storefront/src/lib/data/brands.ts) |
| Storefront presentation (logo/colour by handle) | [storefront/src/modules/brands/data/brands.ts](storefront/src/modules/brands/data/brands.ts) |
| `/brands/[handle]` landing | [storefront/src/app/\[countryCode\]/(main)/brands/\[handle\]/page.tsx](storefront/src/app/[countryCode]/(main)/brands/[handle]/page.tsx) |
| One-shot migration script | [backend/src/scripts/migrate-products-to-brand-entity.ts](backend/src/scripts/migrate-products-to-brand-entity.ts) |

**Hierarchy**: brands optionally have a `parent_id` (one level). FashionBiz is the parent of Biz Care, Biz Collection, Syzmik, and Biz Corporates — enables supplier-mix reporting at multiple grain levels.

**Importer**: the spreadsheet sync uses a single "Product Brand" column (back-compat reads "Product Supplier" too). Values are resolved by name or `external_code` (case-insensitive) and missing brands are auto-created. New brands default to `parent_id = null` — staff re-parent in admin.

**Preview UI**: both spreadsheet-sync flows (`/app/spreadsheet-sync` and `/app/spreadsheet-sync-update`) show a per-product checklist before submitting the batch. Products with validation warnings start unchecked. Unchecking skips the product entirely (no metadata writes, no link).

**Deprecated**: legacy `metadata.brand` / `metadata.supplier` / `metadata.manufacturer` / `metadata.label` reads are kept only as fallbacks in the catalog graph route. Schedule a follow-up to delete those after a couple of weeks of clean writes.

## Customer-portal feature stack (Phases 1-4)

These four phases compose into the SC Prints customer portal. Each is independently deployable; they layer in build order.

### 1. Production-stage tracker + emails

Staff updates each order's stage in the admin; the customer sees a Domino's-Pizza-style stepper on `/account/orders/details/<id>` and gets emails on major milestones.

| Component | Path |
| --- | --- |
| Canonical stage list, labels, milestone mapping | [backend/src/lib/production-stage.ts](backend/src/lib/production-stage.ts) |
| Storefront mirror (kept in sync) | [storefront/src/modules/order/lib/production-stage.ts](storefront/src/modules/order/lib/production-stage.ts) |
| Sync check | `scripts/check-production-stage-sync.mjs` (`pnpm check-production-stage-sync` from repo root) |
| Admin route | [backend/src/api/admin/orders/[id]/production-stage/route.ts](backend/src/api/admin/orders/[id]/production-stage/route.ts) |
| Admin widget | [backend/src/admin/widgets/order-production-stage.tsx](backend/src/admin/widgets/order-production-stage.tsx) |
| Email subscriber | [backend/src/subscribers/order-production-stage-changed.ts](backend/src/subscribers/order-production-stage-changed.ts) |
| Email template | [backend/src/modules/email-notifications/templates/order-production-stage.tsx](backend/src/modules/email-notifications/templates/order-production-stage.tsx) |
| Storefront stepper | [storefront/src/modules/order/components/production-stage-tracker/index.tsx](storefront/src/modules/order/components/production-stage-tracker/index.tsx) |

**Stages**: `received` → `art_review` → `awaiting_approval` → `approved` → `blanks_ordered` → `blanks_arrived` → `in_production` → `quality_check` → `shipped` → `delivered`

**Customer milestones** (collapsed for the storefront stepper): `received` → `artwork` → `production` → `shipped` → `delivered`

**Stages that email the customer**: `awaiting_approval`, `in_production`. (`shipped` is intentionally excluded — Medusa core's `order.shipment_created` already sends a tracking email.)

### 2. Saved designs ("My Designs")

Customers click "Save to my designs" in the customizer; saved designs appear at `/account/designs` and can be re-edited or sent to cart.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/designs/](backend/src/modules/designs/) |
| Migration | [backend/src/modules/designs/migrations/Migration20260507000000.ts](backend/src/modules/designs/migrations/Migration20260507000000.ts) |
| Module Link customer↔designs | [backend/src/links/customer-designs.ts](backend/src/links/customer-designs.ts) |
| Module registration | [backend/medusa-config.js](backend/medusa-config.js) |
| Store CRUD routes | [backend/src/api/store/customers/me/designs/route.ts](backend/src/api/store/customers/me/designs/route.ts) + [backend/src/api/store/customers/me/designs/[id]/route.ts](backend/src/api/store/customers/me/designs/[id]/route.ts) |
| Storefront data layer | [storefront/src/lib/data/designs.ts](storefront/src/lib/data/designs.ts) |
| `/account/designs` page | [storefront/src/app/[countryCode]/(main)/account/@dashboard/designs/page.tsx](storefront/src/app/[countryCode]/(main)/account/@dashboard/designs/page.tsx) |
| Grid component | [storefront/src/modules/account/components/designs-grid/index.tsx](storefront/src/modules/account/components/designs-grid/index.tsx) |

The `Design` row carries `customer_id` denormalised on the table for cheap filtering, AND a Module Link for graph queries (`customer.designs`). Pick whichever your call site finds easier.

### 3. Re-order from order history (with rehydration)

A "Re-order" button on each customizer line of `/account/orders/details/<id>` opens the customizer with the original artwork + layout pre-loaded. The customer can tweak quantities/sizes and add to cart through the existing flow.

| Component | Path |
| --- | --- |
| Per-line "Re-order" button | [storefront/src/modules/order/components/reorder-actions/index.tsx](storefront/src/modules/order/components/reorder-actions/index.tsx) |
| Order-line metadata helper | `getOrderLineCustomizerMetadata` in [storefront/src/lib/data/orders.ts](storefront/src/lib/data/orders.ts) |
| Rehydration effect | inside [storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx) — handles `?design=<id>` (saved-design re-edit) and `?reorder=<order_id>:<line_item_id>` (order re-order) |

Two-stage hydration: stage 1 fetches the metadata, stage 2 replays it onto Fabric once the canvas is ready (`canvasSize.width > 0`).

### 4. Live DPI warning + vectorization service

Computes effective DPI = `image source pixels / (rendered canvas px / canvas-px-per-inch)` for every Fabric image; opens a modal if the worst image is below 150 DPI; offers two paths (re-upload or pay for vectorization).

| Component | Path |
| --- | --- |
| Effective-DPI calculator | [storefront/src/modules/customizer/lib/dpi.ts](storefront/src/modules/customizer/lib/dpi.ts) |
| Educational modal | [storefront/src/modules/customizer/components/low-resolution-modal.tsx](storefront/src/modules/customizer/components/low-resolution-modal.tsx) |
| Modal trigger + cart-add | inside [storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx) |
| Admin widget for the flag | [backend/src/admin/widgets/order-vectorization-flag.tsx](backend/src/admin/widgets/order-vectorization-flag.tsx) |

**DPI bands**: `>= 250 = ok`, `150-249 = warning` (inline amber text), `< 150 = critical` (modal + amber text).

**Vectorization service**: a hidden Medusa product whose variant ID is set in `NEXT_PUBLIC_VECTORIZATION_VARIANT_ID`. When the customer accepts vectorization, the customizer adds that variant to cart with quantity 1 alongside the garment line(s).

## Required environment variables

### Backend (`backend/.env`)

| Variable | Purpose | Default |
| --- | --- | --- |
| `STOREFRONT_URL` | Used in stage-change emails to build the "View order" link. | none — emails still send, just without a CTA button |
| `STOREFRONT_DEFAULT_COUNTRY_CODE` | Country-code prefix to inject into the storefront URL (e.g. `au` → `/au/account/orders/...`). | none |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON key for a service account with read access to GSC + GA4. Powers the `/app/seo-analytics` admin page. | none — page shows "empty" state |
| `GSC_SITE_URL` | GSC property URL (exact form from Search Console, e.g. `https://sc-prints.com.au/` or `sc-domain:sc-prints.com.au`). | none |
| `GA4_PROPERTY_ID` | Numeric GA4 property ID (not the measurement ID). | none |
| `SEO_IMPERSONATION_USER` | Optional. Workspace user to impersonate via Domain-Wide Delegation (e.g. `info@scprints.com.au`). Use when Google's IAM rejects adding the SA directly to GSC/GA4. Requires DWD enabled on the SA in GCP and the SA's Client ID authorized in admin.google.com → Security → API Controls → Domain-wide Delegation with scopes `webmasters.readonly` + `analytics.readonly`. When set, the SA inherits the impersonated user's permissions and no direct grant is needed on either property. | unset — SA authenticates as itself |
| `POSTHOG_PERSONAL_API_KEY` | Optional. PostHog **Personal** API Key (Settings → Personal API keys). Required for the Reports page PostHog tile to render live numbers. Different from `POSTHOG_API_KEY` (which is the Project key used to *send* events). | unset — tile shows setup hint |
| `POSTHOG_PROJECT_ID` | Optional. Numeric PostHog project ID (visible in URLs like `app.posthog.com/project/12345/...`). Required alongside `POSTHOG_PERSONAL_API_KEY`. | unset |
| `POSTHOG_HOST` | Optional. PostHog instance host. Use `https://us.i.posthog.com` (default), `https://eu.i.posthog.com`, or your self-hosted URL. | `https://us.i.posthog.com` |

| `FASHIONBIZ_API_TOKEN` | Optional. FashionBiz Public API v3 token (Authorization: `Token <token>`). Required to enable the FashionBiz importer + nightly stock sync. When unset, the FashionBiz module is not registered and the cron is a no-op. | unset |
| `FASHIONBIZ_BRANCH` | Optional. FashionBiz country shorthand: `au`, `nz`, or `ca`. | `au` |
| `FASHIONBIZ_BASE_URL` | Optional. FashionBiz API base URL — only override for staging or proxy. | `https://www.fashionbizapis.com/api/v3` |
| `FASHIONBIZ_COST_ADJUSTMENT` | Multiplier applied to the API "1-99" tier price before it's fed into the bulk-price ladder. The FashionBiz public API exposes a published "1-99" wholesale tier, but the distributor storefront (`au-store.fashionbizapps.com`) charges SC Prints **~15% above that tier** (observed 2026-05-13 across P400MS/BP2616MS/BP2610MS/P515MS, ratios 1.1505/1.1498/1.1498/1.1541). Production should set this to `1.15` so the retail ladder is calculated from the cost we'll actually be billed. | `1.0` (no adjustment — undercharges by ~15% if left at default) |

| `AUSSIE_PACIFIC_API_TOKEN` | Optional. Aussie Pacific Public API v1 bearer token (Authorization: `Bearer <token>`). Required to enable the AP importer + daily stock sync + dropship-order send. When unset, the AP module is not registered and the cron is a no-op. | unset |
| `AUSSIE_PACIFIC_BASE_URL` | Optional. Aussie Pacific API base URL — only override for staging or proxy. | `https://api.aussiepacific.com.au` |
| `AUSSIE_PACIFIC_COST_ADJUSTMENT` | Multiplier applied to the API `price` field before it's fed into the bulk-price ladder. We currently assume AP's `price` is ex-GST cost (same convention as AS Colour and the FashionBiz "1-99" tier), so default is `1.0`. Calibrate against the first real invoice — if AP returns inc-GST prices, set `0.909`; if AP's published price sits below the trade rate (like FashionBiz's distributor storefront), set the observed ratio. The first 5 styles emit a calibration log line during import so the operator can sanity-check before scaling up. | `1.0` |
| `AUSSIE_PACIFIC_DEFAULT_SHIPPING_METHOD` | Optional. Default shipping method embedded in dropship order payloads. Falls back to the form input on the admin widget when unset. | unset |

All other env vars (Medusa, MinIO, Resend, AS Colour, ShipStation, Stripe, etc.) are documented in [backend/src/lib/constants.ts](backend/src/lib/constants.ts).

### Storefront (`storefront/.env`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_VECTORIZATION_VARIANT_ID` | Variant ID of the vectorization service product. Without it, the modal still works but the service line isn't auto-added — your team adds it via Order Edit. |
| `NEXT_PUBLIC_VECTORIZATION_DISPLAY_PRICE` | Optional. Free-form string (e.g. `$15`) shown in the modal CTA copy. |

## First-time setup checklist

1. `cd backend && pnpm install && cd ../storefront && pnpm install`
2. **Run the designs migration**: `cd backend && npx medusa db:migrate` — creates the `design` table for Phase 2.
3. **Sync module links**: `cd backend && npx medusa db:sync-links` — materialises the customer↔design link table.
4. **Create the vectorization service product** in Medusa admin (Phase 4):
   - Title: "Artwork Vectorization Service"
   - Make it digital (no shipping, no inventory)
   - Hide from storefront catalog (tag it `internal` or whatever convention you use)
   - Set price (e.g. $15 AUD)
   - Copy the **variant ID** (not product ID) into `NEXT_PUBLIC_VECTORIZATION_VARIANT_ID`
5. Add the new env vars from the table above.
6. Restart both apps.

## SEO analytics page (GSC + GA4)

Admin sidebar entry at `/app/seo-analytics` showing 28-day Search Console + GA4 metrics. Service-account auth (read-only). A daily cron pulls metrics into the container cache (48h TTL) so the page loads instantly; a "Refresh now" button re-runs the same workload on demand.

| Component | Path |
| --- | --- |
| Service code (auth, GSC client, GA4 client, summary builder, cache) | [backend/src/services/seo-analytics/](backend/src/services/seo-analytics/) |
| Daily cron (`schedule: "0 5 * * *"`) | [backend/src/jobs/refresh-seo-analytics.ts](backend/src/jobs/refresh-seo-analytics.ts) |
| Admin GET / POST refresh | [backend/src/api/admin/seo-analytics/route.ts](backend/src/api/admin/seo-analytics/route.ts) + [refresh/route.ts](backend/src/api/admin/seo-analytics/refresh/route.ts) |
| Admin page | [backend/src/admin/routes/seo-analytics/page.tsx](backend/src/admin/routes/seo-analytics/page.tsx) |

If `GOOGLE_SERVICE_ACCOUNT_JSON` is unset the cron and routes no-op silently — dev environments without Google credentials still boot.

## Catalog importers

### AS Colour API importer + hourly inventory sync

Pulls every AS Colour style + variant from their authenticated catalog API, creates Medusa products with bulk-pricing metadata, links each to the AS Colour `Brand`, and refreshes stock at the "AS Colour Warehouse" stock location every hour via a delta query.

| Component | Path |
| --- | --- |
| Module (client + service + types + pricing wrapper) | [backend/src/modules/ascolour/](backend/src/modules/ascolour/) |
| Initial import script | [backend/src/scripts/import-as-colour-from-api.ts](backend/src/scripts/import-as-colour-from-api.ts) |
| Hourly stock sync job | [backend/src/jobs/sync-ascolour-inventory.ts](backend/src/jobs/sync-ascolour-inventory.ts) |
| Shared price ladder | [backend/src/utils/bulk-price-ladder.ts](backend/src/utils/bulk-price-ladder.ts) |

Run the initial import with `pnpm --filter backend medusa exec import-as-colour-from-api` (env vars: `IMPORT_LIMIT`, `IMPORT_DRY_RUN`, `IMPORT_INCLUDE_DISCONTINUED`).

**Discontinued styles**: AS Colour appends `"S"` to a `styleCode` to mark it as superseded/discontinued (verified empirically — 22% of their catalog ends in `S` and 75 of those have a paired non-S base still in the catalog). The importer **skips** styleCodes ending in `S` by default. Set `IMPORT_INCLUDE_DISCONTINUED=1` to bypass for one-off historical imports. For already-imported discontinued products in production, soft-disable them (status→draft + add "Discontinued" tag, preserving order history) via [cleanup-ascolour-discontinued.ts](backend/src/scripts/cleanup-ascolour-discontinued.ts).

### FashionBiz API importer + daily inventory sync

Same pattern as AS Colour, for the FashionBiz family (Biz Collection, Biz Care, Biz Corporates, Syzmik — Good-Mates deferred). Hits the public v3 API at `fashionbizapis.com/api/v3/` with `Authorization: Token <FASHIONBIZ_API_TOKEN>`. Products land linked to their respective `Brand` entities (already seeded under the `FashionBiz` parent). Stock refreshes nightly at 04:00 UTC via the "FashionBiz Warehouse" stock location.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/fashionbiz/](backend/src/modules/fashionbiz/) |
| Initial import script | [backend/src/scripts/import-fashionbiz-from-api.ts](backend/src/scripts/import-fashionbiz-from-api.ts) |
| Daily stock sync job (`0 4 * * *`) | [backend/src/jobs/sync-fashionbiz-inventory.ts](backend/src/jobs/sync-fashionbiz-inventory.ts) |
| Pure mapping helpers | [backend/src/modules/fashionbiz/mapping.ts](backend/src/modules/fashionbiz/mapping.ts) |
| Pricing wrapper (delegates to shared ladder) | [backend/src/modules/fashionbiz/pricing.ts](backend/src/modules/fashionbiz/pricing.ts) |

Run the initial import with:

```bash
IMPORT_BRANDS=biz-collection IMPORT_LIMIT=5 \
  pnpm --filter backend medusa exec import-fashionbiz-from-api
```

Env vars: `IMPORT_LIMIT` (per-brand cap), `IMPORT_DRY_RUN=1` (no DB writes), `IMPORT_BRANDS` (comma-separated subset; default is all four).

**Pricing**: the FashionBiz `prices` array carries three wholesale tiers (`1-99`, `100-499`, `500`). The importer treats `prices[0].price` (the 1-99 tier) as the supplier cost, multiplies by `FASHIONBIZ_COST_ADJUSTMENT` (default 1.0, production should be `1.15` — see env var table), then runs the result through the shared `buildPriceLadder()` markup formula. Same ladder shape as AS Colour, so storefront tier-pricing rendering "just works". The raw 3-tier wholesale array and the adjustment factor that was applied are preserved in `variant.metadata.raw_prices` and `variant.metadata.cost_adjustment` for audit.

The adjustment exists because the public-API "1-99" tier is a *published* price; FashionBiz's distributor storefront charges customers ~15% above that for trade pricing. Without the multiplier the storefront retail ladder underprices garments by ~15% relative to actual cost.

**Idempotency**: create-only, keyed by handle (`{brand}-{slug}`, e.g. `biz-collection-p400ms`). Existing handles are skipped — re-importing to update is a planned follow-up.

**Stock**: lives at a separate `"FashionBiz Warehouse"` stock location, parallel to `"AS Colour Warehouse"`, so per-supplier stock provenance is preserved. The daily job walks every variant whose `metadata.fashionbiz.product_slug` is set, groups by `(brand, slug, colour)`, and calls one `/stock` endpoint per group (FashionBiz has no `updated_at` filter, so a full sweep is required).

### Aussie Pacific API importer + daily inventory sync + dropship send

Same pattern as FashionBiz, for the Aussie Pacific catalog. Hits `https://api.aussiepacific.com.au/api/v1/` with `Authorization: Bearer <AUSSIE_PACIFIC_API_TOKEN>`. Products land linked to the pre-seeded `Aussie Pacific` Brand (`external_code = "AP"`). Stock refreshes daily at 05:00 UTC at the "Aussie Pacific Warehouse" stock location. Admins can forward AP-line orders to AP's dropship endpoint from the order detail page or the "Aussie Pacific Orders" admin dashboard.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/aussiepacific/](backend/src/modules/aussiepacific/) |
| Initial import script | [backend/src/scripts/import-aussie-pacific-from-api.ts](backend/src/scripts/import-aussie-pacific-from-api.ts) |
| Daily stock sync job (`0 5 * * *`) | [backend/src/jobs/sync-aussie-pacific-inventory.ts](backend/src/jobs/sync-aussie-pacific-inventory.ts) |
| Status-mapping lib | [backend/src/lib/aussiepacific-status.ts](backend/src/lib/aussiepacific-status.ts) |
| Send-to-AP admin route | [backend/src/api/admin/orders/\[id\]/send-to-aussie-pacific/route.ts](backend/src/api/admin/orders/[id]/send-to-aussie-pacific/route.ts) |
| Order-detail widget | [backend/src/admin/widgets/order-aussie-pacific-dropship.tsx](backend/src/admin/widgets/order-aussie-pacific-dropship.tsx) |
| Dropship dashboard data | [backend/src/api/admin/dropship/aussie-pacific/route.ts](backend/src/api/admin/dropship/aussie-pacific/route.ts) |
| Dropship dashboard page | [backend/src/admin/routes/dropship/aussie-pacific/page.tsx](backend/src/admin/routes/dropship/aussie-pacific/page.tsx) |

Run the initial import with:

```bash
IMPORT_LIMIT=5 IMPORT_DRY_RUN=1 \
  pnpm --filter backend medusa exec import-aussie-pacific-from-api
```

Env vars: `IMPORT_LIMIT` (cap product count), `IMPORT_DRY_RUN=1` (no DB writes).

**Pricing**: AP returns a single wholesale `price` per variant. The importer treats this as ex-GST cost, multiplies by `AUSSIE_PACIFIC_COST_ADJUSTMENT` (default 1.0), then runs the result through the shared `buildPriceLadder()` markup formula. Per-variant pricing matters here — like AS Colour, the API's per-SKU cost can vary across a style, so each variant gets its own ladder and the cheapest variant's ladder is stored as the product-level `bulk_pricing` metadata. The first 5 styles of each import log a calibration line so the operator can spot-check the ex-GST assumption against AP's invoices before going wide.

**Idempotency**: create-only, keyed by handle (`aussie-pacific-{style_code}`, e.g. `aussie-pacific-1300`). Existing handles are skipped. Re-importing to update is a planned follow-up.

**Run-out items**: products with `run_out === true` are **skipped entirely** at import time (logged once per skipped style). Same policy as FashionBiz's `sales_status === "clearance"`. AS Colour has no documented discontinued field yet — run `probe-ascolour-product-shape.ts` to discover one.

**Tagging**: AP's `style` field carries a range/collection name (Bayview, Botany, …) that's already in the product title, so it's **not** surfaced as a tag. `main_category` is treated as a demographic (Ladies → Women, Mens → Men, Kids → Kids, Unisex → Unisex). `sub_category` is the primary source of the Medusa `product_type` (e.g. "Shirts", "Polos"); strict alias matching is used so unknown values resolve to `null` rather than leaking demographic strings like "Ladies" through as a Type.

**Stock**: lives at a separate `"Aussie Pacific Warehouse"` stock location. AP exposes no `updated_at` filter — the daily job walks every page of `/api/v1/products?include=variants` and rebuilds the full SKU → quantity map. Stock is embedded on variants (single `stock_level` field), so one paginated catalog walk delivers everything.

**Dropship**: AP's API documents `POST /api/v1/order` but exposes **no GET endpoint for order retrieval, no shipment/tracking endpoints, and no webhooks**. The admin widget submits the order and records whatever response AP returns (typically just a reference + "Submitted" status). Operators reconcile shipment progress via AP email confirmations or the distributor portal until AP adds a status endpoint. The status-mapping lib + reserved metadata fields (`aussiepacific_last_synced_at`, `aussiepacific_shipments`) are in place so a polling cron can be added later without touching the create flow.

**Workshop "ship-to" address**: AP dropships reuse the existing `ASCOLOUR_WORKSHOP_*` env vars (same physical SC Prints address). If AP ever needs a different destination, introduce `AUSSIE_PACIFIC_WORKSHOP_*` overrides at that point.

## Tests

- **Backend**: `cd backend && pnpm test` — Jest with `@swc/jest`. Existing tests in `src/services/customizer-render/__tests__/` and `src/lib/__tests__/`.
- **Storefront**: `cd storefront && pnpm test` — Jest with `@swc/jest`. Test files colocated as `*.spec.ts` next to source.
- **Sync check**: `pnpm check-production-stage-sync` from repo root.
- **E2E**: `cd storefront && pnpm test-e2e` — Playwright.

Tests written for the four-phase work:
- [storefront/src/modules/customizer/lib/dpi.spec.ts](storefront/src/modules/customizer/lib/dpi.spec.ts) — DPI math + thresholds
- [storefront/src/modules/customizer/lib/build-metadata.spec.ts](storefront/src/modules/customizer/lib/build-metadata.spec.ts) — `CustomizerMetadata` builder helper
- [backend/src/lib/__tests__/production-stage.spec.ts](backend/src/lib/__tests__/production-stage.spec.ts) — Stage list, milestone mapping, email triggers
- [backend/src/api/admin/orders/[id]/production-stage/__tests__/route.spec.ts](backend/src/api/admin/orders/[id]/production-stage/__tests__/route.spec.ts) — Stage-update route handler (mocked scope)

## Key conventions

### Production-stage sync (Phase 1)
Backend = canonical. Edit `backend/src/lib/production-stage.ts` first, then mirror to `storefront/src/modules/order/lib/production-stage.ts`. Run `pnpm check-production-stage-sync` to validate. Wire the script into CI to enforce.

### `CustomizerMetadata` is the cart/design payload (Phases 2-4)
Defined in [storefront/src/modules/customizer/lib/types.ts](storefront/src/modules/customizer/lib/types.ts). Carries `version: 2`, `type: "fabric_customizer"`, side layouts, print area, sizes, pricing, artifacts, optional vectorization flag. Built via `buildCustomizerMetadataBase()` in [storefront/src/modules/customizer/lib/build-metadata.ts](storefront/src/modules/customizer/lib/build-metadata.ts) — use this single helper for any new flow that creates this shape; don't inline-build.

### Admin widget injection zones
- `order.details.after` (main column, below order details): production stage tracker, customizer downloads
- `order.details.side.after` (right column): shipping decision, vectorization flag
- Multiple widgets in the same zone stack vertically.

### Auth on store routes
Store routes under `/store/customers/me/*` are auto-protected by Medusa's core `authenticate("customer", ["session", "bearer"])` middleware. Inside the route, read the customer ID via `req.auth_context.actor_id`. Treat cross-customer lookups as 404 (not 403) so customer IDs aren't enumerable.

### Server-side rendering for print files
The `customizer-render` service ([backend/src/services/customizer-render/](backend/src/services/customizer-render/)) handles all print/mockup PNG generation via Sharp. Do **not** generate high-res print files in the browser — it crashes mobile Safari and exposes source assets.

## Known issues (deferred bugs from the Phase 1-4 audit)

All audit items from the original review have been resolved. See "Fixed" below for the history.

### Fixed (kept here for context)
- ✅ **Logged-in customers' orders weren't appearing on `/account/orders`** — the storefront was creating carts without auth headers, so carts (and the orders they became) had `customer_id = null`. Three places now associate the customer:
  1. [`getOrSetCart`](storefront/src/lib/data/cart.ts) creates new carts with auth headers, AND auto-transfers any existing guest cart to the logged-in customer on next access (uses `sdk.store.cart.transferCart`).
  2. [`login`](storefront/src/lib/data/customer.ts) calls `transferGuestCartToCustomer()` immediately after token persistence.
  3. [`signup`](storefront/src/lib/data/customer.ts) does the same after the post-register login.

  **Existing orders placed before this fix are orphaned** — they have email but no `customer_id`, so they remain invisible to `/account/orders`. To recover them, run a one-shot backend script that updates `order.customer_id` based on email match (Medusa data plumbing; not auto-included in this fix).
- ✅ **Vectorization charged twice on double "Add to cart"** — `addCustomizedToCart` now probes the cart for an existing line with `metadata.vectorization_for_order: true` before adding. On cart-fetch failure it defaults to "skip add" so a transient error never causes a double-charge.
- ✅ **Remove button stranded a cart line** — the in-customizer "Remove" on the vectorization banner now calls `handleRemoveVectorization()`, which deletes any matching cart line via `deleteLineItem`. Surfaces an error if the cart-side cleanup fails so the customer can verify before checkout.
- ✅ **Initial orders showed no tracker** — new subscriber [order-placed-stamp-production-stage.ts](backend/src/subscribers/order-placed-stamp-production-stage.ts) auto-stamps `production_stage = "received"` on every new order. Idempotent (skips if a stage is already set).
- ✅ **Stage rollback re-emailed the customer** — extracted `shouldEmailForStageTransition(from, to)` in [production-stage.ts](backend/src/lib/production-stage.ts) and call it from the subscriber. Suppresses the email when the new stage is at or earlier than the previous in the canonical ordering. Forward re-entry after a rollback (e.g. awaiting_approval → in_production for a second time) still emails since each forward step is a real progression.
- ✅ **Hydration lost the original active side** — `activeSide` is now persisted in [`CustomizerMetadata`](storefront/src/modules/customizer/lib/types.ts) by `buildCustomizerMetadataBase()` (both save-design and cart-add paths). The rehydration effect in the customizer template restores it before calling `loadSide()`, so reopening a back-of-hoodie design lands the user on the back, not the front.

## Operational notes

- **MinIO retention is load-bearing for re-order.** If lifecycle policies GC `customer_original_files` URLs, re-order will display fine but **add-to-cart will fail to re-render print PNGs**. Set retention to indefinite for these objects, or move them to a permanent bucket on order placement.
- **Customizer template size** ([storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx)) is ~3700 lines. New canvas-related work should consider whether it can live in a separate component before adding to this file.
- **Hand-written migration**: the Phase 2 migration ([Migration20260507000000.ts](backend/src/modules/designs/migrations/Migration20260507000000.ts)) was hand-written to match what `npx medusa db:generate designs` produces. If you'd rather have the auto-generated one, delete it and run the generator before `db:migrate`.
- **Production boot auto-migrates.** The backend `start` script in [backend/package.json](backend/package.json) is `init-backend && cd .medusa/server && npx medusa db:migrate && npx medusa db:sync-links && npx medusa start --verbose`. Both DB ops are idempotent and safe to run from every replica (workers included) — Mikro-ORM holds an advisory lock during migrate, so concurrent boots serialise. **Do not remove the `db:migrate` / `db:sync-links` calls** — without them, any Medusa minor that ships schema changes will silently break prod.

## Upgrading Medusa — runbook

The original `init-backend` script (from `medusajs-launch-utils`) only seeds + migrates on the **first** deploy (it gates on the `user` table existing). On every subsequent boot it logs "Database is already seeded. Skipping seeding." and never runs migrations. That's why the start script above runs `db:migrate` explicitly. If you change the boot sequence, preserve that.

**Before bumping Medusa:**

1. **Read the release notes** for every minor between current and target. Look for "breaking changes", new entities/columns, and `migrations/Migration*.ts` additions in the medusajs/medusa repo (`git log --oneline <current-tag>..<target-tag> -- '**/migrations/Migration*.ts'`). 18+ migrations shipped between 2.12.1 and 2.14.2 — that's normal for a two-minor jump.
2. **Check the Medusa peer-deps** for the new version against your installed `@medusajs/ui`, `@medusajs/admin-sdk`, `@medusajs/icons`, etc. Bump them in lockstep.
3. **Inspect `pnpm.patchedDependencies` in [backend/package.json](backend/package.json).** Any patch is pinned to a specific version (`@medusajs/dashboard@2.12.1` style). The bump invalidates it — you must either confirm the fixes are upstream or regenerate the patch via `pnpm patch @medusajs/dashboard@<new-version>`. If you skip this step, `pnpm install` fails with `ERR_PNPM_PATCH_NOT_APPLIED`.

**Verifying the bump locally (preflight):**

1. `cd backend && pnpm install` — must complete without `ERR_PNPM_PATCH_NOT_APPLIED`.
2. `cd backend && pnpm run build` — runs `npx medusa build && node src/scripts/postBuild.js`. **This is the production build path; do not substitute `pnpm exec medusa build` alone — that skips `postBuild.js` and won't catch all class-of-error.** Needs `DATABASE_URL` set (a placeholder works, no real DB connection happens during build).
3. `cd backend && pnpm test` — known-failing tests are documented above; new failures = regressions.
4. `cd storefront && pnpm install && pnpm run build` — catches Next.js / React server-only-import errors that `tsc --noEmit` cannot. The storefront's `next.config.js` has `typescript.ignoreBuildErrors: true`, so a successful Next build proves the runtime composition works (server/client component boundaries, dynamic imports, etc.).
5. **Sanity-check migrations against your prod schema** — if you have a staging environment, deploy there first and watch logs for `running migration <name>` lines.

**During / after deploy:**

- The backend boot will run pending migrations automatically (per the `start` script). Watch the Railway log for `Performing migration` lines.
- If a migration fails, the boot fails and Railway will retry. Decide quickly whether to roll back the deploy or fix forward — every retry holds the migration lock briefly and blocks workers.
- Smoke-test the admin (products list, product detail, "edit sales channels" modal) and a sample PDP on the storefront before declaring the deploy healthy.

## Server / client component pattern (App Router)

When a PDP variant or other view is a client component (`"use client"`) but needs server-fetched data, **render the server piece in the parent and pass it as a slot prop** — never `import` server-only modules into the client component. Reference implementation: [storefront/src/modules/customizer/components/embedded-product-customizer.tsx](storefront/src/modules/customizer/components/embedded-product-customizer.tsx) accepts an optional `integratedPdpSlots: { gallery: ReactNode; variantPickers: ReactNode }` prop; the parent server component composes those nodes from server-side data and hands them in. This avoids the "you're importing a Server Component into a Client Component" build failure that bites at deploy time, not in dev. New PDP templates (e.g. embroidery-only, sticker-only) should follow the same pattern.

## Customizer wizard architecture

The customizer lives in one large file: [storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx) (~3700 lines). Understanding the two rendering modes and the wizard state machine is essential before editing it.

### Two rendering modes

| Mode | Trigger | Layout |
|------|---------|--------|
| **Standalone** | `/customizer?product=<handle>` | Canvas left (flex-1), wizard sidebar right (`minmax(300px,420px)`) |
| **Embedded PDP** | `embedded={true}` prop from `EmbeddedProductCustomizer` | Canvas + editor column on left (`lg:col-span-6`), wizard steps column on right (`lg:col-span-3`) within the PDP grid |

The `embedded` prop and `integratedPdpSlots` distinguish the two modes throughout the render. Most canvas logic is shared; only the outer layout grid and step-header rendering differ.

### Wizard step state machine

Four steps controlled by `pdpStep: 1 | 2 | 3 | 4` and per-step done flags:

```
pdpStep  done flag       Step
  1      pdpStep1Done    PRODUCT OPTIONS (colour/variant)
  2      pdpStep2Done    ADD / CHANGE PRINT POSITIONS (side tabs)
  3      pdpStep3Done    PRINT SIZE (A6 / A4 / A3 / Oversize)
  4      —               QUANTITY & CHECKOUT
```

- `pdpStep` = the currently active (expanded) step.
- A step shows its full UI when `pdpStep === stepNumber`.
- When `pdpStep > stepNumber && stepNDone === true`, the step collapses to a summary header with a "Change" link (`onClick={() => setPdpStep(N)}`).
- When `pdpStep < stepNumber`, the step renders as a dimmed `StepPreview` card.

**Critical**: `pdpStep3Done` is a single boolean shared across all print locations. Once any location gets a size, Step 3 is considered done for every subsequent location. If you need per-location size tracking, this is the flag to replace with a `Record<GarmentSide, PrintSize | null>` map.

### Multi-side (print location) flow

- `currentSide: GarmentSide` — whichever side the canvas is currently showing.
- `sideLayoutsRef` — a `useRef` map of `GarmentSide → Fabric.js JSON`. Saving/loading a side serialises/deserialises the canvas into this ref without a re-render.
- `switchSide(side)` — saves the current canvas to `sideLayoutsRef`, then loads the target side's JSON.
- `allowedPrintSides` — derived from `product.metadata.print_sides`; controls which tabs appear in `SideSelector`.
- `decoratedSides` — sides that have at least one Fabric object. Used to show ✓ on tabs and to build `CustomizerMetadata` at cart-add time.

### Key sub-components

| Component | File | Purpose |
|-----------|------|---------|
| `SideSelector` | `components/side-selector.tsx` | Tab row (Front / Back / Left Sleeve…); calls `onSelectSide` on click |
| `DesignPreviewPopover` | `components/design-preview-popover.tsx` | Pink "Preview design N" pill; shows per-side mockup thumbnails |
| `InputPanel` | `components/input-panel.tsx` | Left-side "Add to design" panel — file upload, text, "My uploads" |
| `PricingPanel` | `components/pricing-panel.tsx` | Bulk discount table + unit price calculation |
| `EmbeddedProductCustomizer` | `components/embedded-product-customizer.tsx` | Server→client bridge for the PDP; passes `integratedPdpSlots` in |

### Canvas ↔ wizard data flow

1. Customer places artwork → Fabric.js fires `object:added/modified` → `onCanvasModified` updates `sideLayoutsRef` and recalculates `decoratedSides`.
2. Customer picks a print size in Step 3 → `setSelectedPrintArea(area)` + `setPdpStep3Done(true)`.
3. "Add to cart" → `buildCustomizerMetadataBase()` serialises all sides from `sideLayoutsRef` + `selectedPrintArea` + `activeSide` into a `CustomizerMetadata` v2 object, which is stored on the cart line's `metadata`.
