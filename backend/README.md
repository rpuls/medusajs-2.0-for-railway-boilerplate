### local setup
Video instructions: https://youtu.be/PPxenu7IjGM

- `cd /backend`
- `pnpm install` or `npm i`
- Rename `.env.template` ->  `.env`
- To connect to your online database from your local machine, copy `DATABASE_URL` from Fly secrets (`fly secrets list --app sc-prints-backend`) into `.env`. See [Docs/HOSTING.md](../Docs/HOSTING.md).
  - If connecting to a new database, for example a local one, run `pnpm ib` or `npm run ib` to seed the database.
- `pnpm dev` or `npm run dev`

### requirements
- **postgres database** (DigitalOcean in production; local Postgres for dev)
- **redis** (required in production on Fly — set `REDIS_URL`; dev falls back to simulated redis)
- **MinIO-compatible storage** (Cloudflare R2 in production via `MINIO_*`; dev falls back to local `static/`)
- **Meilisearch** (optional; configure `MEILISEARCH_*` or omit)

### Stripe payments

- Add **`STRIPE_API_KEY`** (secret key, `sk_test_...` or `sk_live_...`) and **`STRIPE_WEBHOOK_SECRET`** (`whsec_...`) to `backend/.env`. Both are required for the Payment module to register; restart the backend after changing them.
- Add **`NEXT_PUBLIC_STRIPE_KEY`** (publishable key, `pk_test_...` or `pk_live_...`) to the storefront env and redeploy the storefront. Use the same Stripe mode (test vs live) as the backend.
- **Stripe webhook URL:** `{your-backend-origin}/hooks/payment/stripe_stripe` (production: `https://sc-prints-backend.fly.dev/hooks/payment/stripe_stripe`).
- **Recommended webhook events:** `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.amount_capturable_updated`, and `payment_intent.partially_funded` (when applicable).
- For **local development**, run Stripe CLI: `stripe listen --forward-to localhost:9000/hooks/payment/stripe_stripe`, then set `STRIPE_WEBHOOK_SECRET` to the signing secret the CLI prints.
- Regions must include the **`pp_stripe_stripe`** payment provider for Stripe at checkout. The seed script adds it automatically when both Stripe env vars are set before running migrations/seed; otherwise add Stripe under **Settings → Regions** in Medusa Admin.
- **Smoke-test checkout:** With test keys, complete an order using Stripe’s test card `4242424242424242`, any future expiry, any CVC; confirm the payment appears authorized/captured and the order shows as paid in Admin.

### Stripe Payment Links (admin-created post-order payments)

For deposits, balances, or one-off payments where staff send the customer a hosted Stripe URL **after** the order exists, configure a **second** Stripe webhook endpoint separate from the cart-checkout one above:

- **Endpoint URL:** `{your-backend-origin}/hooks/stripe-payment-link`
- **Subscribe to:** `checkout.session.completed` (and only that — Medusa already handles cart PaymentIntents via the other endpoint)
- **Signing secret env var:** `STRIPE_PAYMENT_LINK_WEBHOOK_SECRET` (`whsec_...`) — distinct from `STRIPE_WEBHOOK_SECRET`. Restart the backend after setting.
- **Local dev:** `stripe listen --forward-to localhost:9000/hooks/stripe-payment-link` and use the printed secret.
- **Admin UI:** the "Stripe payment links" section on each order's detail page (inside the Deposit widget) lets staff create / copy / deactivate links. When a customer pays a link, the webhook auto-records a captured Payment against the order — no manual reconciliation.
- **Provider attribution:** Stripe-Payment-Link captures show up in the Payments section of the order with `provider_id = pp_system_default` (Medusa's internal "manual" provider). The Payment Mix report reads `payment.metadata.real_gateway` to attribute revenue back to Stripe.

### Publishable key endpoint (`/key-exchange`)

The backend exposes **`GET /key-exchange`**, which returns the publishable Store API key titled **Webshop** when present. For production, set **`KEY_EXCHANGE_SECRET`** in `.env` and send it as header **`x-medusa-key-exchange-secret`** (or query **`?secret=`**) on every request; requests without a matching secret receive **401**. If **`KEY_EXCHANGE_SECRET`** is unset, behavior matches older setups (no extra auth).

### shipstation setup
- Add `SHIPSTATION_API_KEY` to `backend/.env` (from your ShipStation API settings).
- ShipStation rate requests need a **complete “ship from” address**. Either fill **Settings → Stock locations** in Medusa Admin (street, city, state, postcode, country, phone), **or** set **`SHIPSTATION_WAREHOUSE_ADDRESS_1`**, **`SHIPSTATION_WAREHOUSE_CITY`**, **`SHIPSTATION_WAREHOUSE_STATE`**, **`SHIPSTATION_WAREHOUSE_POSTCODE`**, **`SHIPSTATION_WAREHOUSE_COUNTRY_CODE`** (e.g. `AU`), and **`SHIPSTATION_WAREHOUSE_PHONE`** on the backend. Postcode + country alone are not enough for ShipStation’s API.
- **Country codes** are normalized to uppercase before calling ShipStation (Medusa may store `au` while env uses `AU`). Mismatched casing previously triggered bogus “international shipment” errors for domestic AU orders.
- Optional **`SHIPSTATION_PACKAGE_LENGTH_CM`**, **`SHIPSTATION_PACKAGE_WIDTH_CM`**, **`SHIPSTATION_PACKAGE_HEIGHT_CM`** override default parcel dimensions used on rate quotes (defaults **40×30×15 cm**).
- Restart the backend after updating env vars so the fulfillment provider is registered.
- In Medusa Admin, create shipping options that use the `shipstation` provider.
- Make sure each shipping option stores both `carrier_id` and `carrier_service_code` in its option data (required by the provider to fetch rates/labels).
- Place a test order and create a fulfillment to verify label purchase + cancellation flows.

### commands

`cd backend/`
`npm run ib` or `pnpm ib` will initialize the backend by running migrations and seed the database with required system data.
`npm run dev` or `pnpm dev` will start the backend (and admin dashboard frontend on `localhost:9000/app`) in development mode.
`pnpm build && pnpm start` will compile the project and run from compiled source. This can be useful for reproducing issues on your cloud instance.
