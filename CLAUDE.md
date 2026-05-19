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

## Customer-facing features beyond Phase 1-4

These layer on top of the Phase 1-4 portal. Most have their own module + migration; some are presentation-only and read from existing data.

### Artwork approval (HMAC-signed customer review)
After Phase 1's `awaiting_approval` stage email goes out, the customer follows an HMAC-signed link to `/[countryCode]/artwork-approval/[orderId]` to see mockups and approve or request changes. Approval auto-advances `production_stage`.

| Component | Path |
| --- | --- |
| Sign + verify helper | [backend/src/services/artwork-approval/sign.ts](backend/src/services/artwork-approval/sign.ts) |
| Store route | [backend/src/api/store/artwork-approval/route.ts](backend/src/api/store/artwork-approval/route.ts) |
| Subscriber that emails the link | [backend/src/subscribers/order-artwork-stage-changed.ts](backend/src/subscribers/order-artwork-stage-changed.ts) |
| Email template | [backend/src/modules/email-notifications/templates/artwork-approval.tsx](backend/src/modules/email-notifications/templates/artwork-approval.tsx) |
| Storefront page | [storefront/src/app/[countryCode]/(main)/artwork-approval/[orderId]/page.tsx](storefront/src/app/[countryCode]/(main)/artwork-approval/[orderId]/page.tsx) |
| Storefront components | [storefront/src/modules/artwork-approval/](storefront/src/modules/artwork-approval/) |

**Secret reuse**: links are signed with `NPS_LINK_SECRET` (same env var as NPS — same threat model: short-lived signed URLs). Signature is truncated to 24 hex chars but timing-safe.

### NPS feedback loop (post-delivery)
Email customers a 1-5 rating prompt N days after `delivered`. Score + comment land on `order.metadata.nps_*`; the admin order page surfaces them.

| Component | Path |
| --- | --- |
| Daily job (`0 22 * * *`) | [backend/src/jobs/send-nps-requests.ts](backend/src/jobs/send-nps-requests.ts) |
| Candidate builder + sender + signer | [backend/src/services/nps-requests/](backend/src/services/nps-requests/) |
| Email template | [backend/src/modules/email-notifications/templates/nps-request.tsx](backend/src/modules/email-notifications/templates/nps-request.tsx) |
| Store record route | [backend/src/api/store/nps/route.ts](backend/src/api/store/nps/route.ts) |
| Storefront thanks page | [storefront/src/app/[countryCode]/(main)/nps/page.tsx](storefront/src/app/[countryCode]/(main)/nps/page.tsx) |
| Admin widget | [backend/src/admin/widgets/order-nps.tsx](backend/src/admin/widgets/order-nps.tsx) |

**Env gate**: `NPS_REQUESTS_ENABLED=true`. **Tuning**: `NPS_REQUEST_DAYS_AFTER_DELIVERED` (default 14), `NPS_MIN_GAP_DAYS_PER_CUSTOMER` (default 90), `NPS_MAX_SENDS_PER_RUN` (default 25). **Idempotency**: stamped on `order.metadata.nps_request_sent_at` and `customer.metadata.last_nps_request_sent_at`.

### Wishlist
Customers bookmark products from PDP and revisit them at `/account/wishlist`. Supports optional variant selection + notes.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/wishlist/](backend/src/modules/wishlist/) |
| Migration | [backend/src/modules/wishlist/migrations/Migration20260616000000.ts](backend/src/modules/wishlist/migrations/Migration20260616000000.ts) |
| Module Link customer↔wishlist | [backend/src/links/customer-wishlist.ts](backend/src/links/customer-wishlist.ts) |
| Store CRUD routes | [backend/src/api/store/customers/me/wishlist/route.ts](backend/src/api/store/customers/me/wishlist/route.ts) + `[id]/route.ts` |
| Storefront data layer | [storefront/src/lib/data/wishlist.ts](storefront/src/lib/data/wishlist.ts) |
| Account page | [storefront/src/app/[countryCode]/(main)/account/@dashboard/wishlist/page.tsx](storefront/src/app/[countryCode]/(main)/account/@dashboard/wishlist/page.tsx) |
| Grid component | [storefront/src/modules/account/components/wishlist-grid/index.tsx](storefront/src/modules/account/components/wishlist-grid/index.tsx) |

`customer_id` + `product_id` denormalised on the row (indexed for fast list/check), plus a Module Link for admin graph queries. POST returns `duplicate: true` if the item is already wishlisted.

### Bundles (curated multi-product gift sets)
Admin curates bundles (e.g. "Coach Starter Pack"); storefront displays them at `/bundles/[handle]` with a wizard.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/bundles/](backend/src/modules/bundles/) |
| Migration | [backend/src/modules/bundles/migrations/Migration20260515000000.ts](backend/src/modules/bundles/migrations/Migration20260515000000.ts) |
| Admin REST | [backend/src/api/admin/bundles/](backend/src/api/admin/bundles/) |
| Store REST | [backend/src/api/store/bundles/](backend/src/api/store/bundles/) |
| Admin CRUD page | [backend/src/admin/routes/bundles/page.tsx](backend/src/admin/routes/bundles/page.tsx) |
| Storefront UI | [storefront/src/modules/bundles/](storefront/src/modules/bundles/) |
| Storefront page | [storefront/src/app/[countryCode]/(main)/bundles/[handle]/page.tsx](storefront/src/app/[countryCode]/(main)/bundles/[handle]/page.tsx) |

**Key choice**: bundle items reference products by `handle`, not `product_id` — survives re-imports without manual relink. Unique constraint on bundle `handle`.

### Lookbook (social-proof gallery)
Tag-filterable masonry grid of past client jobs at `/lookbook`. Staff curate via admin.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/lookbook/](backend/src/modules/lookbook/) |
| Migration | [backend/src/modules/lookbook/migrations/Migration20260623000000.ts](backend/src/modules/lookbook/migrations/Migration20260623000000.ts) |
| Admin REST | [backend/src/api/admin/lookbook/](backend/src/api/admin/lookbook/) |
| Store REST | [backend/src/api/store/lookbook/](backend/src/api/store/lookbook/) |
| Admin CRUD page | [backend/src/admin/routes/lookbook/page.tsx](backend/src/admin/routes/lookbook/page.tsx) |
| Combined dashboard (studio + lookbook) | [backend/src/admin/routes/studio-and-lookbook/page.tsx](backend/src/admin/routes/studio-and-lookbook/page.tsx) |
| Storefront page | [storefront/src/app/[countryCode]/(main)/lookbook/page.tsx](storefront/src/app/[countryCode]/(main)/lookbook/page.tsx) |

Sort by `weight` ascending; `is_published = false` hides from storefront.

### Group orders (team / club bulk buys)
A customer creates a "group order" off a base product + design, shares a public token, and parents/players submit individual sizes. The owner closes the order; the converter builds one cart with line items per participant.

| Component | Path |
| --- | --- |
| Module + models | [backend/src/modules/group-order/](backend/src/modules/group-order/) |
| Migration | [backend/src/modules/group-order/migrations/Migration20260621000000.ts](backend/src/modules/group-order/migrations/Migration20260621000000.ts) |
| Store create + roster + status | [backend/src/api/store/group-orders/](backend/src/api/store/group-orders/) + [me/group-orders/[id]/status/route.ts](backend/src/api/store/customers/me/group-orders/[id]/status/route.ts) |
| Convert-to-cart (idempotent) | [backend/src/api/store/customers/me/group-orders/[id]/convert-to-cart/route.ts](backend/src/api/store/customers/me/group-orders/[id]/convert-to-cart/route.ts) |
| Public join page | [storefront/src/app/[countryCode]/(main)/group-order/[token]/page.tsx](storefront/src/app/[countryCode]/(main)/group-order/[token]/page.tsx) |
| Account list | [storefront/src/app/[countryCode]/(main)/account/@dashboard/group-orders/page.tsx](storefront/src/app/[countryCode]/(main)/account/@dashboard/group-orders/page.tsx) |
| Create-from-design | [storefront/src/app/[countryCode]/(main)/account/@dashboard/designs/[id]/group-order/page.tsx](storefront/src/app/[countryCode]/(main)/account/@dashboard/designs/[id]/group-order/page.tsx) |
| Storefront components | [storefront/src/modules/group-order/](storefront/src/modules/group-order/) |

**Size matching**: participants type free-text size labels (e.g. "Mens Large"); the converter matches case-insensitively against variant titles/options. Mismatches are skipped and reported back to the owner — coaches don't need to know SKUs. **Idempotency**: re-calling convert-to-cart returns the existing cart if `metadata.cart_id` is set.

### Organisations (schools, clubs, businesses)
Top-level grouping of customers. Members have a role (owner / purchaser / viewer). Tax-exempt + default pricing tier are properties of the org.

| Component | Path |
| --- | --- |
| Module + models | [backend/src/modules/organisation/](backend/src/modules/organisation/) |
| Migration | [backend/src/modules/organisation/migrations/Migration20260624000000.ts](backend/src/modules/organisation/migrations/Migration20260624000000.ts) |
| Admin REST | [backend/src/api/admin/organisations/](backend/src/api/admin/organisations/) |
| Admin CRUD page | [backend/src/admin/routes/organisations/page.tsx](backend/src/admin/routes/organisations/page.tsx) |
| Account page | [storefront/src/app/[countryCode]/(main)/account/@dashboard/organisations/page.tsx](storefront/src/app/[countryCode]/(main)/account/@dashboard/organisations/page.tsx) |

**Handle**: auto-slugified (lowercased, non-alphanumeric → dashes, deduped). One customer can belong to multiple orgs.

### Quotes (sales pipeline)
Lead capture from BYO + contact form + admin-created leads. Statuses: `new` → `quoted` → `accepted` / `lost` / `expired`. Line items live as JSON until acceptance, then convert to a real Medusa cart via an HMAC-signed customer link.

| Component | Path |
| --- | --- |
| Module + models (`quote` + `quote-event`) | [backend/src/modules/quote/](backend/src/modules/quote/) |
| Migration | [backend/src/modules/quote/migrations/Migration20260618000000.ts](backend/src/modules/quote/migrations/Migration20260618000000.ts) |
| Admin REST | [backend/src/api/admin/quotes/](backend/src/api/admin/quotes/) |
| Store submission | [backend/src/api/store/quotes/route.ts](backend/src/api/store/quotes/route.ts) |
| Accept-link generator | [backend/src/api/admin/quotes/[id]/accept-link/route.ts](backend/src/api/admin/quotes/[id]/accept-link/route.ts) |
| Signing helper | [backend/src/services/quote-accept/sign.ts](backend/src/services/quote-accept/sign.ts) |
| Admin Kanban page | [backend/src/admin/routes/quotes/page.tsx](backend/src/admin/routes/quotes/page.tsx) |
| Customer acceptance page | [storefront/src/app/[countryCode]/(main)/quote-accept/[id]/page.tsx](storefront/src/app/[countryCode]/(main)/quote-accept/[id]/page.tsx) |
| Storefront accept form | [storefront/src/modules/quote-accept/](storefront/src/modules/quote-accept/) |

**Event log**: every status change / assignment / message lands as a `quote_event` row — append-only audit. **Public ID**: ULID last-10 chars upper-cased for shareable refs. **Mood-board uploads**: base64 in POST, soft-fails if upload fails so the quote still creates. **Emails**: triggers `CONTACT_NOTIFICATION_EMAIL` on submission; `SUPPORT_REPLY_TO_EMAIL` is the reply-to. **Secret**: signs accept-links with `NPS_LINK_SECRET`.

### Customer tiers, tax-exempt, applied perks (B2B pricing & invoicing)
Tier system overrides the quantity-ladder with a flat rate via Medusa price-list rules. Tax-exempt + free-shipping perks are snapshotted onto the order at `order.placed` so historical invoices stay correct even if customer state changes later.

| Component | Path |
| --- | --- |
| Tier constants (backend) | [backend/src/lib/customer-tiers.ts](backend/src/lib/customer-tiers.ts) |
| Tier constants (storefront mirror) | [storefront/src/lib/customer-tiers.ts](storefront/src/lib/customer-tiers.ts) |
| Bootstrap script | [backend/src/scripts/seed-customer-tiers.ts](backend/src/scripts/seed-customer-tiers.ts) |
| Tax-exempt snapshot | [backend/src/subscribers/stamp-order-tax-exempt.ts](backend/src/subscribers/stamp-order-tax-exempt.ts) |
| Perks snapshot | [backend/src/subscribers/stamp-order-perks.ts](backend/src/subscribers/stamp-order-perks.ts) |
| Customer-tier widget | [backend/src/admin/widgets/customer-tier.tsx](backend/src/admin/widgets/customer-tier.tsx) |
| Customer tax-exempt widget | [backend/src/admin/widgets/customer-tax-exempt.tsx](backend/src/admin/widgets/customer-tax-exempt.tsx) |
| Customer tags & notes widget | [backend/src/admin/widgets/customer-tags-notes.tsx](backend/src/admin/widgets/customer-tags-notes.tsx) |
| Order applied-perks widget | [backend/src/admin/widgets/order-applied-perks.tsx](backend/src/admin/widgets/order-applied-perks.tsx) |
| Tier regen job (`0 6 * * *`) | [backend/src/jobs/regenerate-tier-prices.ts](backend/src/jobs/regenerate-tier-prices.ts) |

**Tier ladder**: 8 ranks from platinum (1.10×) to member (1.45×). Customers are assigned by adding them to the matching "Tier: X" customer group.

**Free-shipping perks**: `FREE_SHIPPING_TAGS` env var (comma-separated, default `"VIP,Wholesale"`). At `order.placed` the subscriber checks customer tags and stamps `order.metadata.applied_perks.free_shipping = true` if any match — staff manually waive shipping at fulfilment.

**Sync risk**: backend and storefront tier constants must agree. Consider a sync-check script following the production-stage pattern.

### Chatbot (pre-sale AI assistant)
Claude Haiku-powered storefront widget answering decoration/pricing questions. Session-persistent via `sessionStorage`.

| Component | Path |
| --- | --- |
| Widget | [storefront/src/modules/chatbot/components/chat-widget.tsx](storefront/src/modules/chatbot/components/chat-widget.tsx) |
| API proxy | [storefront/src/app/api/chat/route.ts](storefront/src/app/api/chat/route.ts) |
| System prompt | [storefront/src/lib/chatbot/system-prompt.ts](storefront/src/lib/chatbot/system-prompt.ts) |

**Env**: `ANTHROPIC_API_KEY` (route returns 503 if unset). **Model**: `claude-haiku-4-5` with prompt caching (`cache_control: ephemeral`); max 600 output tokens.

**Gotcha**: pricing is hard-coded in the system prompt. Whenever the decoration estimators or pricing-panel change, also update the prompt — there is no shared pricing module the prompt reads from.

### Production ETA (live delivery window)
Computes a customer-facing lead-time range (e.g. "4-7 business days") from current queue depth per stage. Surfaces on PDP.

| Component | Path |
| --- | --- |
| Pure ETA math | [backend/src/services/production-eta/compute-eta.ts](backend/src/services/production-eta/compute-eta.ts) |
| Container wrapper | [backend/src/services/production-eta/get-eta.ts](backend/src/services/production-eta/get-eta.ts) |
| Store route | [backend/src/api/store/production-eta/route.ts](backend/src/api/store/production-eta/route.ts) |
| Storefront fetcher | [storefront/src/lib/data/production-eta.ts](storefront/src/lib/data/production-eta.ts) |

**Config**: all hard-coded in `compute-eta.ts` (baseline days per stage, daily throughput, congestion multiplier `1.4`, min range `2` days, min ETA `4` days). No env overrides yet — promote to env before multi-shop deployments.

### Best Sellers (live top-N)
Live top-selling products query for nav + home rails. Computed on each request from non-cancelled order lines in a rolling window (default 30 days).

| Component | Path |
| --- | --- |
| Store route | [backend/src/api/store/products/top-selling/route.ts](backend/src/api/store/products/top-selling/route.ts) |

**Defensive**: returns 204 on any error so the rail doesn't break the page. Capped at 5000 line items per query — promote to a materialised view if volume exceeds that.

### Shop categories + Industries + Services + Brands menus
Hierarchical mega-menu nav: audience × garment-type (Mens / Womens / Kids / Accessories × T-shirts / Hoodies / Polos / ...). Categories are inferred from product metadata during import; staff override via admin. Industries + Services menus are static-data-driven; Brands menu reads from the Brand module.

| Component | Path |
| --- | --- |
| Category tree + inference helpers | [backend/src/lib/shop-categories.ts](backend/src/lib/shop-categories.ts) |
| One-shot bootstrap | [backend/src/scripts/setup-shop-categories.ts](backend/src/scripts/setup-shop-categories.ts) |
| Storefront category module | [storefront/src/modules/categories/](storefront/src/modules/categories/) |
| Category landing | [storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx](storefront/src/app/[countryCode]/(main)/categories/[...category]/page.tsx) |
| Industries module + pages | [storefront/src/modules/industries/](storefront/src/modules/industries/) + [pages](storefront/src/app/[countryCode]/(main)/industries/) |
| Services data + pages | [storefront/src/modules/services/](storefront/src/modules/services/) + [pages](storefront/src/app/[countryCode]/(main)/services/) |
| Brand menu cards | [storefront/src/modules/brands/components/](storefront/src/modules/brands/components/) |

**Importer wiring**: `ensureCategoryTree()` + `assignCategoriesToProducts()` are called by the AS Colour, FashionBiz, and AP importers — new product imports land in the right categories automatically.

### Decoration estimators (price + rush)
Per-method (screen / DTF / embroidery / UV-DTF) live price + rush calculators. Used on PDP and in the customizer's pricing panel.

| Component | Path |
| --- | --- |
| Storefront estimators | [storefront/src/modules/decoration/](storefront/src/modules/decoration/) |
| Embroidery canvas + stitch estimator | [storefront/src/modules/embroidery/](storefront/src/modules/embroidery/) |
| Backend embroidery pricing | [backend/src/lib/embroidery-pricing.ts](backend/src/lib/embroidery-pricing.ts) |
| Backend DTF pricing | [backend/src/lib/scp-dtf-print-pricing.ts](backend/src/lib/scp-dtf-print-pricing.ts) |
| Cart-decoration serialiser | [storefront/src/lib/util/cart-decorations.ts](storefront/src/lib/util/cart-decorations.ts) |
| DTF gang-sheet builder | [storefront/src/app/[countryCode]/(main)/dtf-builder/page.tsx](storefront/src/app/[countryCode]/(main)/dtf-builder/page.tsx) |
| BYO (bring-your-own garments) | [storefront/src/app/[countryCode]/(main)/byo/page.tsx](storefront/src/app/[countryCode]/(main)/byo/page.tsx) |

**Sync risk**: pricing constants live in TS files on both sides. If you bump a price band, also update the chatbot system prompt and the customizer pricing-panel — three places, no shared source of truth yet.

### Guides (static content pages)
Reference docs (CMYK ↔ DTF colour chart, etc.) live as TS data + page templates.

| Component | Path |
| --- | --- |
| Guides module | [storefront/src/modules/guides/](storefront/src/modules/guides/) |
| Guide pages | [storefront/src/app/[countryCode]/(main)/guides/](storefront/src/app/[countryCode]/(main)/guides/) |

## Point of sale (POS) — walk-in transactions

Admin page at `/app/pos` for in-store walk-in sales. Three-panel layout: product search left, cart middle, customer + payment right. Cash payments mark the order paid immediately; "Card (QR link)" generates a Stripe Payment Link rendered as a QR code for the customer to scan on their phone (reuses the existing payment-link feature). Customizer integration is a popup — clicking "Add custom design" opens the storefront customizer at `/[country]/customizer?pos_session=<id>`, the customizer's "Add to cart" path detects POS mode and POSTs each rendered line to the storefront's `/api/pos-bridge/items` relay, which forwards to the backend's `/store/pos-sessions/:id/items` route. The POS page polls the session every 2s and surfaces new customizer lines in the cart UI.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/pos-session/](backend/src/modules/pos-session/) |
| Migration | [backend/src/modules/pos-session/migrations/Migration20270401000000.ts](backend/src/modules/pos-session/migrations/Migration20270401000000.ts) |
| Checkout service (draft → order + payment) | [backend/src/services/pos-checkout/checkout.ts](backend/src/services/pos-checkout/checkout.ts) |
| Admin REST — sessions CRUD | [backend/src/api/admin/pos/sessions/route.ts](backend/src/api/admin/pos/sessions/route.ts) + [\[id\]/route.ts](backend/src/api/admin/pos/sessions/[id]/route.ts) |
| Admin REST — admin-side item append | [backend/src/api/admin/pos/sessions/\[id\]/items/route.ts](backend/src/api/admin/pos/sessions/[id]/items/route.ts) |
| Admin REST — checkout | [backend/src/api/admin/pos/checkout/route.ts](backend/src/api/admin/pos/checkout/route.ts) |
| Store REST — customizer relay target | [backend/src/api/store/pos-sessions/\[id\]/items/route.ts](backend/src/api/store/pos-sessions/[id]/items/route.ts) |
| Admin POS page | [backend/src/admin/routes/pos/page.tsx](backend/src/admin/routes/pos/page.tsx) |
| Admin POS components | [backend/src/admin/routes/pos/components/](backend/src/admin/routes/pos/components/) |
| Storefront customizer POS-mode hook | [storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx) — search `isPOSMode` |
| Storefront bridge route | [storefront/src/app/api/pos-bridge/items/route.ts](storefront/src/app/api/pos-bridge/items/route.ts) |

**Order shape**: a POS sale lands as a real Medusa order with `metadata.pos_session_id`, `metadata.pos_user_id`, `metadata.payment_method`. Each line item carries `metadata.pos_line_kind = "standard" | "customizer"`. Customizer lines preserve the full `customizerDesign` (`CustomizerMetadata`) shape so all the existing admin widgets (mockup PDF, customizer downloads, print details) work without a POS-specific branch.

**Payment attribution**: cash payments stamp `payment.metadata.real_gateway = "pos_cash"`; card payments inherit `real_gateway = "stripe_payment_link"` via the existing handle-webhook flow. The payment-mix report buckets revenue accordingly.

**Auth on the bridge route**: the storefront `/api/pos-bridge/items` route accepts requests with no auth header — the POS session ID itself is the capability (26-char ULID, 4-hour TTL). Acceptable for an in-store tool: worst case someone guesses a session ID and adds bogus lines, which staff immediately rejects on screen. Promote to a signed bridge-token if POS ever runs on a public guest network.

**Config**: `POS_SESSION_TTL_HOURS` (default 4) controls how long an unfinished session stays "active" before it auto-expires. The customizer popup needs `STOREFRONT_URL` and `STOREFRONT_DEFAULT_COUNTRY_CODE` set on the backend (already required by other flows; surfaced through `/admin/scp-config`).

## Production-floor stack

Operator surfaces beyond the customer-facing production-stage tracker. All live in admin; some surface customer-visible signals via emails or automation rules.

### Print queue (daily job batching)
Groups today's queued orders by decoration method + colour signature to minimise setup changes (screen swaps, thread/ink changes). Operators see the suggested run order on the queue page.

| Component | Path |
| --- | --- |
| Pure batching logic | [backend/src/services/print-queue/build.ts](backend/src/services/print-queue/build.ts) |
| Container wrapper | [backend/src/services/print-queue/get-queue.ts](backend/src/services/print-queue/get-queue.ts) |
| Admin route | [backend/src/api/admin/print-queue/route.ts](backend/src/api/admin/print-queue/route.ts) |
| Admin page | [backend/src/admin/routes/print-queue/page.tsx](backend/src/admin/routes/print-queue/page.tsx) |

Stale orders float to top, tiebreak by `created_at`. Colour signature is normalised (lowercased, sorted, deduped) so the same ink mix on different orders clusters together.

### Print recipes (reusable production specs)
Operators capture step-by-step instructions (ink mix, screen settings, placement guides) linked to product / variant / customer. Shows on the order detail for any order containing the linked SKU.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/print-recipe/](backend/src/modules/print-recipe/) |
| Migration | [backend/src/modules/print-recipe/migrations/Migration20260620000000.ts](backend/src/modules/print-recipe/migrations/Migration20260620000000.ts) |
| Admin REST | [backend/src/api/admin/print-recipes/](backend/src/api/admin/print-recipes/) |
| Admin CRUD page | [backend/src/admin/routes/print-recipes/page.tsx](backend/src/admin/routes/print-recipes/page.tsx) |
| Order-detail widget | [backend/src/admin/widgets/order-print-recipes.tsx](backend/src/admin/widgets/order-print-recipes.tsx) |
| Per-line print notes | [backend/src/admin/widgets/order-line-print-notes.tsx](backend/src/admin/widgets/order-line-print-notes.tsx) |

`recipe_json` is unvalidated JSONB — flexible for per-method variation, no enforced contract.

### Production calendar
Week / month view of orders by upcoming stage transitions. Reads stage-change dates from `order.metadata.production_stage_history`.

| Component | Path |
| --- | --- |
| Admin route | [backend/src/api/admin/production-calendar/route.ts](backend/src/api/admin/production-calendar/route.ts) |
| Admin calendar page | [backend/src/admin/routes/production-calendar/page.tsx](backend/src/admin/routes/production-calendar/page.tsx) |
| Production dashboard (tabs hub) | [backend/src/admin/routes/production/page.tsx](backend/src/admin/routes/production/page.tsx) |

### Production rejects (QC defect log)
Log misprints / defects per order with reason + cost; aggregates show defect rates per supplier brand for trend analysis.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/production-reject/](backend/src/modules/production-reject/) |
| Migration | [backend/src/modules/production-reject/migrations/Migration20260619000000.ts](backend/src/modules/production-reject/migrations/Migration20260619000000.ts) |
| Admin REST | [backend/src/api/admin/production-rejects/](backend/src/api/admin/production-rejects/) |
| Admin report page | [backend/src/admin/routes/production-rejects/page.tsx](backend/src/admin/routes/production-rejects/page.tsx) |
| Order-detail widget | [backend/src/admin/widgets/order-rejects.tsx](backend/src/admin/widgets/order-rejects.tsx) |

### Mockup PDF generator
Customer-facing approval PDF (one page per garment side, sizes table, watermarked mockups, branded header). Built with `pdfkit` + `sharp`; smart background removal.

| Component | Path |
| --- | --- |
| Service | [backend/src/services/mockup-pdf/](backend/src/services/mockup-pdf/) |
| Admin API | [backend/src/api/admin/orders/[id]/mockup-pdf/route.ts](backend/src/api/admin/orders/[id]/mockup-pdf/route.ts) |
| Order-detail download button | [backend/src/admin/widgets/order-customizer-downloads.tsx](backend/src/admin/widgets/order-customizer-downloads.tsx) |
| Brand assets (logo + fonts) | [backend/src/assets/](backend/src/assets/) |

**Background removal**: corner-sampled white detection (threshold ≥220 RGB); edge flood-fill for black. Preserves design black at ≤30 RGB only if background is white. **Image fetch timeout**: 12s per URL; nulls drop silently.

### Order timeline + presence + watchers + stale + photos
Cluster of widgets on the order detail page giving operators a single pane of glass.

| Component | Path |
| --- | --- |
| Timeline aggregator | [backend/src/services/order-timeline/build.ts](backend/src/services/order-timeline/build.ts) |
| Stale-order scanner (`0 8 * * *`) | [backend/src/jobs/scan-stale-orders.ts](backend/src/jobs/scan-stale-orders.ts) |
| Stale scan logic | [backend/src/services/stale-orders/scan.ts](backend/src/services/stale-orders/scan.ts) |
| Timeline widget | [backend/src/admin/widgets/order-timeline.tsx](backend/src/admin/widgets/order-timeline.tsx) |
| Stale badge | [backend/src/admin/widgets/order-stale-badge.tsx](backend/src/admin/widgets/order-stale-badge.tsx) |
| Presence heartbeat (every 20s) | [backend/src/admin/widgets/order-presence-heartbeat.tsx](backend/src/admin/widgets/order-presence-heartbeat.tsx) |
| Watchers (subscribe to changes) | [backend/src/admin/widgets/order-watchers.tsx](backend/src/admin/widgets/order-watchers.tsx) |
| Comments audit | [backend/src/admin/widgets/order-comments-audit.tsx](backend/src/admin/widgets/order-comments-audit.tsx) |
| Arrival watcher (inbound scan) | [backend/src/admin/widgets/order-arrival-watcher.tsx](backend/src/admin/widgets/order-arrival-watcher.tsx) |
| Production photos uploader | [backend/src/admin/widgets/order-production-photos.tsx](backend/src/admin/widgets/order-production-photos.tsx) |
| Customizer downloads (per-line files) | [backend/src/admin/widgets/order-customizer-downloads.tsx](backend/src/admin/widgets/order-customizer-downloads.tsx) |
| Customizer print details | [backend/src/admin/widgets/order-customizer-print-details.tsx](backend/src/admin/widgets/order-customizer-print-details.tsx) |
| Stage audit subscriber | [backend/src/subscribers/order-stage-audit.ts](backend/src/subscribers/order-stage-audit.ts) |

**Stale flag**: env-gated. `STALE_ORDER_ALERTS_ENABLED=true` enables; threshold `STALE_ORDER_THRESHOLD_DAYS` (default 3); optional Slack digest via `SLACK_PRODUCTION_WEBHOOK_URL`.

**Presence heartbeat**: POSTs to `/admin/admin-workspace/presence` every 20s when tab is visible. Powers "X is viewing this order" avatars across tabs.

**Timeline cap**: comments + rejects queries capped at 500 each — large order histories may truncate.

## Customer lifecycle / CRM

Subscriber-driven and cron-driven nudges to keep customers engaged. **Every send-based cron is gated behind an `*_ENABLED=true` flag** so accidental boots don't spam customers.

### Abandoned cart reminders
Daily cron at `15 23 * * *` UTC scans carts in the 6-72h window and sends a single reminder if consent allows. Marks converted on order placement.

| Component | Path |
| --- | --- |
| Daily job (`15 23 * * *`) | [backend/src/jobs/send-abandoned-cart-reminders.ts](backend/src/jobs/send-abandoned-cart-reminders.ts) |
| Send + idempotency | [backend/src/services/abandoned-cart-reminders/](backend/src/services/abandoned-cart-reminders/) |
| Mark-converted subscriber | [backend/src/subscribers/abandoned-cart-mark-converted.ts](backend/src/subscribers/abandoned-cart-mark-converted.ts) |
| Backend ingest route | [backend/src/api/abandoned-cart/route.ts](backend/src/api/abandoned-cart/route.ts) |
| Email template | [backend/src/modules/email-notifications/templates/cart-reminder.tsx](backend/src/modules/email-notifications/templates/cart-reminder.tsx) |

**Env**: `ABANDONED_CART_REMINDERS_ENABLED=true` required. **Tuning**: `ABANDONED_CART_AGE_MIN_HOURS` (default 6), `ABANDONED_CART_AGE_MAX_HOURS` (default 72), `ABANDONED_CART_MAX_SENDS_PER_RUN` (default 50). **Storage**: `abandoned_cart_followups` table; stamped with `reminder_sent_at` and `converted_at`. **Consent**: skips customers with `marketing_consent_email = false`; guests still messaged.

### Reorder reminders, win-back, monthly digest
Email cadence keeping repeat / dormant customers warm and producing an internal monthly performance report.

| Feature | Job | Schedule | Email template | Env gate |
| --- | --- | --- | --- | --- |
| Reorder reminders | [send-reorder-reminders.ts](backend/src/jobs/send-reorder-reminders.ts) | `30 23 * * *` | [reorder-reminder.tsx](backend/src/modules/email-notifications/templates/reorder-reminder.tsx) | `REORDER_REMINDERS_ENABLED` |
| Win-back | [send-winback-emails.ts](backend/src/jobs/send-winback-emails.ts) | `0 0 * * 1` (weekly Monday) | [winback.tsx](backend/src/modules/email-notifications/templates/winback.tsx) | `WINBACK_EMAILS_ENABLED` |
| Monthly digest (internal) | [send-monthly-digest.ts](backend/src/jobs/send-monthly-digest.ts) | `0 22 2 * *` (2nd of month) | [monthly-digest.tsx](backend/src/modules/email-notifications/templates/monthly-digest.tsx) | `MONTHLY_DIGEST_RECIPIENTS` (comma-separated emails) |

Services: [reorder-reminders/](backend/src/services/reorder-reminders/), [churn-queue/](backend/src/services/churn-queue/) (drives win-back; classifies dormancy as drifting / at_risk / lost based on median order gap), [monthly-digest/](backend/src/services/monthly-digest/).

**Idempotency**: `customer.metadata.last_reorder_reminder_sent_at` (reorder); win-back uses one per customer per 90 days. Monthly digest skips silently if `MONTHLY_DIGEST_RECIPIENTS` is unset.

### Automation rules engine
Fire-on-event rules: conditions on order/stage changes trigger actions (tag customer, post comment, send alert, advance stage).

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/automation-rule/](backend/src/modules/automation-rule/) |
| Migration | [backend/src/modules/automation-rule/migrations/Migration20260516200000.ts](backend/src/modules/automation-rule/migrations/Migration20260516200000.ts) |
| Evaluator + dispatcher | [backend/src/services/automation-rules/evaluate.ts](backend/src/services/automation-rules/evaluate.ts) |
| `order.placed` subscriber | [backend/src/subscribers/automation-on-order-placed.ts](backend/src/subscribers/automation-on-order-placed.ts) |
| `stage_changed` subscriber | [backend/src/subscribers/automation-on-stage-changed.ts](backend/src/subscribers/automation-on-stage-changed.ts) |
| Admin REST | [backend/src/api/admin/admin-workspace/automation-rules/](backend/src/api/admin/admin-workspace/automation-rules/) |
| Admin CRUD page | [backend/src/admin/routes/automation-rules/page.tsx](backend/src/admin/routes/automation-rules/page.tsx) |

**Triggers**: `order.placed`, `order.production_stage_changed`.
**Operators**: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `exists`.
**Fields**: `total`, `currency_code`, `line_count`, `quantity_total`, `lifetime_value`, `order_count`.
**Actions**: `tag_customer`, `post_order_comment`, `send_alert_email`, `set_production_stage`.

**Gotcha**: conditions + action payloads are stored as raw JSONB with loose validation. Action kinds are hard-coded in `evaluate.ts`; extending requires a code change. LTV is hydrated inline by `automation-on-order-placed.ts`.

### Customer analytics widgets (LTV, journey, anonymize)
Per-customer signals surfaced on the admin customer detail page.

| Component | Path |
| --- | --- |
| LTV compute | [backend/src/services/customer-ltv/](backend/src/services/customer-ltv/) |
| LTV widget | [backend/src/admin/widgets/customer-ltv.tsx](backend/src/admin/widgets/customer-ltv.tsx) |
| Journey aggregator | [backend/src/services/customer-journey/](backend/src/services/customer-journey/) |
| Journey widget | [backend/src/admin/widgets/customer-journey.tsx](backend/src/admin/widgets/customer-journey.tsx) |
| Anonymize (GDPR) | [backend/src/services/customer-anonymize/anonymize.ts](backend/src/services/customer-anonymize/anonymize.ts) |
| Recently viewed widget | [backend/src/admin/widgets/recently-viewed.tsx](backend/src/admin/widgets/recently-viewed.tsx) + trackers (`-customer`, `-order`, `-product`) |

**Env**: `LTV_VIP_THRESHOLD_AUD` (default 1500; triggers VIP-tag suggestion). **PostHog integration** (journey): needs `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID`, `POSTHOG_HOST`. **Anonymize**: hashes email → `redacted-<sha256>@anon.invalid`, blanks PII, deletes newsletter + abandoned_cart rows. Deterministic so re-requests don't conflict.

### PostHog cohort sync (PostHog → Medusa tags)
Daily sync of PostHog cohort membership into Medusa customer tags so segments can drive automation rules.

| Component | Path |
| --- | --- |
| Daily job (`30 3 * * *`) | [backend/src/jobs/sync-posthog-cohorts.ts](backend/src/jobs/sync-posthog-cohorts.ts) |
| Sync logic | [backend/src/services/posthog-cohort-sync/](backend/src/services/posthog-cohort-sync/) |
| Stats helpers | [backend/src/services/posthog-stats/](backend/src/services/posthog-stats/) |

**Env**: `POSTHOG_COHORT_SYNC_ENABLED=true`, plus the PostHog auth trio. **Config format**: `POSTHOG_COHORT_SYNC_LIST="123:Engaged this week:teal,456:Cart but no checkout:amber"` (`cohort_id:tag_label:color`). **Safety**: hard cap of 5000 members per cohort; only deletes tags whose `created_by = "posthog-cohort-sync"` so admin-created tags are never auto-removed.

### Newsletter + consent
Subscriber syncs newsletter consent backwards when a previously-subscribed email registers as a customer.

| Component | Path |
| --- | --- |
| Subscriber | [backend/src/subscribers/newsletter-sync-on-customer-created.ts](backend/src/subscribers/newsletter-sync-on-customer-created.ts) |
| Signup route | [backend/src/api/newsletter/route.ts](backend/src/api/newsletter/route.ts) |
| Migration script | [backend/src/scripts/migrate-newsletter-to-consent.ts](backend/src/scripts/migrate-newsletter-to-consent.ts) |

**Env**: `NEWSLETTER_NOTIFICATION_EMAIL` (admin alerted on new subscribers). **Idempotency**: only sets `marketing_consent_email` if currently unset — never overwrites explicit `false`.

### AI copy (product description drafts)
Generates 3 draft descriptions for a product based on metadata + optional staff hint. OpenAI or Anthropic, configurable per env.

| Component | Path |
| --- | --- |
| Service | [backend/src/services/ai-copy/](backend/src/services/ai-copy/) |
| Admin route | [backend/src/api/admin/products/[id]/generate-description/route.ts](backend/src/api/admin/products/[id]/generate-description/route.ts) |
| Widget on product detail | [backend/src/admin/widgets/product-ai-description.tsx](backend/src/admin/widgets/product-ai-description.tsx) |

**Env**: `AI_PROVIDER` (`openai` | `anthropic`), `OPENAI_API_KEY` + `OPENAI_MODEL` (default `gpt-4o-mini`), `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` (default `claude-haiku-4-5`), `AI_REQUEST_TIMEOUT_MS`. Returns 503 if provider unconfigured, 429 on rate limit.

### Cross-sell recommendations
Nightly job computes top-K co-purchased products per product; stored in product metadata for PDP rendering.

| Component | Path |
| --- | --- |
| Nightly job (`0 2 * * *`) | [backend/src/jobs/refresh-cross-sell-recommendations.ts](backend/src/jobs/refresh-cross-sell-recommendations.ts) |
| Compute + refresh logic | [backend/src/services/cross-sell-recommendations/](backend/src/services/cross-sell-recommendations/) |

**Tuning**: `CROSS_SELL_MAX_PER_PRODUCT`, `CROSS_SELL_MIN_CO_OCCURRENCE`. **Storage**: `product.metadata.cross_sell_product_ids`. **Scale ceiling**: pulls full order history each run — promote to a materialised view past ~10k orders.

### Search event logging
Storefront fire-and-forget POST captures search queries + result counts for trending / zero-result analysis.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/search-log/](backend/src/modules/search-log/) |
| Migration | [backend/src/modules/search-log/migrations/Migration20260509000000.ts](backend/src/modules/search-log/migrations/Migration20260509000000.ts) |
| Store route | [backend/src/api/store/search-events/route.ts](backend/src/api/store/search-events/route.ts) |

Always returns 204 so failures never break UX. Query length validated 1-500 chars; empty queries dropped.

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
| `STRIPE_PAYMENT_LINK_WEBHOOK_SECRET` | Signing secret for the dedicated Stripe webhook that handles admin-created Payment Links. Configure a **second** Stripe webhook endpoint at `{backend}/hooks/stripe-payment-link` subscribed to `checkout.session.completed`. Distinct from `STRIPE_WEBHOOK_SECRET` (Medusa's checkout flow). When unset, the admin "Create payment link" button is hidden and the webhook returns 503. | unset — payment-link feature disabled |

| `FASHIONBIZ_API_TOKEN` | Optional. FashionBiz Public API v3 token (Authorization: `Token <token>`). Required to enable the FashionBiz importer + nightly stock sync. When unset, the FashionBiz module is not registered and the cron is a no-op. | unset |
| `FASHIONBIZ_BRANCH` | Optional. FashionBiz country shorthand: `au`, `nz`, or `ca`. | `au` |
| `FASHIONBIZ_BASE_URL` | Optional. FashionBiz API base URL — only override for staging or proxy. | `https://www.fashionbizapis.com/api/v3` |
| `FASHIONBIZ_COST_ADJUSTMENT` | Multiplier applied to the API "1-99" tier price before it's fed into the bulk-price ladder. The FashionBiz public API exposes a published "1-99" wholesale tier, but the distributor storefront (`au-store.fashionbizapps.com`) charges SC Prints **~15% above that tier** (observed 2026-05-13 across P400MS/BP2616MS/BP2610MS/P515MS, ratios 1.1505/1.1498/1.1498/1.1541). Production should set this to `1.15` so the retail ladder is calculated from the cost we'll actually be billed. | `1.0` (no adjustment — undercharges by ~15% if left at default) |

| `AUSSIE_PACIFIC_API_TOKEN` | Optional. Aussie Pacific Public API v1 bearer token (Authorization: `Bearer <token>`). Required to enable the AP importer + daily stock sync + dropship-order send. When unset, the AP module is not registered and the cron is a no-op. | unset |
| `AUSSIE_PACIFIC_BASE_URL` | Optional. Aussie Pacific API base URL — only override for staging or proxy. | `https://api.aussiepacific.com.au` |
| `AUSSIE_PACIFIC_COST_ADJUSTMENT` | Multiplier applied to the API `price` field before it's fed into the bulk-price ladder. We currently assume AP's `price` is ex-GST cost (same convention as AS Colour and the FashionBiz "1-99" tier), so default is `1.0`. Calibrate against the first real invoice — if AP returns inc-GST prices, set `0.909`; if AP's published price sits below the trade rate (like FashionBiz's distributor storefront), set the observed ratio. The first 5 styles emit a calibration log line during import so the operator can sanity-check before scaling up. | `1.0` |
| `AUSSIE_PACIFIC_DEFAULT_SHIPPING_METHOD` | Optional. Default shipping method embedded in dropship order payloads. Falls back to the form input on the admin widget when unset. | unset |
| `QUOTE_EXPIRY_CRON_ENABLED` | Daily cron that transitions `status = quoted` quotes whose `expires_at` is past to `status = expired`, appending a `QuoteEvent` + audit row. Off by default so dry-running quote workflows in dev doesn't auto-expire stale test data. See [backend/src/jobs/expire-quotes.ts](backend/src/jobs/expire-quotes.ts). | `false` |
| `EMAIL_SUPPRESSION_TABLE_ENABLED` | Enables the suppression-table check inside `shouldSendMarketingEmail()` ([backend/src/lib/marketing-email.ts](backend/src/lib/marketing-email.ts)). Phase 8 ships the table and flips this to `true`. Until then the helper short-circuits the suppression check and relies only on `customer.metadata.marketing_consent_email`. | `false` |
| `OWNER_AUTOSTAMP_ENABLED` | Auto-assigns ownership on every new order — inheriting the customer's owner first, falling back to `pickNextOwner()` from the rotation table. Off by default so existing orders aren't disrupted before the rotation is populated. See [backend/src/subscribers/order-placed-stamp-owner.ts](backend/src/subscribers/order-placed-stamp-owner.ts). | `false` |
| `TASKS_OVERDUE_CRON_ENABLED` | Daily 09:00 UTC cron that walks active tasks with `due_at` in the past, stamps `last_overdue_notified_at`, writes audit rows on every anchored entity, and emits `task_overdue_notified` PostHog events. Email/Slack delivery is deferred to a follow-up. Off by default so dev/staging doesn't spam during testing. See [backend/src/jobs/notify-overdue-tasks.ts](backend/src/jobs/notify-overdue-tasks.ts). | `false` |
| `UNSUBSCRIBE_LINK_SECRET` | HMAC key used to sign the one-click unsubscribe URL embedded in marketing emails. Same shape as `NPS_LINK_SECRET`: must be set in prod (so links can't be forged), dev placeholder used otherwise so links verify locally. | `unsubscribe-dev-secret-do-not-use-in-prod` |
| `MARKETING_PREFERENCE_CENTER_URL` | Where one-click unsubscribe redirects after writing the suppression row. Storefront page that confirms the action / lets the customer toggle per-stream prefs. Falls back to `/` if unset. | unset (recommend `${STOREFRONT_URL}/email-preferences`) |
| `AUTOMATION_EXPANDED_TRIGGERS_ENABLED` | Gates the Phase 10 trigger expansion (`customer.created`, `order.delivered`) and the new actions (`create_task`, `assign_owner`). Off by default so existing rules using only `order.placed` + `order.production_stage_changed` keep working unchanged until staff opt in. | `false` |
| `QUOTE_CONVERSION_ENABLED` | Master switch for the quote-on-order-placed / quote-on-order-cancelled subscribers (Phase 11). ON by default — closing the quote loop is the desired behaviour in production. Set to `false` to disable the loop closure without removing the subscribers. | `true` |
| `STALE_ORDER_ESCALATION_DAYS` | How many days an order stays in `metadata.is_stale = true` before the manager-escalation path fires (Phase 11). Distinct from `STALE_ORDER_THRESHOLD_DAYS` (which controls when "stale" is flagged in the first place). | `3` |
| `STALE_ORDER_MANAGER_EMAIL` | Comma-separated inboxes that get the manager escalation when an order has been stale longer than `STALE_ORDER_ESCALATION_DAYS`. Unset = no escalation (the owner task + audit still fire). | unset |

#### Customer-lifecycle send-gate flags (CRM)

Every reminder/digest job is gated behind an `*_ENABLED` flag so accidental boots don't mass-email customers. All default OFF.

| Variable | Purpose | Default |
| --- | --- | --- |
| `NPS_LINK_SECRET` | **Shared** HMAC secret for NPS rating links, artwork-approval links, and quote-accept links. Required in prod for any of those features. | unset — features fall back to dev no-op |
| `NPS_REQUESTS_ENABLED` | Gate the daily NPS-request cron. | `false` |
| `NPS_REQUEST_DAYS_AFTER_DELIVERED` | Days after `delivered` before sending NPS prompt. | `14` |
| `NPS_MIN_GAP_DAYS_PER_CUSTOMER` | Don't re-NPS the same customer within this many days. | `90` |
| `NPS_MAX_SENDS_PER_RUN` | Cap per cron tick to limit blast radius. | `25` |
| `ABANDONED_CART_REMINDERS_ENABLED` | Gate the daily abandoned-cart cron. | `false` |
| `ABANDONED_CART_AGE_MIN_HOURS` / `ABANDONED_CART_AGE_MAX_HOURS` | Send window relative to cart-created. | `6` / `72` |
| `ABANDONED_CART_MAX_SENDS_PER_RUN` | Cap per cron tick. | `50` |
| `REORDER_REMINDERS_ENABLED` | Gate the daily reorder-reminder cron. | `false` |
| `WINBACK_EMAILS_ENABLED` | Gate the weekly win-back cron. | `false` |
| `MONTHLY_DIGEST_RECIPIENTS` | Comma-separated admin emails for the 2nd-of-month internal digest. Empty disables. | unset |
| `STALE_ORDER_ALERTS_ENABLED` | Gate the daily stale-order scan. | `false` |
| `STALE_ORDER_THRESHOLD_DAYS` | Days a `production_stage` can sit before being flagged stale. | `3` |
| `SLACK_PRODUCTION_WEBHOOK_URL` | Optional. Webhook for newly-stale orders digest. | unset — logged only |
| `POSTHOG_COHORT_SYNC_ENABLED` | Gate the daily PostHog → tags sync. | `false` |
| `POSTHOG_COHORT_SYNC_LIST` | `cohort_id:tag_label:color` comma-separated config. | unset |
| `LTV_VIP_THRESHOLD_AUD` | LTV threshold for VIP-tag suggestion in admin. | `1500` |
| `FREE_SHIPPING_TAGS` | Comma-separated customer-tag labels that grant `applied_perks.free_shipping` at order placement. | `"VIP,Wholesale"` |
| `CROSS_SELL_MAX_PER_PRODUCT` / `CROSS_SELL_MIN_CO_OCCURRENCE` | Tuning for the nightly cross-sell job. | see constants.ts |

#### AI features

| Variable | Purpose | Default |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Required for the storefront chatbot AND backend AI copy generator (when `AI_PROVIDER=anthropic`). | unset — both routes return 503 |
| `ANTHROPIC_MODEL` | Override the Anthropic model id. | `claude-haiku-4-5` |
| `AI_PROVIDER` | Backend AI copy provider switch (`openai` \| `anthropic`). | `openai` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI credentials for AI copy. | unset / `gpt-4o-mini` |
| `AI_REQUEST_TIMEOUT_MS` | Hard timeout for AI provider requests. | sensible default |

#### Notification routing

| Variable | Purpose | Default |
| --- | --- | --- |
| `RESEND_API_KEY` | Required to send any email. | unset — emails silently dropped |
| `RESEND_FROM_EMAIL` (or `RESEND_FROM`) | Verified sender address. | unset |
| `SUPPORT_REPLY_TO_EMAIL` | Reply-to header on customer-facing emails (NPS, quotes, contact responses). | unset — falls back to from-address |
| `CONTACT_NOTIFICATION_EMAIL` | Admin inbox for contact-form + quote submissions. | unset — submissions still persist |
| `NEWSLETTER_NOTIFICATION_EMAIL` | Admin inbox for new newsletter signups. | unset |
| `ORDER_NOTIFICATION_EMAIL` | Admin inbox for order-placed notification. | unset |
| `ADMIN_PUBLIC_URL` | Public admin URL used in digest emails. | falls back to `BACKEND_URL` |

#### Shipping (ShipStation + dropship)

| Variable | Purpose | Default |
| --- | --- | --- |
| `SHIPSTATION_API_KEY` | Required to enable the ShipStation fulfillment provider (rates, labels). | unset — provider not registered |
| `SHIPSTATION_WEBHOOK_SECRET` | Required for incoming label events. | unset |
| `SHIPSTATION_WAREHOUSE_*` | Warehouse address fallback (`POSTCODE`, `COUNTRY_CODE`, `CITY`, `STATE`, `ADDRESS_1`, `PHONE`, `NAME`). Prefer the stock-location address in admin. | unset |
| `SHIPSTATION_PACKAGE_LENGTH_CM` / `_WIDTH_CM` / `_HEIGHT_CM` | Default package dimensions for rate quotes. | unset |
| `SHIPPING_PACKAGING_OVERHEAD_GRAMS` | Added to item weight for accurate rates. | sensible default |

#### File storage (MinIO)

| Variable | Purpose | Default |
| --- | --- | --- |
| `MINIO_ENDPOINT` | MinIO host (e.g. `minio.example.com:9000` or `https://minio.example.com`). Protocol parsed for port; default 443 for https, 80 for http. | unset — file uploads broken |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credentials. | unset |
| `MINIO_BUCKET` | Bucket name; auto-set to public-read on first use. | `medusa-media` |

All other env vars (Medusa core, AS Colour, Stripe, etc.) are documented in [backend/src/lib/constants.ts](backend/src/lib/constants.ts).

### Storefront (`storefront/.env`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_VECTORIZATION_VARIANT_ID` | Variant ID of the vectorization service product. Without it, the modal still works but the service line isn't auto-added — your team adds it via Order Edit. |
| `NEXT_PUBLIC_VECTORIZATION_DISPLAY_PRICE` | Optional. Free-form string (e.g. `$15`) shown in the modal CTA copy. |

## First-time setup checklist

1. `cd backend && pnpm install && cd ../storefront && pnpm install`
2. **Run migrations**: `cd backend && npx medusa db:migrate` — runs every module's migrations (designs, wishlist, bundles, lookbook, quote, group-order, organisation, print-recipe, production-reject, automation-rule, admin-workspace (now incl. Phase 6 `crm_owner_assignment` + `crm_owner_rotation` and Phase 8 `email_suppression`), report-alert, report-annotation, search-log, stripe-payment-link, task (Phase 7), pos-session (POS), …).
3. **Sync module links**: `cd backend && npx medusa db:sync-links` — materialises customer↔design, customer↔wishlist, product↔brand AND the new CRM links: customer↔crm_owner_assignment, order↔crm_owner_assignment (Phase 6), customer↔task, order↔task, quote↔task, organisation↔task (Phase 7).
4. **Seed customer tiers** (B2B pricing): `cd backend && npx medusa exec src/scripts/seed-customer-tiers.ts` — creates the 8 "Tier: X" customer groups + matching price-list overrides.
5. **Bootstrap shop categories** (mega-menu): `cd backend && npx medusa exec src/scripts/setup-shop-categories.ts` — creates the audience × garment-type tree and back-fills existing products.
6. **Create the vectorization service product** in Medusa admin (Phase 4):
   - Title: "Artwork Vectorization Service"
   - Make it digital (no shipping, no inventory)
   - Hide from storefront catalog (tag it `internal` or whatever convention you use)
   - Set price (e.g. $15 AUD)
   - Copy the **variant ID** (not product ID) into `NEXT_PUBLIC_VECTORIZATION_VARIANT_ID`
7. Add the env vars from the tables above (at minimum: Resend, NPS_LINK_SECRET, STOREFRONT_URL).
8. Configure the **second** Stripe webhook endpoint for payment links if used (see "Stripe payment links" section below).
9. **Populate the owner rotation table** (Phase 6) at `/app/rotation` — add at least one teammate so `pickNextOwner()` has a target before flipping `OWNER_AUTOSTAMP_ENABLED=true`.
10. **Activate the CRM phase env gates** as you're ready (all default OFF except `QUOTE_CONVERSION_ENABLED`): `QUOTE_EXPIRY_CRON_ENABLED`, `EMAIL_SUPPRESSION_TABLE_ENABLED`, `OWNER_AUTOSTAMP_ENABLED`, `TASKS_OVERDUE_CRON_ENABLED`, `AUTOMATION_EXPANDED_TRIGGERS_ENABLED`. Set `UNSUBSCRIBE_LINK_SECRET` in prod before sending any marketing email containing the new footer.
11. Restart both apps.

## Stripe payment links — auto-link to orders

Staff create a Stripe-hosted Payment Link for an order (deposit / balance / full / one-off "manual") from the order-deposit widget. When the customer pays, a dedicated webhook receives `checkout.session.completed`, creates a fresh `payment_collection` against the order, runs `markPaymentCollectionAsPaidWorkflow`, and stamps a summary entry on `order.metadata.stripe_payment_links[]`. No manual reconciliation against the Stripe dashboard.

| Component | Path |
| --- | --- |
| Module + service + migration | [backend/src/modules/stripe-payment-link/](backend/src/modules/stripe-payment-link/) |
| Stripe SDK wrapper + create-link + webhook handler | [backend/src/services/stripe-payment-link/](backend/src/services/stripe-payment-link/) |
| Admin API — create / list links | [backend/src/api/admin/orders/\[id\]/payment-link/route.ts](backend/src/api/admin/orders/[id]/payment-link/route.ts) |
| Admin API — deactivate link | [backend/src/api/admin/orders/\[id\]/payment-link/\[link_id\]/route.ts](backend/src/api/admin/orders/[id]/payment-link/[link_id]/route.ts) |
| Webhook endpoint | [backend/src/api/hooks/stripe-payment-link/route.ts](backend/src/api/hooks/stripe-payment-link/route.ts) |
| Raw-body middleware registration | [backend/src/api/middlewares.ts](backend/src/api/middlewares.ts) |
| Admin widget (extends deposit widget) | [backend/src/admin/widgets/order-deposit.tsx](backend/src/admin/widgets/order-deposit.tsx) |
| Payment-mix report tweak (attribute via metadata.real_gateway) | [backend/src/api/admin/reports/payment-mix/route.ts](backend/src/api/admin/reports/payment-mix/route.ts) |

**Why a second webhook endpoint?** Medusa's built-in Stripe provider owns `/hooks/payment/stripe_stripe` and tries to match every PaymentIntent against an existing cart-checkout payment_session. Payment Links don't have one, so we route them through a separate endpoint with its own signing secret. Configure two Stripe webhook endpoints in the dashboard:
- Existing: `{backend}/hooks/payment/stripe_stripe` (Medusa-owned, cart checkout)
- New: `{backend}/hooks/stripe-payment-link` subscribed to **only** `checkout.session.completed`

**Why a new `payment_collection` per link?** `markPaymentCollectionAsPaidWorkflow` requires `status === "not_paid"`, so we can't append to the cart's existing collection. Each link = one collection = one Payment row.

**Provider attribution caveat**: `markPaymentCollectionAsPaidWorkflow` hard-codes `provider_id = "pp_system_default"`. The handler stamps `payment.metadata.real_gateway = "stripe_payment_link"`; the payment-mix report reads that metadata so revenue is bucketed under Stripe.

**Idempotency**: two layers. (1) `stripe_payment_link_event` table — Stripe event ID as PK; unique-violation on insert returns 200 `{idempotent: true}`. (2) row.status === "paid" short-circuits inside the handler. Belt-and-braces: `restrictions.completed_sessions.limit = 1` on the Stripe Payment Link prevents a single link being paid twice.

**Local dev**: `stripe listen --forward-to localhost:9000/hooks/stripe-payment-link` (Stripe CLI) — the printed `whsec_...` is your `STRIPE_PAYMENT_LINK_WEBHOOK_SECRET`. Note this is a separate secret from `STRIPE_WEBHOOK_SECRET`.

**Quote-anchored links**: the data model + webhook already support `quote_id` (handler looks up `quote.metadata.cart_id → order` if the quote has converted). Admin UI on the quote detail page is deferred to v1.1.

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

**Discontinued styles**: AS Colour appends `"S"` to a `styleCode` to mark it as superseded/discontinued (verified empirically — 22% of their catalog ends in `S` and 75 of those have a paired non-S base still in the catalog). The importer **skips** styleCodes ending in `S` by default. Set `IMPORT_INCLUDE_DISCONTINUED=1` to bypass for one-off historical imports. To delete already-imported discontinued products, run [cleanup-ascolour-discontinued.ts](backend/src/scripts/cleanup-ascolour-discontinued.ts) (supports `DRY_RUN=1`).

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

## Shipping & dropship

### ShipStation fulfillment provider
Real-time rate calculation, label purchase, and shipment tracking via ShipStation API v2.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/shipstation/](backend/src/modules/shipstation/) |
| Parcels widget | [backend/src/admin/widgets/order-shipstation-parcels.tsx](backend/src/admin/widgets/order-shipstation-parcels.tsx) |
| Shipping-decision widget | [backend/src/admin/widgets/order-shipping-decision.tsx](backend/src/admin/widgets/order-shipping-decision.tsx) |
| Shipping-decision stamp (cart → order) | [backend/src/subscribers/order-placed-stamp-shipping-decision.ts](backend/src/subscribers/order-placed-stamp-shipping-decision.ts) |
| Shipment-created → email | [backend/src/subscribers/order-shipment-created.ts](backend/src/subscribers/order-shipment-created.ts) |

**Env**: `SHIPSTATION_API_KEY` + warehouse fields (see env table). **Gotcha**: rates silently fail if any required warehouse field is missing; `variant.weight` or `item.metadata.weight_grams` must be set or only packaging overhead is used.

### AS Colour dropship status sync
AS Colour has no webhooks — every 15 minutes a job polls non-terminal AS Colour orders and writes status / shipments into order metadata.

| Component | Path |
| --- | --- |
| Status sync job (`*/15 * * * *`) | [backend/src/jobs/sync-ascolour-order-status.ts](backend/src/jobs/sync-ascolour-order-status.ts) |
| Dropship widget | [backend/src/admin/widgets/order-ascolour-dropship.tsx](backend/src/admin/widgets/order-ascolour-dropship.tsx) |
| Status mapping | [backend/src/lib/ascolour-status.ts](backend/src/lib/ascolour-status.ts) |

180-day lookback to skip ancient orders. Terminal-status filter prevents re-polling completed orders. Shipments endpoint may 404 early — logged non-fatal.

### Aussie Pacific dropship dashboard
See "Aussie Pacific API importer" section above. Dropship dashboard at `/app/dropship/aussie-pacific` (route at [backend/src/admin/routes/dropship/aussie-pacific/page.tsx](backend/src/admin/routes/dropship/aussie-pacific/page.tsx); the parent `/app/dropship` lives in [backend/src/admin/routes/dropship/page.tsx](backend/src/admin/routes/dropship/page.tsx)).

## File storage (MinIO module)

S3-compatible self-hosted file storage. Registered as Medusa's `FileProviderService`; all images and customer-uploaded artwork go through it.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/minio-file/](backend/src/modules/minio-file/) |

**Env**: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` (default `medusa-media`).

**Gotcha**: endpoint parsing strips protocol and extracts port; HTTPS implies 443, HTTP implies 80. Bucket policy auto-set to public-read on first use. Files keyed with ULID + extension; original filename in metadata.

**Retention warning** (re-stated from Operational notes): if MinIO lifecycle policies GC `customer_original_files` URLs, re-order will display but add-to-cart will fail to re-render print PNGs. Treat these as indefinite retention.

## Email notifications (Resend)

All transactional + lifecycle emails go through the email-notifications module wrapping Resend.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/email-notifications/](backend/src/modules/email-notifications/) |
| Resend service wrapper | [backend/src/modules/email-notifications/services/resend.ts](backend/src/modules/email-notifications/services/resend.ts) |
| Templates dir | [backend/src/modules/email-notifications/templates/](backend/src/modules/email-notifications/templates/) |

Preview templates locally: `cd backend && pnpm email:dev` (boots [react-email](https://react.email) at `localhost:3002`).

### Templates

| Template | Triggered by | Recipient | Notes |
| --- | --- | --- | --- |
| `order-placed.tsx` | `order.placed` subscriber | Customer + `ORDER_NOTIFICATION_EMAIL` | |
| `order-shipped.tsx` | `order.shipment_created` subscriber | Customer | Tracking parcels from fulfillment metadata or ShipStation labels |
| `order-production-stage.tsx` | `production_stage_changed` subscriber (Phase 1) | Customer | Sent only for forward transitions through `awaiting_approval` and `in_production` |
| `artwork-approval.tsx` | `order-artwork-stage-changed` subscriber | Customer | HMAC-signed link to `/artwork-approval/[orderId]` |
| `cart-reminder.tsx` | `send-abandoned-cart-reminders` job | Customer (consent-gated) | One per cart per lifetime |
| `reorder-reminder.tsx` | `send-reorder-reminders` job | Customer | Targets repeat customers near their median order gap |
| `nps-request.tsx` | `send-nps-requests` job | Customer | 1-5 score, HMAC-signed |
| `winback.tsx` | `send-winback-emails` job | Lapsed customer | Three severity tiers (drifting / at_risk / lost) |
| `monthly-digest.tsx` | `send-monthly-digest` job | Internal staff | 2nd of month at 22:00 UTC |
| `threshold-alert.tsx` | `run-report-alerts` job | Staff | Stock / SLA / capacity threshold breach |
| `contact-submission.tsx` | `POST /contact` route | `CONTACT_NOTIFICATION_EMAIL` | Quote submissions also use this path |
| `invite-user.tsx` | `invite.created` / `invite.resent` | Admin invitee | Branded SC Prints copy + token link |
| `base.tsx` | (utility) | — | Layout primitives shared by all templates |
| `index.tsx` | (utility) | — | Template registry / barrel export |

**Idempotency**: Resend's v6 API handles request dedup server-side. Some senders also add `notification.create({ idempotency_key })` belt-and-braces (e.g. artwork-approval flow).

## Background jobs (cron) — at-a-glance

All schedules in UTC. Hours shown also as AEST (+10) since the studio is in NSW.

| Schedule (UTC) | AEST | Job | What it does |
| --- | --- | --- | --- |
| `0 * * * *` | hourly | [sync-ascolour-inventory.ts](backend/src/jobs/sync-ascolour-inventory.ts) | Delta inventory pull from AS Colour |
| `*/15 * * * *` | every 15 min | [sync-ascolour-order-status.ts](backend/src/jobs/sync-ascolour-order-status.ts) | Poll AP and AS Colour order status |
| `0 2 * * *` | 12:00 | [refresh-cross-sell-recommendations.ts](backend/src/jobs/refresh-cross-sell-recommendations.ts) | Recompute top-K co-purchased products |
| `30 3 * * *` | 13:30 | [sync-posthog-cohorts.ts](backend/src/jobs/sync-posthog-cohorts.ts) | PostHog cohort → customer tag |
| `0 4 * * *` | 14:00 | [sync-fashionbiz-inventory.ts](backend/src/jobs/sync-fashionbiz-inventory.ts) | Full sweep of FashionBiz stock |
| `0 5 * * *` | 15:00 | [sync-aussie-pacific-inventory.ts](backend/src/jobs/sync-aussie-pacific-inventory.ts) | Full sweep of AP stock |
| `0 5 * * *` | 15:00 | [refresh-seo-analytics.ts](backend/src/jobs/refresh-seo-analytics.ts) | Pull 28-day GSC + GA4 metrics into cache |
| `0 6 * * *` | 16:00 | [regenerate-tier-prices.ts](backend/src/jobs/regenerate-tier-prices.ts) | Rebuild B2B tier price-list overrides |
| `0 8 * * *` | 18:00 | [scan-stale-orders.ts](backend/src/jobs/scan-stale-orders.ts) | Flag orders not progressed in N days |
| `0 22 * * *` | 08:00 next day | [send-nps-requests.ts](backend/src/jobs/send-nps-requests.ts) | Daily NPS prompt batch |
| `15 23 * * *` | 09:15 next day | [send-abandoned-cart-reminders.ts](backend/src/jobs/send-abandoned-cart-reminders.ts) | Cart reminder batch |
| `30 23 * * *` | 09:30 next day | [send-reorder-reminders.ts](backend/src/jobs/send-reorder-reminders.ts) | Repeat-customer nudge |
| `45 23 * * *` | 09:45 next day | [run-report-alerts.ts](backend/src/jobs/run-report-alerts.ts) | Evaluate threshold alerts and email staff |
| `0 0 * * 1` | Mon 10:00 | [send-winback-emails.ts](backend/src/jobs/send-winback-emails.ts) | Weekly dormant-customer email |
| `0 22 2 * *` | 2nd of month 08:00 | [send-monthly-digest.ts](backend/src/jobs/send-monthly-digest.ts) | Internal monthly performance digest |

Cron jobs that depend on optional integrations (AS Colour, FashionBiz, AP, ShipStation, PostHog, Google) no-op silently when their token/key env vars are unset.

## Subscribers — at-a-glance

| Subscriber | Event | Purpose |
| --- | --- | --- |
| [order-placed.ts](backend/src/subscribers/order-placed.ts) | `order.placed` | Dispatch ORDER_PLACED email to customer + `ORDER_NOTIFICATION_EMAIL`; PostHog identify |
| [order-placed-stamp-production-stage.ts](backend/src/subscribers/order-placed-stamp-production-stage.ts) | `order.placed` | Stamp initial `production_stage = "received"` so the Phase 1 tracker renders |
| [order-placed-stamp-shipping-decision.ts](backend/src/subscribers/order-placed-stamp-shipping-decision.ts) | `order.placed` | Mirror `cart.metadata.shipping_decision` → `order.metadata` |
| [stamp-order-tax-exempt.ts](backend/src/subscribers/stamp-order-tax-exempt.ts) | `order.placed` | Snapshot customer's tax-exempt state onto the order so invoices stay correct |
| [stamp-order-perks.ts](backend/src/subscribers/stamp-order-perks.ts) | `order.placed` | Snapshot `applied_perks` (free shipping, etc.) from customer tags |
| [order-shipment-created.ts](backend/src/subscribers/order-shipment-created.ts) | `order.shipment_created` | Dispatch ORDER_SHIPPED email with tracking parcels |
| [order-production-stage-changed.ts](backend/src/subscribers/order-production-stage-changed.ts) | `production_stage_changed` | Dispatch milestone email (Phase 1) |
| [order-stage-audit.ts](backend/src/subscribers/order-stage-audit.ts) | `production_stage_changed` | Append stage change to audit log + production_stage_history metadata |
| [order-artwork-stage-changed.ts](backend/src/subscribers/order-artwork-stage-changed.ts) | `artwork_stage_changed` | Build mockup PDF + email customer the HMAC-signed approval link |
| [automation-on-order-placed.ts](backend/src/subscribers/automation-on-order-placed.ts) | `order.placed` | Hydrate LTV + order count, evaluate automation rules |
| [automation-on-stage-changed.ts](backend/src/subscribers/automation-on-stage-changed.ts) | `production_stage_changed` | Evaluate stage-triggered automation rules |
| [abandoned-cart-mark-converted.ts](backend/src/subscribers/abandoned-cart-mark-converted.ts) | `order.placed` | Stamp `converted_at` on matching abandoned_cart_followups |
| [newsletter-sync-on-customer-created.ts](backend/src/subscribers/newsletter-sync-on-customer-created.ts) | `customer.created` | Back-fill `marketing_consent_email` from pre-existing newsletter row |
| [invite-created.ts](backend/src/subscribers/invite-created.ts) | `invite.created` + `invite.resent` | Send SC-Prints-branded admin invite email |

## Reports + alerts + admin workspace

The admin's analytical + ops layer. Hundreds of routes; the cheat sheet below is organised by surface.

### Reports dashboard
Single admin page rendering ~50 charts driven by ~60 backend routes under [backend/src/api/admin/reports/](backend/src/api/admin/reports/). Date-range filter (presets: 7d, 30d, this/last month, last quarter), region-aware currency. No caching layer — everything is live.

| Component | Path |
| --- | --- |
| Reports admin page | [backend/src/admin/routes/reports/page.tsx](backend/src/admin/routes/reports/page.tsx) |
| Chart components | [backend/src/admin/components/reports/](backend/src/admin/components/reports/) |
| Shared report utils (palette, date-range, CSV) | [backend/src/admin/lib/reports/](backend/src/admin/lib/reports/) |

Sub-route categories under `/admin/reports/`:
- **Sales & finance**: `sales-overview`, `aov-by-method`, `payment-mix`, `new-vs-returning`, `top-customers`, `top-products`, `cohort-ltv`, `cohorts`, `refund-rate`, `returns`, `discount-profitability`
- **Acquisition + funnel**: `pdp-conversion`, `cart-conversion`, `time-to-purchase`, `first-order-affinity`, `site-search`, `ga4-acquisition`, `ga4-ecommerce`, `ga4-aov-by-source`, `gsc-ctr-trend`, `geo-heatmap`
- **Customizer funnel**: `customizer-adoption`, `customizer-funnel`, `customizer-iteration`, `saved-design-conversion`, `vectorization-funnel`, `designs-utilization`
- **Production / SLA**: `sla-breach`, `time-in-stage`, `flow-time`, `on-time-delivery`, `production-snapshot`, `print-tomorrow`, `stage-dwell-heatmap`, `capacity`, `staff-throughput`, `ascolour-throughput`, `embroidery-stitches`, `decoration-mix`, `approval-turnaround`, `reprint-rate`, `order-edit-frequency`
- **Inventory & supply chain**: `inventory-status`, `aging-inventory`, `variant-velocity`, `supplier-lead-time`, `supplier-mix`, `blanks-forecast`
- **Customer health**: `rfm`, `reorder-rate`, `reorder-reminders`, `churn-queue`, `email-channel-roi`
- **Ops**: `today`, `order-time-heatmap`, `cron-jobs`, `system-health`, `regions`, `storage`, `monthly-digest`, `posthog-stats`, `config`

### Report alerts
Threshold-based metric alerts evaluated nightly at `45 23 * * *`. Six metrics by default: SLA breach %, currently-breaching count, reprint rate, dead stock units, capacity status, top-10 customer revenue share.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/report-alert/](backend/src/modules/report-alert/) |
| Evaluator + runner | [backend/src/services/report-alerts/](backend/src/services/report-alerts/) |
| Nightly job (`45 23 * * *`) | [backend/src/jobs/run-report-alerts.ts](backend/src/jobs/run-report-alerts.ts) |
| Admin REST | [backend/src/api/admin/reports/alerts/](backend/src/api/admin/reports/alerts/) |
| Email template | [backend/src/modules/email-notifications/templates/threshold-alert.tsx](backend/src/modules/email-notifications/templates/threshold-alert.tsx) |

Each alert has comparator + threshold + cooldown days. `last_value` is always written; `last_fired_at` only when alert fires (cooldown enforces). UI shows "still breaching" via `last_value`.

### Report annotations
Pin date-stamped notes (label + description + colour) over time-series charts. Apply globally to all charts that opt in.

| Component | Path |
| --- | --- |
| Module | [backend/src/modules/report-annotation/](backend/src/modules/report-annotation/) |
| Admin REST | [backend/src/api/admin/reports/annotations/](backend/src/api/admin/reports/annotations/) |

### Studio dashboard ("who needs attention today")
Five live buckets recomputed at every page load: VIP dormant, first-timer orders, idle quotes, low NPS scores, snooze follow-ups due.

| Component | Path |
| --- | --- |
| Service | [backend/src/services/studio-dashboard/build.ts](backend/src/services/studio-dashboard/build.ts) |
| Admin route | [backend/src/api/admin/studio/route.ts](backend/src/api/admin/studio/route.ts) |
| Admin page | [backend/src/admin/routes/studio/page.tsx](backend/src/admin/routes/studio/page.tsx) |

### System map
Lazy-loaded Mermaid diagrams of stage flow, staff lanes, data ownership.

| Component | Path |
| --- | --- |
| Admin page | [backend/src/admin/routes/system-map/page.tsx](backend/src/admin/routes/system-map/page.tsx) |
| Chunk-reload safety widget | [backend/src/admin/widgets/chunk-reload-guard.tsx](backend/src/admin/widgets/chunk-reload-guard.tsx) |

The guard listens for 11 chunk-load-error signatures, debounces reloads via `sessionStorage` (key `LAST_RELOAD_KEY`), min 15s between reload attempts.

### Help admin page
Embedded staff guide reference (start-here, widget descriptions, keyboard shortcuts, integration walkthroughs). Source content tracked in `/Docs/STAFF_GUIDE.md`.

| Component | Path |
| --- | --- |
| Admin page | [backend/src/admin/routes/help/page.tsx](backend/src/admin/routes/help/page.tsx) |

### Admin workspace module (cross-cutting admin state)
Centralises persistent admin state: customer tags + notes, order comments, audit log, admin bookmarks, presence, status banner.

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/admin-workspace/](backend/src/modules/admin-workspace/) |
| Migrations (4 over time) | [Migration20260516000000.ts](backend/src/modules/admin-workspace/migrations/Migration20260516000000.ts), [...100000](backend/src/modules/admin-workspace/migrations/Migration20260516100000.ts), [...200000](backend/src/modules/admin-workspace/migrations/Migration20260516200000.ts), [Migration20260622000000.ts](backend/src/modules/admin-workspace/migrations/Migration20260622000000.ts) |
| Bookmarks REST | [backend/src/api/admin/admin-workspace/bookmarks/](backend/src/api/admin/admin-workspace/bookmarks/) |
| Presence REST | [backend/src/api/admin/admin-workspace/presence/](backend/src/api/admin/admin-workspace/presence/) |
| Search REST | [backend/src/api/admin/admin-workspace/search/](backend/src/api/admin/admin-workspace/search/) |
| Status banner REST | [backend/src/api/admin/admin-workspace/status-banner/](backend/src/api/admin/admin-workspace/status-banner/) |
| Automation-rules REST (shared with the rules engine) | [backend/src/api/admin/admin-workspace/automation-rules/](backend/src/api/admin/admin-workspace/automation-rules/) |
| Command palette | [backend/src/admin/widgets/cmd-k-palette.tsx](backend/src/admin/widgets/cmd-k-palette.tsx) |
| Keyboard shortcuts overlay | [backend/src/admin/widgets/keyboard-shortcuts.tsx](backend/src/admin/widgets/keyboard-shortcuts.tsx) |
| Status banner display | [backend/src/admin/widgets/status-banner.tsx](backend/src/admin/widgets/status-banner.tsx) |

**Status banner**: severities `info` / `warning` / `critical`, optional `expires_at`. Dismiss state lives in `localStorage` (`sc:status_banner_dismissed_id`) — one-shot per banner per browser session.

### Config endpoint for cross-domain admin links
| Component | Path |
| --- | --- |
| Read-only `{storefront_url, country_code}` | [backend/src/api/admin/scp-config/route.ts](backend/src/api/admin/scp-config/route.ts) |

### Product data hub
One admin page consolidating five spreadsheet/import workflows into tabs: import-new, update-existing, bulk-delete, types-and-tags, plus per-supplier importer tabs (AS Colour, FashionBiz, AP).

| Component | Path |
| --- | --- |
| Product data hub | [backend/src/admin/routes/product-data/page.tsx](backend/src/admin/routes/product-data/page.tsx) |
| Spreadsheet-sync (import) | [backend/src/admin/routes/spreadsheet-sync/page.tsx](backend/src/admin/routes/spreadsheet-sync/page.tsx) |
| Spreadsheet-sync (update) | [backend/src/admin/routes/spreadsheet-sync-update/page.tsx](backend/src/admin/routes/spreadsheet-sync-update/page.tsx) |
| Bulk-delete | [backend/src/admin/routes/product-bulk-delete/page.tsx](backend/src/admin/routes/product-bulk-delete/page.tsx) |
| Types & tags manager | [backend/src/admin/routes/product-type-tag-manage/page.tsx](backend/src/admin/routes/product-type-tag-manage/page.tsx) |
| Per-supplier importer UIs | [backend/src/admin/routes/ascolour-import/](backend/src/admin/routes/ascolour-import/), [fashionbiz-import/](backend/src/admin/routes/fashionbiz-import/), [aussie-pacific-import/](backend/src/admin/routes/aussie-pacific-import/) |
| Spreadsheet sync libs | [spreadsheet-sync-brands.ts](backend/src/admin/lib/spreadsheet-sync-brands.ts), [-categories.ts](backend/src/admin/lib/spreadsheet-sync-categories.ts), [-import.ts](backend/src/admin/lib/spreadsheet-sync-import.ts), [-preview.ts](backend/src/admin/lib/spreadsheet-sync-preview.ts), [-tags.ts](backend/src/admin/lib/spreadsheet-sync-tags.ts), [-update-import.ts](backend/src/admin/lib/spreadsheet-sync-update-import.ts) |
| CSV import / export helpers | [csv-import.ts](backend/src/admin/lib/csv-import.ts) + [csv-export.ts](backend/src/admin/lib/csv-export.ts) |

### Export widgets (CSV download from list pages)
| Widget | Purpose |
| --- | --- |
| [orders-export-csv.tsx](backend/src/admin/widgets/orders-export-csv.tsx) | Order list snapshot |
| [product-tags-export-csv.tsx](backend/src/admin/widgets/product-tags-export-csv.tsx) | Catalog tags |
| [product-types-export-csv.tsx](backend/src/admin/widgets/product-types-export-csv.tsx) | Catalog types |
| [products-import-template-export.tsx](backend/src/admin/widgets/products-import-template-export.tsx) | Empty product-import CSV template |
| [variant-bulk-pricing.tsx](backend/src/admin/widgets/variant-bulk-pricing.tsx) | Per-variant bulk-pricing ladder editor |
| [variant-bulk-aggregation-flag.tsx](backend/src/admin/widgets/variant-bulk-aggregation-flag.tsx) | Mark a variant as a "bulk aggregator" for ladder display |
| [variant-weights.tsx](backend/src/admin/widgets/variant-weights.tsx) | Per-variant weight (shipping-rate inputs) |

### Misc admin widgets
| Widget | Purpose |
| --- | --- |
| [agent-products-debug.tsx](backend/src/admin/widgets/agent-products-debug.tsx) | Internal debug surface for agent-driven product queries |
| [product-brand.tsx](backend/src/admin/widgets/product-brand.tsx) | Brand picker on product detail (see "Brands" section) |
| [product-ai-description.tsx](backend/src/admin/widgets/product-ai-description.tsx) | AI copy widget on product detail |

## Storefront layout map

### Account dashboard sub-pages
All under [storefront/src/app/[countryCode]/(main)/account/@dashboard/](storefront/src/app/[countryCode]/(main)/account/@dashboard/):

| Page | Source | Status |
| --- | --- | --- |
| `profile/` | Medusa starter | stock |
| `addresses/` | Medusa starter | stock |
| `orders/` | Custom (Medusa starter + tracking + reorder) | custom |
| `designs/` | Phase 2 (saved designs) | custom |
| `wishlist/` | Wishlist module | custom |
| `group-orders/` | Group-order module | custom |
| `organisations/` | Organisation module | custom |

### Experimental / dev pages (flag for cleanup before next release)
These are clearly experimental and not linked from production navigation. Audit which are still useful and trim the rest.

| Path | Notes |
| --- | --- |
| `[countryCode]/test/animation-widgets/` | Widget animation sandbox |
| `[countryCode]/test/button-animations/` | Button interaction tests |
| `[countryCode]/bleh/`, `bleh2/` | Three.js particle experiments with photo source |
| `[countryCode]/dan/`, `dmc/` | Dev splash pages, not linked from nav |
| `[countryCode]/(main)/particle-logo/`, `particle-threejs/`, `particle-flow/` | Tsparticles + Three.js sandboxes |
| `[countryCode]/(main)/old-hero/` | Legacy hero — superseded by current home hero |
| `[countryCode]/(main)/jungle-scene/`, `space-hero/` | Animation isolation tests |

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

### CRM audit log (Phase 5+)
Polymorphic `audit_log` table in [backend/src/modules/admin-workspace/models/audit-log.ts](backend/src/modules/admin-workspace/models/audit-log.ts) is the per-entity activity trail behind the customer-journey widget, the order audit endpoint, and the future organisation activity tab. **Always call** `writeAudit({ container, entity, entity_id, action, actor_id?, actor_email?, details? })` from [backend/src/lib/audit-log.ts](backend/src/lib/audit-log.ts) — it standardises the vocabulary (`AUDIT_ENTITY` / `AUDIT_ACTION` constants in [backend/src/lib/audit-entities.ts](backend/src/lib/audit-entities.ts)), swallows + logs failures so a broken audit row never kills the caller, and mirrors to PostHog as `audit_log_written`. Subscribers that already use it: `order-stage-audit.ts`. Routes that already use it: customer tags/notes CRUD, organisation members add/remove, order watchers, automation rules evaluator.

### CRM marketing-email gate (Phase 5+)
Every marketing-email send path **must** call `shouldSendMarketingEmail({ container, email, customer_id?, template_kind })` from [backend/src/lib/marketing-email.ts](backend/src/lib/marketing-email.ts) before invoking the notification module. Returns `{ ok: false, reason: "consent_false" | "suppressed_global" | "suppressed_stream" | "no_email" }` to block, `{ ok: true }` to proceed. Composes a `customer.metadata.marketing_consent_email` check with the (Phase 8) `email_suppression` table — the suppression check is gated by `EMAIL_SUPPRESSION_TABLE_ENABLED` so this helper is safe to deploy before the table exists. Emits `marketing_email_skipped` PostHog event on block so the dashboard can surface "we skipped N emails today due to X". `template_kind` is one of `cart_reminder | reorder_reminder | winback | monthly_digest | nps_request`.

### Quote expiry cron (Phase 5)
[backend/src/jobs/expire-quotes.ts](backend/src/jobs/expire-quotes.ts) runs daily at 23:45 UTC. Walks `quote.status = "quoted"` rows whose `expires_at` is past and transitions them to `"expired"`, appending a `QuoteEvent` (`type: status_changed`) and an `audit_log` row. Opt-in via `QUOTE_EXPIRY_CRON_ENABLED=true`. Selection logic lives in [backend/src/services/quote/expire.ts](backend/src/services/quote/expire.ts) as a pure function so it can be unit-tested without the DB.

### Customer & order ownership (Phase 6)
Every customer and every order can have an "owner" (a Medusa admin User). Owner inheritance: when an order is placed, the `order-placed-stamp-owner` subscriber copies the customer's existing owner; if the customer has no owner, it falls back to `pickNextOwner()` (rotation-based) and stamps both the customer and order with the picked user. Gated by `OWNER_AUTOSTAMP_ENABLED=true`.

| Component | Path |
| --- | --- |
| Assignment entity | [backend/src/modules/admin-workspace/models/crm-owner-assignment.ts](backend/src/modules/admin-workspace/models/crm-owner-assignment.ts) |
| Rotation entity | [backend/src/modules/admin-workspace/models/crm-owner-rotation.ts](backend/src/modules/admin-workspace/models/crm-owner-rotation.ts) |
| Migration | [backend/src/modules/admin-workspace/migrations/Migration20270101000000.ts](backend/src/modules/admin-workspace/migrations/Migration20270101000000.ts) |
| Customer↔owner link (isList:false) | [backend/src/links/customer-owner.ts](backend/src/links/customer-owner.ts) |
| Order↔owner link (isList:false) | [backend/src/links/order-owner.ts](backend/src/links/order-owner.ts) |
| Helpers (setOwner / getOwner / clearOwner / pickNextOwner) | [backend/src/lib/crm-owners.ts](backend/src/lib/crm-owners.ts) |
| Admin REST — customer owner | [backend/src/api/admin/customers/[id]/owner/route.ts](backend/src/api/admin/customers/[id]/owner/route.ts) |
| Admin REST — order owner | [backend/src/api/admin/orders/[id]/owner/route.ts](backend/src/api/admin/orders/[id]/owner/route.ts) |
| Admin REST — rotation CRUD | [backend/src/api/admin/rotation/route.ts](backend/src/api/admin/rotation/route.ts) |
| Auto-stamp subscriber | [backend/src/subscribers/order-placed-stamp-owner.ts](backend/src/subscribers/order-placed-stamp-owner.ts) |
| Customer owner widget | [backend/src/admin/widgets/customer-owner.tsx](backend/src/admin/widgets/customer-owner.tsx) |
| Order owner widget | [backend/src/admin/widgets/order-owner.tsx](backend/src/admin/widgets/order-owner.tsx) |
| Owner picker (reusable) | [backend/src/admin/components/owner-picker.tsx](backend/src/admin/components/owner-picker.tsx) |
| Rotation admin page | [backend/src/admin/routes/rotation/page.tsx](backend/src/admin/routes/rotation/page.tsx) |

**Rotation algorithm**: enabled rows are picked in order of oldest `last_picked_at` (or null = never picked) first, with `position` as tiebreaker. The picked row's `last_picked_at` is updated on each pick so subsequent calls rotate fairly. Toggling `enabled=false` pauses a teammate without losing rotation history (re-enabling resumes where they left off).

**Manual assignment always wins over rotation**. Setting an owner via the widgets or REST API never gets overridden by the subscriber — the subscriber only acts when the order has no existing owner.

**Quote `assigned_to`** is a parallel concept (the staff person responding to a quote) — separate from the customer/order owner. Phase 6 doesn't unify them; that's deferred to a follow-up because quote workflows can legitimately have a different person from the long-term account owner.

### Tasks system (Phase 7)
Staff to-do list. Each task has a single assignee, optional anchors (customer / order / quote / organisation), due_at, priority, status. Visible at `/app/tasks` with three buckets — Today / Overdue / All — filtered to the logged-in admin via `req.auth_context.actor_id`. Daily 09:00 UTC cron writes audit + PostHog events for tasks that stay overdue (delivery to email/Slack is deferred to a follow-up).

| Component | Path |
| --- | --- |
| Module + service | [backend/src/modules/task/](backend/src/modules/task/) |
| Model | [backend/src/modules/task/models/task.ts](backend/src/modules/task/models/task.ts) |
| Migration | [backend/src/modules/task/migrations/Migration20270201000000.ts](backend/src/modules/task/migrations/Migration20270201000000.ts) |
| Module registration | [backend/medusa-config.js](backend/medusa-config.js) (look for `./src/modules/task`) |
| Customer↔tasks link (isList:true) | [backend/src/links/customer-tasks.ts](backend/src/links/customer-tasks.ts) |
| Order↔tasks link (isList:true) | [backend/src/links/order-tasks.ts](backend/src/links/order-tasks.ts) |
| Quote↔tasks link (isList:true) | [backend/src/links/quote-tasks.ts](backend/src/links/quote-tasks.ts) |
| Organisation↔tasks link (isList:true) | [backend/src/links/organisation-tasks.ts](backend/src/links/organisation-tasks.ts) |
| Admin REST — list + create | [backend/src/api/admin/tasks/route.ts](backend/src/api/admin/tasks/route.ts) |
| Admin REST — task detail | [backend/src/api/admin/tasks/[id]/route.ts](backend/src/api/admin/tasks/[id]/route.ts) |
| Admin REST — my queue | [backend/src/api/admin/tasks/mine/route.ts](backend/src/api/admin/tasks/mine/route.ts) |
| Selection logic (pure) | [backend/src/services/tasks/build-candidates.ts](backend/src/services/tasks/build-candidates.ts) |
| Overdue cron | [backend/src/jobs/notify-overdue-tasks.ts](backend/src/jobs/notify-overdue-tasks.ts) |
| Admin page | [backend/src/admin/routes/tasks/page.tsx](backend/src/admin/routes/tasks/page.tsx) |

**Statuses**: `open | in_progress | done | cancelled`. Setting status to `done` or `cancelled` stamps `completed_at` + `completed_by`; flipping back clears them.

**Priorities**: `low | normal | high | urgent` — rendered as coloured badges in the admin page.

**Idempotency for overdue notification**: each task has a `last_overdue_notified_at` column. The cron skips rows that have been notified within the past 23h (one-per-day cadence). Selection logic is a pure function — `selectOverdueForNotification(rows, now)` — tested without the DB.

**Denormalised anchor columns alongside module links** (CLAUDE.md convention): `task.customer_id` / `order_id` / `quote_id` / `organisation_id` are FK strings indexed for the hot-path "my open tasks where customer_id = X" filter. The links layer graph-query traversal (`customer.tasks`) on top for admin widgets.

**Email/Slack delivery + per-context create-task widgets** are deferred to a Phase 7 follow-up. Studio dashboard `tasks_due_today` bucket is also deferred.

### Marketing email compliance (Phase 8)
Centralised opt-out + one-click unsubscribe. Every marketing send path (cart-reminder, reorder-reminder, winback, nps-request) now passes through `shouldSendMarketingEmail()` from [backend/src/lib/marketing-email.ts](backend/src/lib/marketing-email.ts), which composes a `customer.metadata.marketing_consent_email` check with the suppression table.

| Component | Path |
| --- | --- |
| Suppression entity | [backend/src/modules/admin-workspace/models/email-suppression.ts](backend/src/modules/admin-workspace/models/email-suppression.ts) |
| Migration | [backend/src/modules/admin-workspace/migrations/Migration20270301000000.ts](backend/src/modules/admin-workspace/migrations/Migration20270301000000.ts) |
| Signed-token helper | [backend/src/lib/unsubscribe-token.ts](backend/src/lib/unsubscribe-token.ts) |
| Public unsubscribe endpoint | [backend/src/api/email/unsubscribe/route.ts](backend/src/api/email/unsubscribe/route.ts) |
| Admin REST — list / add | [backend/src/api/admin/email-suppressions/route.ts](backend/src/api/admin/email-suppressions/route.ts) |
| Admin REST — remove | [backend/src/api/admin/email-suppressions/[id]/route.ts](backend/src/api/admin/email-suppressions/[id]/route.ts) |
| Reorder-reminder gate (new) | [backend/src/services/reorder-reminders/send-reminders.ts](backend/src/services/reorder-reminders/send-reminders.ts) |
| NPS gate (new) | [backend/src/services/nps-requests/send-requests.ts](backend/src/services/nps-requests/send-requests.ts) |
| Abandoned-cart gate (belt-and-braces) | [backend/src/services/abandoned-cart-reminders/send-reminders.ts](backend/src/services/abandoned-cart-reminders/send-reminders.ts) |
| Winback gate (belt-and-braces) | [backend/src/services/churn-queue/send-winback.ts](backend/src/services/churn-queue/send-winback.ts) |

**Unsubscribe link shape**: `${BACKEND_URL}/email/unsubscribe?email=<lowered>&kind=<template_kind|all>&sig=<hex16>`. The signature is HMAC-SHA256 over `${email}:${kind}` keyed by `UNSUBSCRIBE_LINK_SECRET`, truncated to 16 hex chars. Same pattern as the NPS link signer.

**Suppression scope**:
- `template_kind = null` → global suppression, blocks every marketing template.
- `template_kind = "winback"` (or another stream key) → per-stream opt-out; the customer still receives other streams.

When a global unsubscribe lands, the public route ALSO flips `customer.metadata.marketing_consent_email = false` so the customer-side preference UI stays consistent.

**Activating the suppression check**: ship the migration, then flip `EMAIL_SUPPRESSION_TABLE_ENABLED=true`. With the flag off, the helper falls back to consent-only and the table is just a passive admin record.

**Footer + List-Unsubscribe header** on existing marketing templates is intentionally deferred to a Phase 8 follow-up — closing the consent gaps on NPS / reorder-reminder + the suppression table + admin surface is the load-bearing compliance work. The template footer that surfaces the URL to recipients comes next.

**Storefront preference center page** is also deferred to a follow-up — for v1 the one-click link writes a global suppression and that's enough opt-out cover.

### Activity timeline (Phase 9)
The `customer-journey` widget now also surfaces `audit_log` rows where `entity = "customer"`. The audit source is rendered as a purple "Activity" badge alongside the existing Order / NPS / Tag / Design / Browse sources. Each source is independently capped at 200 events so high-volume signals (Resend opens/clicks, automation fires) can't crowd out the orders and design history staff actually need.

| Component | Path |
| --- | --- |
| Journey builder (extended) | [backend/src/services/customer-journey/build.ts](backend/src/services/customer-journey/build.ts) |
| Journey widget (purple "Activity" badge) | [backend/src/admin/widgets/customer-journey.tsx](backend/src/admin/widgets/customer-journey.tsx) |
| Action-to-label map | `AUDIT_ACTION_LABEL` in [backend/src/services/customer-journey/build.ts](backend/src/services/customer-journey/build.ts) |

**Friendly titles**: each `AUDIT_ACTION` constant from `lib/audit-entities.ts` gets a short human label (e.g. `tag_added` → "Tag added", `email_suppressed` → "Unsubscribed"). Unknown actions fall back to the raw verb with underscores converted to spaces, so adding a new `AUDIT_ACTION` in `lib/audit-entities.ts` immediately surfaces on the timeline without a follow-up commit to `AUDIT_ACTION_LABEL`.

**Resend webhook for email opens/clicks** + **organisation activity tab** are deferred to a Phase 9 follow-up. The customer-side audit feed is the load-bearing improvement; per-org timelines + email-engagement signals are nice-to-have add-ons.

### Automation rules expansion (Phase 10)
The automation-rules framework gets 2 new triggers and 2 new actions, gated by `AUTOMATION_EXPANDED_TRIGGERS_ENABLED=true` so existing rules stay unchanged until staff opt in.

**New triggers**:
- `customer.created` — fires when a new customer is created (signup or admin-created). Conditions: `email`, `has_account`.
- `order.delivered` — fires on `order.production_stage_changed` with `to_stage = "delivered"`. Conditions: `total`, `currency_code`, `from_stage`, `lifetime_value`, `order_count`.

**New actions**:
- `create_task` — creates a Phase 7 task. `assignee_user_id` can be a Medusa user ID or the literal `"owner"` sentinel (resolves to the entity's customer owner → order owner at fire time). Optional `due_offset_days`, `priority`, `body`.
- `assign_owner` — calls Phase 6 `setOwner()`. Targets `entity: customer` or `entity: order`.

| Component | Path |
| --- | --- |
| New triggers (subscribers) | [backend/src/subscribers/automation-on-customer-created.ts](backend/src/subscribers/automation-on-customer-created.ts), [backend/src/subscribers/automation-on-order-delivered.ts](backend/src/subscribers/automation-on-order-delivered.ts) |
| Action `create_task` + `assign_owner` | [backend/src/services/automation-rules/evaluate.ts](backend/src/services/automation-rules/evaluate.ts) |
| Admin UI (new TRIGGER_LABELS / TRIGGER_FIELDS / ACTION_LABELS entries) | [backend/src/admin/routes/automation-rules/page.tsx](backend/src/admin/routes/automation-rules/page.tsx) |

**Useful rule recipes**:
- `customer.created` → `assign_owner` (entity=customer, user_id=…) — manual override of the rotation pick for VIP signups.
- `order.placed` + `lifetime_value gte 5000` → `create_task` (assignee="owner", title="VIP — call to thank", due_offset_days=1) — outbound follow-up on big orders.
- `order.delivered` → `create_task` (assignee="owner", title="Send NPS request", due_offset_days=3) — handle review chase manually rather than via the lifecycle cron.
- `customer.created` → `tag_customer` (label="new_customer", color="teal") — flag new accounts for the segmentation reports.

**Remaining triggers + actions from the original plan** — `quote.created/accepted/lost`, `order.refunded`, `order.shipment_created`, `organisation.member_added` triggers + `send_customer_email` / `add_to_customer_group` / `add_organisation_member` actions — are deferred to a Phase 10 follow-up. The above 2+2 covers the highest-value rule patterns; the rest layer in cleanly once these are battle-tested.

### Quote→Order auto-conversion + Stale-order escalation (Phase 11)
Closes two loops that were previously manual:

**Quote → Order conversion.** When an order lands that originated from an accepted quote (correlated via `cart.metadata.quote_id` ↔ `quote.metadata.cart_id`), the `quote-on-order-placed` subscriber stamps `quote.metadata.order_id`, transitions the quote to `accepted` if it isn't already, appends a `QuoteEvent` (`type: status_changed`), and writes audit rows on both the quote and customer entities. Idempotent — re-firing finds `metadata.order_id` already set and no-ops.

Cancellation handling **never reverts the quote** (per the planning decision). The `quote-on-order-cancelled` subscriber appends a `QuoteEvent` note + writes an audit row; staff must create a new quote if the customer wants to re-order.

**Stale-order escalation.** The existing daily 08:00 UTC `scan-stale-orders` cron now also calls `notifyStaleOrders()`:
1. Look up the order's owner (or the customer's owner as fallback)
2. Create a Phase 7 Task assigned to the owner ("Investigate stale order #N", due in 1 day, priority `high` or `urgent` after 7 days stale)
3. Write audit + emit `stale_order_notified_owner` PostHog event
4. If `days_in_stage ≥ STALE_ORDER_ESCALATION_DAYS` AND `STALE_ORDER_MANAGER_EMAIL` is set, stamp `order.metadata.stale_escalated_at` (once-per-streak), write audit, emit `stale_order_escalated_to_manager`

| Component | Path |
| --- | --- |
| Conversion subscriber | [backend/src/subscribers/quote-on-order-placed.ts](backend/src/subscribers/quote-on-order-placed.ts) |
| Cancellation subscriber | [backend/src/subscribers/quote-on-order-cancelled.ts](backend/src/subscribers/quote-on-order-cancelled.ts) |
| Stale-order notify side-effects | [backend/src/services/stale-orders/notify.ts](backend/src/services/stale-orders/notify.ts) |
| Scan wiring | [backend/src/services/stale-orders/scan.ts](backend/src/services/stale-orders/scan.ts) |
| Cron entrypoint (unchanged schedule) | [backend/src/jobs/scan-stale-orders.ts](backend/src/jobs/scan-stale-orders.ts) |

**Actual email delivery** (to the owner + manager) is intentionally not wired here — the task creation + audit + PostHog signals give staff visible surfacing via `/app/tasks` and the order Activity tab. Proper email templates (`stale-order-owner-alert`, `stale-order-manager-escalation`) ship in a follow-up.

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

## Mobile / responsive conventions

The storefront's Tailwind breakpoint names are **inverted from Tailwind defaults** — `small: 1024px` is iPad-landscape / small-desktop, NOT phone. Reading "small" and assuming "phone" silently ships a desktop layout to every device below 1024px. Before adding responsive classes, check [storefront/tailwind.config.js](storefront/tailwind.config.js) `screens` to confirm what you actually mean.

### Breakpoint cheat sheet

| Key | px | What it covers | Tailwind default equivalent |
| --- | --- | --- | --- |
| `2xsmall` | 320 | Galaxy Fold, iPhone SE 1st gen | — |
| `phone` | 480 | Phone landscape / large phone portrait | — |
| `xsmall` | 512 | (legacy) | — |
| `tablet` | 768 | iPad portrait, foldables opened | Tailwind `md:` |
| `small` | 1024 | iPad landscape, small desktop | Tailwind `lg:` |
| `medium` | 1280 | Desktop | Tailwind `xl:` |
| `large` | 1440 | Large desktop | — |
| `xlarge` / `2xlarge` | 1680 / 1920 | Very large screens | Tailwind `2xl:` |

**Practical rule**: the phone vs. tablet boundary is `tablet:` (768px). The tablet vs. desktop boundary is `small:` (1024px). Most mobile-cleanup work lives between those two.

### Picking the right tool

- **Visual-only branches** (different padding, columns, font sizes for phone vs. desktop): write Tailwind classes directly, e.g. `grid-cols-1 phone:grid-cols-2 tablet:grid-cols-3 small:grid-cols-4`. SSR-safe, zero JS.
- **Conditional rendering of the same content**: use `<MobileOnly>` / `<DesktopOnly>` from [storefront/src/modules/layout/components/responsive/](storefront/src/modules/layout/components/responsive/index.tsx). Renders both branches in the DOM and hides one via CSS — no hydration flash.
- **Different component trees per breakpoint** (e.g. `<Drawer>` on phone vs. `<Popover>` on desktop): use `useIsPhone()` / `useIsTablet()` / `useIsDesktop()` from [storefront/src/lib/hooks/use-breakpoint.tsx](storefront/src/lib/hooks/use-breakpoint.tsx). Accept the first-render flash (hook returns `false` on SSR) by defaulting to the desktop branch — phone users get a brief desktop render that flips to the mobile component on hydration.
- **Custom media query**: `useMediaQuery("(prefers-reduced-motion: reduce)")` from [storefront/src/lib/hooks/use-media-query.tsx](storefront/src/lib/hooks/use-media-query.tsx). Same SSR-safety tradeoff.

### Touch-target rule

All interactive elements (buttons, links, icon buttons, accordion triggers) need a minimum `44 × 44` px hit area on phone — iOS guideline, also the de-facto Android standard. Apply via `min-h-11 min-w-11` (or `min-h-12 min-w-12` if there's room). Don't rely on padding alone — `cursor-pointer` on a `<div>` is almost always a bug; use `<button>` or `<a>` with explicit min size.

### Safe-area-inset

Sticky bottom bars (cart CTA, customizer toolbar, mobile nav) must respect the iOS home-indicator using `padding-bottom: calc(<base> + env(safe-area-inset-bottom))`. Reference: [storefront/src/modules/products/components/mobile-customize-cta.tsx](storefront/src/modules/products/components/mobile-customize-cta.tsx) — the inline style on the wrapper is the canonical pattern.

### Don't reach for these

- `useEffect` + `window.innerWidth` polling — `useMediaQuery` handles this correctly.
- Server-side device detection (UA sniffing) — modern responsive CSS handles every device we care about.
- Separate `/m/` mobile routes — would fragment SEO and double the maintenance surface.

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
| `CustomizerGuide` | `components/customizer-guide.tsx` | 4-step coach-mark tour with spotlight overlay; emits `guide_started` / `guide_step_advanced` / `guide_completed` to PostHog |
| `CanvasStage` | `components/canvas-stage.tsx` | Fabric.js canvas wrapper with drag/drop, paste, file upload |
| `CustomizerProductPicker` | `components/customizer-product-picker.tsx` | Step 1 product picker (variant + options); portal-rendered to escape transform containing block |
| `DecorationMethodPicker` | `components/decoration-method-picker.tsx` | Method (print / embroidery / sticker) selector for multi-decoration flows |
| `EmbroiderySideConfig` | `components/embroidery-side-config.tsx` | Embroidery-specific layout config (different area model from print) |
| `ManagementPanel` | `components/management-panel.tsx` | "Manage artwork" panel — duplicate / delete sides |
| `LineItemDesignPreview` | `components/line-item-design-preview.tsx` | Order-history line-item design render |
| `LineItemMockupPreview` | `components/line-item-mockup-preview.tsx` | Order-history mockup render |
| `MassApplyDialog` | `components/mass-apply-dialog/` | Bulk apply artwork / size across multiple lines (centred overlay dialog) |
| `LowResolutionModal` | `components/low-resolution-modal.tsx` | Phase 4 DPI warning + vectorization upsell modal |

**Coach-mark gotcha**: `CustomizerGuide` uses `useLayoutEffect` + scheduled `getBoundingClientRect()` calls (0 / 150 / 350 / 550 ms) to track spotlight position during layout shifts. Portal-renders the spotlight + tooltip to avoid z-index issues, and the picker modal portals to body for the same reason.

### Canvas ↔ wizard data flow

1. Customer places artwork → Fabric.js fires `object:added/modified` → `onCanvasModified` updates `sideLayoutsRef` and recalculates `decoratedSides`.
2. Customer picks a print size in Step 3 → `setSelectedPrintArea(area)` + `setPdpStep3Done(true)`.
3. "Add to cart" → `buildCustomizerMetadataBase()` serialises all sides from `sideLayoutsRef` + `selectedPrintArea` + `activeSide` into a `CustomizerMetadata` v2 object, which is stored on the cart line's `metadata`.
