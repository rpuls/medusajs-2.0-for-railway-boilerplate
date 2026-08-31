<h1 align="center">
  Medusa 2.0 on Railway: One-Click Deploy Template
</h1>
<h3 align="center">
  Backend + Next.js Storefront + Postgres + Redis + MeiliSearch + S3 file storage
</h3>
<p align="center">
Deploys the official open-source Medusa 2.0 release and its Next.js starter storefront to Railway, with every service wired, seeded, and health-checked automatically.</p>
<p align="center">
  <sub>An independent project by <a href="https://funkyton.com/">FUNKYTON</a>, not affiliated with MedusaJS, Inc. or Railway. "Medusa" is a trademark of MedusaJS, Inc.</sub>
</p>

<p align="center">
  <img alt="Medusa 2.19.0" src="https://img.shields.io/badge/Medusa-2.19.0-1a1a1a">
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-1a1a1a">
  <img alt="3,800+ deploys" src="https://img.shields.io/badge/Railway%20deploys-3%2C800%2B-6c5ce7">
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/rpuls/medusajs-2.0-for-railway-boilerplate"></a>
  <a href="https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate/commits"><img alt="Last commit" src="https://img.shields.io/github/last-commit/rpuls/medusajs-2.0-for-railway-boilerplate"></a>
</p>

<h2 align="center">
  Need help?<br>
  <a href="https://funkyton.com/medusajs-2-0-is-finally-here/">Step by step deploy guide, and video instructions</a>
</h2>

<p align="center">
  <sub>Selling wholesale, or hosting other people's shops? There are sibling templates.</sub><br>
  <a href="#other-shapes-of-store">B2B</a> &nbsp;&middot;&nbsp; <a href="#other-shapes-of-store">Multi-vendor marketplace</a>
</p>

## A complete, working store from the first deploy

One click provisions and connects every service (Postgres, Redis, MeiliSearch, S3-compatible storage, backend and storefront), runs the migrations, seeds the database, creates your admin user with a strong random password, and shares API keys between the services automatically. When the health checks go green, the store is live. You handle products; the template handles plumbing.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/medusajs-2-0-storefront?referralCode=-Yg50p)

**Updated to Medusa 2.19.0 on 31 August 2026.**

Deployed more than 3,800 times since 2023, and over 1,100 of those stores are still serving customers today.

## What gets deployed

Six services in one Railway project, plus whichever third-party integrations you
configure.

![Architecture diagram. Shoppers reach the Next.js storefront and the store owner reaches the Medusa backend directly. The storefront calls the backend for the Store API and MeiliSearch for product search. The backend owns Postgres, Redis, MeiliSearch and an S3 bucket, all inside one Railway project, and calls Stripe and Resend outside it.](docs/diagrams/railway-stack.png)

![The six Railway services provisioned by this template](https://res-5.cloudinary.com/hczpmiapo/image/upload/q_auto/v1/ghost-blog-images/medusa-2-17-2-on-railway-service-overview-png.png?_a=BAMAPqiu0)

## About this boilerplate

A monorepo combining the official open-source MedusaJS 2.0 backend with the Medusa team's Next.js starter storefront, pre-configured for one-click deployment on [railway.app](https://railway.app?referralCode=-Yg50p).

Medusa is used as published, with no fork and no patches to the core, so the [official Medusa documentation](https://docs.medusajs.com/) applies as normal. What this template adds on top is the Railway deployment setup and a set of preconfigured integrations (MeiliSearch search, Stripe payments, Resend email, S3-compatible file storage), all built with Medusa's own module and plugin APIs.

> **Where to get help**
>
> - **A deploy that will not come up, or anything about the Railway side:** the template's [thread on Railway Station](https://station.railway.com/templates/medusajs-2-0-storefront-c69ac579). Other people running this template read it, so an answer there helps the next person too.
> - **A bug in this repo, or a change you want:** [open an issue](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate/issues).
> - **Medusa itself,** how a module works or how to build on it: the [official docs](https://docs.medusajs.com/) and Medusa's own community channels.

### This template vs. wiring it up yourself

| | This template | Doing it by hand |
| --- | --- | --- |
| Time to a running store | Minutes | Half a day, and longer the first time |
| Six services provisioned and networked | One click | Six services to create, and the connection strings to copy between them |
| Migrations and seed data | Run automatically on first boot | `medusa db:migrate`, then write or adapt a seed script |
| Admin user | Created for you with a random password | Create it over the CLI after the database is up |
| Publishable API key | Generated and handed to the storefront automatically | Create it in the admin, then paste it into the storefront's environment |
| MeiliSearch | Provisioned, keyed, and the catalogue indexed | Install and configure the plugin, mint a search-only key, wire the storefront |
| Stripe, Resend, S3 | Configuration slots already wired, add your keys | Install and register each provider yourself |
| Health checks | Configured per service | Yours to add |
| Staying current | Pull the repo and redeploy | Yours to track |

Nothing here is magic, and none of it is locked in. It is the same Medusa you would install by hand, with the setup already done.

## Preconfigured 3rd party integrations

- **S3-compatible file storage.** Uses Medusa's stock S3 file provider, and works with any S3-compatible object storage: Railway buckets, AWS S3, Cloudflare R2, MinIO. Configure with the `S3_*` environment variables (see `backend/.env.template`). Legacy `MINIO_*` variables from older deployments of this template are still supported as a fallback (ignored as soon as any `S3_*` variable is set). Note: the bucket must already exist and, for product images, allow public read (via a bucket policy). The backend does not create buckets or set policies. Uploads are sent without ACL headers by default (compatible with Railway buckets, R2 and new AWS buckets); set `S3_ACL=public-read` only for legacy ACL-based buckets.
- **Resend email.** Order confirmations, admin invites and password resets, as react-email templates you can edit and preview locally with `pnpm email:dev`. [Watch setup video](https://youtu.be/pbdZm26YDpE?si=LQTHWeZMLD4w3Ahw). Special thanks to [aleciavogel](https://github.com/aleciavogel) for the Resend notification service and react-email implementation. [README](backend/src/modules/email-notifications/README.md)
- **Stripe payments.** [Watch setup video](https://youtu.be/dcSOpIzc1Og)
- **MeiliSearch** by [Rokmohar](https://github.com/rokmohar/medusa-plugin-meilisearch). Adds product search to your store, and is configured automatically when deployed from the Railway template. For non-Railway setups: [watch setup video](https://youtu.be/hrXcc5MjApI).

All four are optional. A store deploys and runs without any of them; each one switches on when its environment variables are present.

## Other shapes of store

Same one-click Railway setup, a different commerce model underneath. Both are
maintained here alongside this one.

| Template | Fits when | |
| --- | --- | --- |
| **[Medusa B2B](https://github.com/rpuls/medusa-b2b-for-railway)** | You sell wholesale. Company accounts with employees and spending limits, quote requests, and approvals before an order goes through. A Railway distribution of the official Medusa B2B starter. | [Deploy](https://railway.com/deploy/medusajs-20-storefront-b2b?referralCode=-Yg50p) |
| **[MercurJS Marketplace](https://github.com/rpuls/mercurjs-for-railway-boilerplate)** | You host other people's shops. Many sellers on one storefront, each with their own vendor dashboard, and an owner admin above them. Built on Medusa. | [Deploy](https://railway.com/deploy/mercurjs?referralCode=-Yg50p) |

This template is the plain one: a single seller, a single storefront. Start here
unless you recognised yourself above.

## Local development

<details>
<summary><b>Local infrastructure with docker compose</b> (optional, recommended)</summary>

<br>

The repository root contains a `docker-compose.yml` that mirrors the services provisioned by the Railway template: **postgres**, **redis**, **meilisearch** and an S3-compatible object store (**MinIO**, standing in for a Railway bucket).

- `docker compose up -d` starts everything. A one-shot init job creates a public `medusa-media` bucket automatically.
- The commented `S3_*` and `MEILISEARCH_*` values in `backend/.env.template` match these services. Uncomment them in your `backend/.env` to enable file storage and search locally.
- MinIO console: http://localhost:9005 (login: `medusa` / `supersecret`), MeiliSearch: http://localhost:7700.

</details>

<details>
<summary><b>Backend</b></summary>

<br>

Video instructions: https://youtu.be/PPxenu7IjGM

```bash
cd backend
cp .env.template .env       # then read it, the top of the file matters
pnpm install
pnpm ib                     # migrate and seed
pnpm dev                    # API on :9000, admin dashboard on :9000/app
```

To connect to your deployed database from your local machine, copy the `DATABASE_URL` value from Railway into your `.env`. Run `pnpm ib` only against a database you are willing to seed.

`pnpm build && pnpm start` compiles the project and runs from the compiled source, which is what Railway does. Use it to reproduce a deploy-only problem.

More detail in [backend/README.md](backend/README.md).

</details>

<details>
<summary><b>Storefront</b></summary>

<br>

Video instructions: https://youtu.be/PPxenu7IjGM

```bash
cd storefront
cp .env.local.template .env.local
pnpm install
pnpm dev                    # http://localhost:8000
```

A running backend on port 9000 is required. The storefront fetches its publishable API key from the backend at boot, so `next build` on its own will not work.

More detail in [storefront/README.md](storefront/README.md).

</details>

<details>
<summary><b>Requirements</b></summary>

<br>

- **Node 22.12 or later.** Both packages carry a `.nvmrc`.
- **pnpm.** This project is pnpm-only: the build scripts call pnpm directly, so an npm or yarn install gets you a tree that works locally and a deploy that fails.
- **Postgres.** Required. Set up automatically by the Railway template.
- **Redis.** Optional, falls back to a simulated in-memory bus. Set up automatically by the Railway template.
- **S3-compatible storage.** Optional, falls back to local disk, which is ephemeral on Railway. Set up automatically by the Railway template.
- **MeiliSearch.** Optional, and needs server 1.20 or later. Set up automatically by the Railway template.

</details>

## FAQ

### Is this the official Medusa deployment?

No, it is an independent project by [FUNKYTON](https://funkyton.com/). It deploys the official open-source Medusa release as published, with no fork and no patches to the core, so the [official Medusa docs](https://docs.medusajs.com/) apply to your store exactly as written. What the template adds is the Railway deployment setup and the preconfigured integrations listed above.

### How much does it cost to run Medusa on Railway?

**The whole stack idles at 595 MB of memory, which is roughly \$7 a month of
Railway resources for a low-traffic store.** Railway bills per second for what a
service actually uses rather than for what you allocate to it, so a quiet shop
costs very little to keep online.

At that level the plan fee is most of the bill, not the servers. Hobby is \$5 a
month including \$5 of usage, which puts a quiet store near \$7 all in. Pro is
\$20 including \$20 of usage, absorbing the resource cost entirely. Real
deployments of this template have sat between \$20 and \$25 a month on Pro.

Per-service memory and CPU limits let you cap it further, with the catch that a
CPU limit makes the store slower while a memory limit set too low restarts it
mid-request.

[Per-service measurements, the full arithmetic, and how to tune it](https://funkyton.com/medusajs-2-0-is-finally-here/)

### Can I use Cloudflare R2 for product images?

Yes. R2 is S3-compatible, so it uses the same `S3_*` variables as everything else. Set `S3_REGION=auto`, leave `S3_ACL` unset (R2 rejects ACL headers), and give the bucket public read access with a bucket policy rather than per-object ACLs. The same applies to Railway buckets and new AWS buckets.

### Do I need Stripe and Resend to deploy?

No. Every integration is optional and each one switches on only when its environment variables are present. Without Stripe the checkout offers manual payment; without Resend or SendGrid, no order confirmations are sent. You can add either later without redeploying from scratch.

### Can I use npm or yarn?

No. This project is pnpm-only. `backend/src/scripts/postBuild.js` calls `pnpm i --frozen-lockfile` directly when assembling the production server, so an npm or yarn install gives you a tree that works locally and a deploy that fails.

### Can I change the storefront's design?

Yes, that is the point. The homepage hero ships as a visibly dashed "example section" so you can tell the template's filler from your own work at a glance, and deleting it is a two-line change. The storefront is a standard Next.js App Router project with Tailwind.

## Contributing and security

- [CONTRIBUTING.md](CONTRIBUTING.md) covers setup, the QA test suite, and what gets merged quickly.
- [SECURITY.md](SECURITY.md) covers how to report a vulnerability privately, and the two settings every deployer owns.
- Licensed [MIT](LICENSE).

If this template saved you a day, [sponsoring](https://github.com/sponsors/rpuls) keeps it maintained.

## Useful resources

- How to set up credit card payment with the Stripe payment module: https://youtu.be/dcSOpIzc1Og
- https://funkyton.com/medusajs-2-0-is-finally-here/#succuessfully-deployed-whats-next

---

## Also from the maintainer

Interested in digital independence through self-hosted open source? Take a look at **[My Own Suite](https://myownsuite.org/)**, a private cloud you run yourself: passwords, photos, files, documents and calendars, all on hardware you control. Free and open source under AGPL-3.0.

[Website](https://myownsuite.org/) &middot; [Getting started](https://myownsuite.org/docs/getting-started) &middot; [GitHub](https://github.com/rpuls/my-own-suite)

<p align="center">
  <a href="https://funkyton.com/">
    <div style="text-align: center;">
      A template by,
      <br>
      <picture>
        <img alt="FUNKYTON logo" src="https://res-5.cloudinary.com/hczpmiapo/image/upload/q_auto/v1/ghost-blog-images/funkyton-logo.png" width=200>
      </picture>
    </div>
  </a>
</p>
