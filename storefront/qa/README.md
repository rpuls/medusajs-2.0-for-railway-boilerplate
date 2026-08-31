# QA smoke suite

End-to-end tests that run against a stack you already have running, covering
the storefront and the Medusa admin dashboard.

```bash
docker compose up -d                      # postgres, redis, meilisearch, minio
cd backend    && pnpm ib && pnpm dev      # http://localhost:9000
cd storefront && pnpm dev                 # http://localhost:8000

cd storefront && pnpm test:qa             # run it
cd storefront && pnpm test:qa:ui          # or pick tests interactively
cd storefront && pnpm test:qa:watch       # or watch a real browser drive it
```

## Watching it

`pnpm test:qa:ui` is the one to reach for: a test list, a live browser pane,
a DOM snapshot at every step, and scrubbing back and forth through a run.

`pnpm test:qa:watch` runs headed. The config slows to 400ms between actions
whenever it sees `--headed`, because at full speed there is nothing an eye can
follow. `QA_SLOW_MO=800` to go slower, `QA_SLOW_MO=0` for headed at full speed.

All 86 tests headed is a long sit, so narrow it:

```bash
pnpm test:qa:watch qa/01-storefront.spec.ts   # the example hero
pnpm test:qa:watch qa/12-mobile.spec.ts       # phone viewport, sticky bar, sheet
pnpm test:qa:watch qa/05-checkout.spec.ts     # a full guest order
```

The HTML report lands in `storefront/qa-report/` (gitignored).

## Why this is separate from `playwright.config.ts`

That suite is inherited from the Medusa starter. It drives a dedicated
`test_medusa_db`, creating and dropping a template database between runs, so it
needs its own postgres role, its own backend pointed at that database, and an
`e2e/.env`. Its `e2e/.env.example` also disagrees with `docker-compose.yml`
(`PGPASSWORD=password` vs `postgres`, `medusa_db` vs `medusa`) and its
`webServer.command` is `yarn start`. It has never been adapted to this
template.

This suite talks to no database directly, so it works on a stock
docker-compose setup and against a deployed store.

## Configuration

`qa/env.ts` reads `storefront/.env.local`, and real environment variables win,
so CI can override without editing files.

| Variable | Purpose |
|---|---|
| `QA_BASE_URL` | Storefront to test. Defaults to `NEXT_PUBLIC_BASE_URL`, then `http://localhost:8000`. |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Backend, also used to reach the admin at `/app`. |
| `NEXT_PUBLIC_STORE_NAME` | Asserted in the nav, footer and titles. |
| `NEXT_PUBLIC_DEFAULT_REGION` | Country prefix every route is tested under. |
| `MEDUSA_ADMIN_EMAIL` / `MEDUSA_ADMIN_PASSWORD` | Admin dashboard sign-in. |
| `NEXT_PUBLIC_STRIPE_KEY` | Presence alone decides whether checkout is expected to show a card form. |
| `STRIPE_API_KEY` | Optional. Lets `13-payment` confirm the charge with Stripe instead of trusting the confirmation page. |
| `RESEND_API_KEY` | Optional. Lets `14-email` and `15-password-reset` read the sent message back from Resend. Both skip without it. |

`node local-tools/qa-remote.mjs` fills all of these in from a deployed Railway
project, so a run against a real deploy needs no copying by hand.

## Test data

Mostly the stock seed. Two extras:

- **Promotions.** `qa/08-discounts.spec.ts` needs two active fixed-amount
  promotions, `QAFIVE` and `QATEN`. It skips itself when they are missing.
  Create them in the admin, or over the API, and remember they are created as
  `draft`:

  ```bash
  curl -X POST $BACKEND/admin/promotions -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"code":"QAFIVE","type":"standard","is_automatic":false,
         "application_method":{"type":"fixed","target_type":"order",
         "allocation":"across","value":1,"currency_code":"eur"}}'
  curl -X POST $BACKEND/admin/promotions/$ID -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' -d '{"status":"active"}'
  ```

  Keep both amounts well under the cart subtotal. Medusa drops the second
  promotion once the discount would take the order to zero, which looks exactly
  like the stacking bug these tests exist to catch.

- **Accounts and orders.** Registration and checkout specs create real
  customers and real orders. Emails are namespaced per run
  (`qa-<runid>-<n>@example.com`) so repeated runs stay independent. Nothing is
  cleaned up afterwards, because the storefront cannot delete either.

- **One shared, real inbox.** `14-email` and `15-password-reset` both use
  `delivered@resend.dev`, Resend's own test address. They have to send a genuine
  message to read it back, and a fresh `@example.com` address would hard bounce
  on every run and erode the sending domain's reputation.
  `15-password-reset` reuses that one customer account rather than creating a
  new one each run: resetting a password needs neither the old password nor a
  session, so the first run registers it and later runs tolerate the conflict
  and reset it again. Its password therefore changes every run by design.

## Run it against a production build too

Dev mode hides caching and static-generation bugs. Several real defects only
appeared under `next build && next start`, including a 500 on every
`/collections/*` URL. Before shipping:

```bash
cd storefront
pnpm build && pnpm start                    # stop `pnpm dev` first, they share .next
pnpm test:qa
```

`pnpm build` and `pnpm start` go through `launch-storefront`, which fetches the
publishable key from the backend's `/key-exchange` and injects it. Calling
`next build` directly skips that and fails on a missing
`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, so if you want the raw commands, supply
the key yourself:

```bash
export NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$(curl -s http://localhost:9000/key-exchange | jq -r .publishableApiKey)
pnpm build:next && npx next start -p 8000
```

## Files

| File | Covers |
|---|---|
| `01-storefront` | region redirect, store name, hero, nav, footer |
| `02-catalogue` | store listing, sorting, product page, related products, 404s |
| `03-account` | register, session persistence, sign in and out, profile |
| `04-cart` | add, update quantity, remove, persistence, totals |
| `05-checkout` | full guest order, address validation, missing Stripe key |
| `06-search` | Meilisearch results, empty results, hydration |
| `07-addresses` | address book create, edit, delete |
| `08-discounts` | promotion stacking and removal |
| `09-order-confirmation` | confirmation page, order history, 404 statuses |
| `10-admin` | admin sign-in, products, orders, customers, regions, keys |
| `11-interactive-ui` | Headless UI: menus, modals, dropdowns, radios |
| `12-mobile` | sticky action bar, variant sheet, mobile checkout |
| `13-payment` | a real Stripe card charge, cross-checked against the Stripe API |
| `14-email` | order confirmation email, checked in Medusa and then at Resend |
| `15-password-reset` | the reset flow end to end, token read out of the sent email |
| `16-file-upload` | product media storage: upload, public readability, delete |

The last four reach outside the storefront on purpose. An email, a charge or an
object in a bucket cannot be observed from the browser, and that blind spot is
exactly how "order confirmations have never sent on Railway" survived the entire
2.x line with a green suite. The ones needing a key skip themselves when it is
absent rather than passing quietly.

`16-file-upload` has one assertion worth knowing about in advance: it fetches
the uploaded file **with no credentials**, because that is the condition a
product image has to meet. If your bucket is private, that test goes red and it
is telling the truth. Railway's own buckets were private-only as of July 2026,
so a deploy using one needs a public proxy in front of it.
