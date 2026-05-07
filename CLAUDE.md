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

These are real but non-blocking. Triage when you have a moment:

1. **Vectorization charged twice if customer hits "Add to cart" twice in the same session** — the customizer doesn't check whether the cart already has the vectorization line before adding another. Fix: query cart for an existing line with `metadata.vectorization_for_order: true` before adding.
2. **"Remove" on the vectorization banner doesn't remove an already-added cart line** — only flips local state. Fix: when Remove is clicked, find + delete any matching cart line.
3. **Stage rollback re-emails the customer** — moving from `in_production` back to `awaiting_approval` re-fires the action-required email. Fix: in [order-production-stage-changed.ts](backend/src/subscribers/order-production-stage-changed.ts), suppress emails when `PRODUCTION_STAGES.indexOf(to) <= PRODUCTION_STAGES.indexOf(from)`.
4. **Initial orders show no tracker** — the storefront stepper hides until staff sets a stage. Fix: extend [order-placed.ts](backend/src/subscribers/order-placed.ts) to set `metadata.production_stage = "received"` automatically.
5. **Hydration loses the original active side** — the canvas re-opens on `front` regardless of which side was active when saved. Fix: persist `activeSide` in `CustomizerMetadata` at save time and load it during hydration.

## Operational notes

- **MinIO retention is load-bearing for re-order.** If lifecycle policies GC `customer_original_files` URLs, re-order will display fine but **add-to-cart will fail to re-render print PNGs**. Set retention to indefinite for these objects, or move them to a permanent bucket on order placement.
- **Customizer template size** ([storefront/src/modules/customizer/templates/index.tsx](storefront/src/modules/customizer/templates/index.tsx)) is ~2750 lines. New canvas-related work should consider whether it can live in a separate component before adding to this file.
- **Hand-written migration**: the Phase 2 migration ([Migration20260507000000.ts](backend/src/modules/designs/migrations/Migration20260507000000.ts)) was hand-written to match what `npx medusa db:generate designs` produces. If you'd rather have the auto-generated one, delete it and run the generator before `db:migrate`.
