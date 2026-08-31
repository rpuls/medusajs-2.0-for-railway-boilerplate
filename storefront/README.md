<h1 align="center">
  Storefront
</h1>

<p align="center">
The Next.js storefront of this Railway deploy template, based on the official Medusa Next.js starter.<br>
For deployment instructions and the full stack overview, see the <a href="../README.md">main README</a>.</p>

<p align="center">
  <sub>An independent project, not affiliated with MedusaJS, Inc. For questions about Medusa itself, see the <a href="https://docs.medusajs.com/">official documentation</a>.</sub>
</p>

---

Next.js 15 (App Router, React 19), Tailwind CSS, TypeScript, and the Medusa JS
SDK. Product pages, cart, guest and account checkout, order history, addresses,
discount codes, MeiliSearch product search, and Stripe card payments.

## Running it

You need the backend running on port 9000 first. It holds the products, and it
is also where the storefront gets its publishable API key from.

```bash
cd storefront
cp .env.local.template .env.local
pnpm install
pnpm dev                    # http://localhost:8000
```

**pnpm only.** The build scripts call pnpm directly, so an npm or yarn install
gets you a tree that works locally and a deploy that fails.

`pnpm dev` does not run `next dev` directly. It runs `await-backend` and then
`launch-storefront`, which fetches the publishable key from the backend's
`/key-exchange` endpoint and injects it into the child process. Same for
`pnpm build` and `pnpm start`. That is why the backend has to be up first, and
why `next build` on its own fails with a missing
`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

To reproduce a Railway deploy locally, which is the only honest way to test
caching and prerendering behaviour:

```bash
pnpm build && pnpm start     # http://localhost:8000
```

## Configuration

Every variable is documented inline in
[`.env.local.template`](.env.local.template). The four that matter most:

| Variable | What it does |
| -------- | ------------ |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Where the backend is. |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Required. The storefront refuses to start without it. Fetched automatically on Railway. |
| `NEXT_PUBLIC_STORE_NAME` | Your shop's name, in the nav, footer, checkout header, page titles and legal copy. Defaults to the placeholder "Your Store". |
| `NEXT_PUBLIC_DEFAULT_REGION` | Country code used when the visitor's own region cannot be determined. Must be a country one of your Medusa regions covers. `gb` matches the seeded store. |

Optional: `NEXT_PUBLIC_STRIPE_KEY` (without it the payment step shows a
configuration message instead of a card form), `NEXT_PUBLIC_MEDIA_HOSTNAME`
(the host your product images are served from), the `NEXT_PUBLIC_SEARCH_*`
group, and `NEXT_PUBLIC_FEATURE_SEARCH_DISABLED=true` to hide the search entry
point.

**PayPal is half-wired on purpose.** The button, icon and payment wrapper are
all here, and `isPaypal()` matches a provider id starting with `pp_paypal`. But
this template registers no PayPal provider on the backend, so no such payment
session is ever created and the button cannot render. Install and register a
PayPal provider in `backend/medusa-config.js`, then set
`NEXT_PUBLIC_PAYPAL_CLIENT_ID`. Nothing in the storefront needs changing.

## Testing

`qa/` is a Playwright suite that drives a real browser against a running stack.
It is the main safety net in this repo. See [qa/README.md](qa/README.md).

```bash
pnpm test:qa                 # whole suite
pnpm test:qa:ui              # pick tests interactively
pnpm typecheck && pnpm lint
```

Run it against `pnpm build && pnpm start` as well as `pnpm dev`. Dev mode barely
caches and renders everything dynamically, which hides a whole class of defect.

The `e2e/` directory is inherited from the upstream starter, targets Medusa v1
endpoints and does not run. Ignore it.

## Structure

```
src
├── app          Next.js App Router routes and layouts
├── lib          data fetching, cookies, utils, config
├── modules      components, templates and server actions, grouped by section
├── styles       Tailwind entry point and a few global classes
├── types        shared TypeScript types
└── middleware.ts
```

### Routing

Everything lives under `app/[countryCode]/`. The country code is a real path
segment, so `/gb/store` and `/de/store` are different pages with different
regions, currencies and prices. Inside it there are two route groups:
`(checkout)`, which has its own stripped-down layout, and `(main)` for
everything else. Route groups do not appear in the URL.

`middleware.ts` puts the country code there. Its order of preference is:

1. a country code already in the URL that one of your regions covers
2. `x-vercel-ip-country`, which only exists on Vercel and is inert on Railway
3. `NEXT_PUBLIC_DEFAULT_REGION`
4. the first country of the first region, with a console warning naming the
   misconfiguration, because landing a shopper on an arbitrary currency
   silently is worse than saying so

It also issues the `_medusa_cache_id` cookie that scopes Next cache tags per
visitor, and forwards a `cart_id` query parameter into a cookie so payment
provider redirects land back on the checkout.

### Data layer

`lib/data/` holds one file per resource. Reads go through `sdk.client.fetch`
rather than the `sdk.store.*` helpers, and that is deliberate: the helpers'
last parameter is **headers**, not fetch options, so `{ next: { tags: [...] } }`
passed there is serialised into an HTTP header literally named `next` and never
reaches Next.js. The SDK's own types bless the broken shape, which is why it
typechecks and why the bug is easy to reintroduce. If you add a cached read,
copy an existing one rather than reaching for `sdk.store.*`.

Cache tags are suffixed with the visitor's `_medusa_cache_id`, so one shopper
revalidating their cart does not purge everyone else's. `getCacheTag` and
`getCacheDirectives` in `lib/data/cookies.ts` do that.

## How this differs from the upstream starter

This is a snapshot of [medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa)
with fixes and additions on top. Worth knowing before you port something across:

- **Search is kept.** Upstream removed it. MeiliSearch is wired through
  `@meilisearch/instant-meilisearch` and `react-instantsearch`.
- **The v1 onboarding flow is deleted.** Upstream still ships it; it linked to
  `http://localhost:7001`, the standalone Medusa v1 admin, which does not exist
  in 2.x.
- **A launcher wraps every script**, to fetch the publishable key and the
  MeiliSearch search key at boot.
- **Not adopted from upstream:** order transfer, localization, the cart
  mismatch banner and the free-shipping nudge.

When fixing something here, check upstream first and prefer taking their
version verbatim. Every local divergence is something to hand-merge on the next
upgrade.

## Resources

- [Medusa documentation](https://docs.medusajs.com/)
- [Next.js documentation](https://nextjs.org/docs)
- [Main README](../README.md) for deployment and the rest of the stack
