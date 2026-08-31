# Contributing

Thanks for looking. This template has been deployed a few thousand times, so
small fixes here reach a lot of stores.

## Where to ask what

This matters more than usual, because sending template questions to the wrong
place puts load on a project that has nothing to do with this repository.

- **A deploy that will not come up, or anything about the Railway side**: the
  template's [thread on Railway Station](https://station.railway.com/templates/medusajs-2-0-storefront-c69ac579).
  Other deployers read it, so the answer outlives your question. Most
  deployment trouble is configuration rather than a repo bug, which is why this
  is listed before the issue tracker.
- **A bug in this repo, or a change you want**: open an
  [issue here](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate/issues).
- **Medusa itself**: how a module works, an API's behaviour, the admin
  dashboard, a Medusa bug. That belongs in the
  [official Medusa documentation](https://docs.medusajs.com/) and Medusa's own
  community channels. This is an independent community template and its
  maintainer cannot answer for Medusa, nor should Medusa's volunteers be
  answering for this template.
- **A security problem**: see [SECURITY.md](SECURITY.md). Do not open a public
  issue.

## Setup

**This project is pnpm-only.** The build scripts call pnpm directly
(`backend/src/scripts/postBuild.js` runs `pnpm i --frozen-lockfile` inside the
compiled server), so an npm or yarn install will get you a tree that works
locally and a deploy that fails. Both packages ship a `pnpm-lock.yaml` and
nothing else.

Node 22.12 or later. Both packages carry a `.nvmrc`, so `nvm use` in either
directory picks the right one. The floor is real rather than cautious:
`@medusajs/medusa@2.19` declares `^20.19.0 || >=22.12.0` and the MeiliSearch
plugin declares `>=22`.

```bash
# from the repo root: postgres, redis, meilisearch and a MinIO bucket
docker compose up -d

cd backend
cp .env.template .env      # then read it, the top of the file matters
pnpm install
pnpm ib                    # migrate and seed
pnpm dev                   # backend on :9000, admin on :9000/app

cd ../storefront
cp .env.local.template .env.local
pnpm install
pnpm dev                   # storefront on :8000
```

The storefront needs the backend running: `pnpm dev` waits for it, then fetches
the publishable API key from the backend and injects it.

## Before you open a pull request

```bash
(cd backend && pnpm exec tsc --noEmit)
(cd storefront && pnpm typecheck)
(cd storefront && NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=placeholder pnpm lint)
```

The placeholder on the lint line is not optional and not a workaround. `next lint`
loads `next.config.js`, which calls `checkEnvVariables()` and exits when that
variable is unset. Your `.env.local` normally leaves it empty, because the
storefront fetches the real key from the backend at boot rather than reading it
from a file. Only its presence is checked here, never its value.

Both should be clean. Note that `next.config.js` ships with
`typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` on, deliberately:
thousands of people deploy this repo and their own customizations should not
brick a Railway deploy over a type error. That makes the scripts above the only
thing standing between a type error and `master`, so please run them.

### The QA suite

`storefront/qa/` is a Playwright suite that runs against an already-running
stack. It is not a unit-test suite, it drives a real browser against a real
backend, and it is how most of the bugs in the recent history of this repo were
found.

```bash
cd storefront
pnpm test:qa           # whole suite
pnpm test:qa:ui        # pick tests interactively
pnpm test:qa -- qa/04-cart.spec.ts
```

See [storefront/qa/README.md](storefront/qa/README.md) for what it needs. Two
things worth knowing up front:

- **Run it against a production build, not just `pnpm dev`.** Dev mode barely
  caches and renders everything dynamically, which hides a whole class of
  defect. `pnpm build && pnpm start` is the honest check.
- If a spec you did not touch goes red, check `qa/README.md` first. There is
  one known-open defect held by a `test.fixme` in `qa/08-discounts.spec.ts`,
  and the cart helpers reload once and print a `[qa] page did not repaint`
  warning rather than failing, so a warning in the output is expected.

If you fix a user-facing bug, a spec that fails before your change and passes
after it is the most useful thing you can attach.

## What gets merged quickly

- Fixes to things that are broken on a real deploy, especially silent ones
- Anything that removes a manual step from the deploy
- Corrections to the README, the env templates or the Railway listing copy
- Dependency bumps with a note on what you actually tested

## What needs a conversation first

- Upgrading Medusa itself, which is coupled to the MeiliSearch plugin and the
  Railway service images
- Anything that changes an environment variable's name, because every existing
  deploy would need a dashboard change to keep working
- Adding a dependency, particularly to the backend, since it lands in every
  deploy's install

## Conventions

- Branch off `master` and open the pull request against `master`.
- Prefer taking a component from
  [medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa)
  verbatim over writing a local variant of it. The storefront is a snapshot of
  that starter, and every local divergence is something to hand-merge on the
  next upgrade.
- Keep the `<MedusaCTA />` attribution in the footer. Medusa wrote the
  storefront this template ships, and crediting them is deliberate.
- Comments should say why, not what. The code already says what.
