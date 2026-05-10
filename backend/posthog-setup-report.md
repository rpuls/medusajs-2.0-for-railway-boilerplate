<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the SC Prints Medusa backend. A singleton `posthog-node` client (`src/lib/posthog.ts`) is initialised lazily from `POSTHOG_API_KEY` / `POSTHOG_HOST` environment variables and shared across all route handlers and subscribers. The client shuts down gracefully on `SIGTERM`/`SIGINT` so no queued events are lost on deploy.

Customer identification runs in `src/subscribers/order-placed.ts`: when an order is placed the subscriber calls `posthog.identify()` with the customer's Medusa ID as `distinctId` and their email as a person property, so all server-side events for that customer can be correlated with future front-end sessions.

Eleven events are tracked across nine files:

| Event name | Description | File |
|---|---|---|
| `contact form submitted` | Customer submitted the contact form successfully | `src/api/contact/route.ts` |
| `newsletter subscribed` | New email subscribed to the newsletter | `src/api/newsletter/route.ts` |
| `abandoned cart captured` | Abandoned-cart email captured (with or without customer notification) | `src/api/abandoned-cart/route.ts` |
| `scp line item added` | DTF-print garment added to cart with server-computed SCP pricing | `src/api/store/carts/[id]/scp-line-items/route.ts` |
| `embroidery line item added` | Embroidery garment added to cart with server-computed pricing | `src/api/store/carts/[id]/embroidery-line-items/route.ts` |
| `design saved` | Customer saved a design to My Designs | `src/api/store/customers/me/designs/route.ts` |
| `design deleted` | Customer deleted a saved design | `src/api/store/customers/me/designs/[id]/route.ts` |
| `original file uploaded` | Customer uploaded artwork in the customizer | `src/api/store/customizer/upload-original/route.ts` |
| `production stage changed` | Admin updated the production stage for an order | `src/api/admin/orders/[id]/production-stage/route.ts` |
| `order placed` | Order placed — tracked in the `order.placed` subscriber with customer identify | `src/subscribers/order-placed.ts` |
| `shipstation shipment shipped` | ShipStation webhook confirmed a shipment and created an order shipment | `src/api/hooks/shipstation/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behaviour, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1566128)
- [Orders placed (last 30 days)](/insights/tSESjHAc)
- [Customizer → Order conversion funnel](/insights/4c18YemZ)
- [Abandoned carts vs orders placed](/insights/t5WnBYMS)
- [Designs saved (last 30 days)](/insights/UqIwgAI0)
- [Lead generation — newsletter & contact form](/insights/pevVyQdR)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
