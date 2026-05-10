<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of your Medusa v2 backend with PostHog analytics. The integration covers the full customer journey — from customizer usage and cart adds, through order placement and supplier fulfilment, to design library management and customer acquisition signals.

A singleton `posthog-node` client (`src/lib/posthog.ts`) is initialised lazily from `POSTHOG_API_KEY` / `POSTHOG_HOST` environment variables and shared across all route handlers and subscribers. The client includes `enableExceptionAutocapture: true` and shuts down gracefully on `SIGTERM`/`SIGINT` so no queued events are lost on deploy.

Customer identification runs in `src/subscribers/order-placed.ts`: when an order is placed the subscriber calls `posthog.identify()` with the customer's Medusa ID as `distinctId`, setting their email and `first_order_id` so all server-side events can be correlated.

13 events are tracked across 11 files:

| Event name | Description | File |
|---|---|---|
| `order placed` | Customer completed checkout — includes total, currency, item count, user identification | `src/subscribers/order-placed.ts` |
| `scp line item added` | DTF print item added to cart with server-computed price, print size, and tier | `src/api/store/carts/[id]/scp-line-items/route.ts` |
| `embroidery line item added` | Embroidery item added to cart with stitch count, placement, and pricing tier | `src/api/store/carts/[id]/embroidery-line-items/route.ts` |
| `original file uploaded` | Customer uploaded artwork in the customizer (mime type + file size) | `src/api/store/customizer/upload-original/route.ts` |
| `design saved` | Customer saved a design to their My Designs library | `src/api/store/customers/me/designs/route.ts` |
| `design updated` | Customer updated a saved design's name, thumbnail, or metadata | `src/api/store/customers/me/designs/[id]/route.ts` |
| `design deleted` | Customer deleted a saved design | `src/api/store/customers/me/designs/[id]/route.ts` |
| `production stage changed` | Admin moved a single order to a new production stage | `src/api/admin/orders/[id]/production-stage/route.ts` |
| `bulk production stage changed` | Admin moved multiple orders to the same production stage in one action | `src/api/admin/orders/bulk/production-stage/route.ts` |
| `order sent to ascolour` | Admin dispatched a Medusa order to AS Colour for dropship fulfilment | `src/api/admin/orders/[id]/send-to-ascolour/route.ts` |
| `site searched` | Customer submitted a search query on the storefront | `src/api/store/search-events/route.ts` |
| `contact form submitted` | Customer submitted the contact form | `src/api/contact/route.ts` |
| `newsletter subscribed` | New email subscribed to the newsletter | `src/api/newsletter/route.ts` |

## Next steps

We've built a dashboard and 5 insights to monitor key business metrics:

- [Analytics basics dashboard](/dashboard/1566925)
- [Orders placed over time](/insights/qVwGTt17) — weekly order volume trend
- [Customizer-to-order conversion funnel](/insights/4fxGx3E9) — drop-off between cart add and order completion
- [Customizer activity](/insights/EJCnU8p1) — file uploads, DTF adds, and embroidery adds per week
- [Design library activity](/insights/mOkAxmu5) — saves, updates, and deletes in My Designs
- [Customer acquisition signals](/insights/jAJ80ps1) — newsletter subscriptions and contact form submissions per week

---

## Storefront integration (Next.js App Router)

A second pass added client-side PostHog tracking to the storefront. PostHog was already initialised via `PostHogProvider` (at `storefront/src/modules/common/components/posthog-provider/index.tsx`) and user identification was wired up via `PostHogIdentify` on the account layout. `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` have been written to `storefront/.env.local`.

6 additional events are tracked across 4 storefront files:

| Event name | Description | File |
|---|---|---|
| `order_completed` | Fires on the order confirmation page after a successful purchase, alongside the GA4 purchase event | `storefront/src/modules/order/components/purchase-tracker/index.tsx` |
| `design_deleted` | Customer successfully deleted a saved design from My Designs | `storefront/src/modules/account/components/designs-grid/index.tsx` |
| `design_renamed` | Customer successfully renamed a saved design in My Designs | `storefront/src/modules/account/components/designs-grid/index.tsx` |
| `reorder_design_clicked` | Customer clicked "Re-order design" to reopen a previous design in the customizer | `storefront/src/modules/order/components/reorder-actions/index.tsx` |
| `reorder_garment_clicked` | Customer clicked "Re-order garment" to navigate to the blank product page | `storefront/src/modules/order/components/reorder-actions/index.tsx` |
| `payment_initiated` | Stripe payment form submitted — fired before success or error | `storefront/src/modules/checkout/components/payment-button/index.tsx` |

A second "Analytics basics" dashboard covers the storefront events:

- [Analytics basics dashboard](/dashboard/1566953)
- [Checkout conversion funnel](/insights/eeVwrVrb) — design started → added to cart → payment initiated → order completed
- [Orders completed over time](/insights/uSHnX3Qs) — daily order completions
- [Payment errors](/insights/577yyi5Y) — payment errors by gateway
- [Vectorization upsell funnel](/insights/xhzCsR71) — low-DPI modal shown → vectorization accepted
- [Reorder activity](/insights/Tb2baHOg) — re-order design vs. re-order garment clicks per week

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/` and `.claude/skills/integration-nextjs-pages-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
