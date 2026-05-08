# SC Prints — Medusa.js + Next.js storefront

Custom-print e-commerce platform built on Medusa v2 (`backend/`) and Next.js 15 (`storefront/`). Customers design garments in a Fabric.js canvas, save them to a personal "My Designs" library, re-order from past orders, and see live production status as their job moves through the shop.

## Repo layout

- `backend/` — Medusa v2.12.1 server. Custom modules in `src/modules/`. Custom routes in `src/api/`. Admin widgets in `src/admin/widgets/`. Email templates (Resend) in `src/modules/email-notifications/templates/`.
- `storefront/` — Next.js 15 App Router. Country-code prefixed routes (`[countryCode]`). Customer account dashboard at `account/@dashboard/`. Fabric.js customizer at `/customizer`.
- `scripts/` — Repo-level utilities (CSV transforms + the production-stage sync check).

The two apps are sibling packages, **not** a workspace — separate `node_modules`, separate `tsconfig.json`. Code that needs to live in both must be hand-mirrored (see "Production-stage sync" below).

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
- **Customizer template size** ([storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx)) is ~2750 lines. New canvas-related work should consider whether it can live in a separate component before adding to this file.
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
