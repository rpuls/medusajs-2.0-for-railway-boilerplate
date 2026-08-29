<h1 align="center">
  Medusa 2.0 on Railway: One-Click Deploy Template
</h1>
<h3 align="center">
  Backend + Next.js Storefront + Postgres + Redis + MeiliSearch + S3 file storage
</h3>
<p align="center">
A community-maintained boilerplate that deploys the official open-source Medusa 2.0 release and its Next.js starter storefront to Railway, with every service wired, seeded, and health-checked automatically.</p>
<p align="center">
  <sub>An independent community project by <a href="https://funkyton.com/">FUNKYTON</a>. Not affiliated with, endorsed by, or supported by MedusaJS, Inc. or Railway.<br>
  "Medusa" is a trademark of MedusaJS, Inc., used here only to describe what this template deploys.</sub>
</p>

<h2 align="center">
  Need help?<br>
  <a href="https://funkyton.com/medusajs-2-0-is-finally-here/">Step by step deploy guide, and video instructions</a>
</h2>

<h3 align="center">
  NEW! Looking for medusa B2B? <br>
  <a href="https://github.com/rpuls/medusa-b2b-for-railway/">Checkout the new B2B quickstart for Railway repository</a>
</h3>



## About this boilerplate
This is a community-maintained monorepo combining the official open-source MedusaJS 2.0 backend with the Medusa team's Next.js starter storefront, pre-configured for one-click deployment on [railway.app](https://railway.app?referralCode=-Yg50p).

It is an independent project, not built, endorsed, or supported by MedusaJS, Inc. Medusa itself is used as published, with no fork and no patches to the core, so the [official Medusa documentation](https://docs.medusajs.com/) applies as normal. What this template adds on top is the Railway deployment setup and a set of preconfigured integrations (MeiliSearch search, Stripe payments, Resend email, S3-compatible file storage), all built with Medusa's own module and plugin APIs.

Updated: to `version 2.17.2` 🥳

> **Where to get help:** questions about this template, Railway deployment, or the services it provisions belong in [this repo's issues](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate/issues). Questions about Medusa itself belong in the [official docs](https://docs.medusajs.com/) and Medusa's own community channels.

## A complete, working store from the first deploy
One click provisions and connects every service (Postgres, Redis, MeiliSearch, S3-compatible storage, backend and storefront), runs the migrations, seeds the database, creates your admin user with a strong random password, and shares API keys between the services automatically. When the health checks go green, the store is live. You handle products; the template handles plumbing.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/medusajs-2-0-storefront?referralCode=-Yg50p)

![The six Railway services provisioned by this template](https://res-5.cloudinary.com/hczpmiapo/image/upload/q_auto/v1/ghost-blog-images/medusa-2-17-2-on-railway-service-overview-png.png?_a=BAMAPqiu0)


## Preconfigured 3rd party integrations

- S3-compatible file storage: Uses Medusa's stock S3 file provider, and works with any S3-compatible object storage - Railway buckets, AWS S3, Cloudflare R2, MinIO, etc. Configure with the `S3_*` environment variables (see `backend/.env.template`). Legacy `MINIO_*` variables from older deployments of this template are still supported as a fallback (ignored as soon as any `S3_*` variable is set). Note: the bucket must already exist and, for product images, allow public read (via a bucket policy) - the backend does not create buckets or set policies. Uploads are sent without ACL headers by default (compatible with Railway buckets, R2 and new AWS buckets); set `S3_ACL=public-read` only for legacy ACL-based buckets.
- Resend email integration [Watch setup video](https://youtu.be/pbdZm26YDpE?si=LQTHWeZMLD4w3Ahw) - special thanks to [aleciavogel](https://github.com/aleciavogel) for Resend notification service, and react-email implementation! [README](backend/src/modules/email-notifications/README.md)
- Stripe payment service: [Watch setup video](https://youtu.be/dcSOpIzc1Og)
- Meilisearch integration by [Rokmohar](https://github.com/rokmohar/medusa-plugin-meilisearch): Adds powerful product search capabilities to your store. When deployed on Railway using the template, MeiliSearch is automatically configured. (For non-railway'ers: [Watch setup video](https://youtu.be/hrXcc5MjApI))

# local setup

## Local infrastructure with docker compose (optional, recommended)

The repository root contains a `docker-compose.yml` that mirrors the services provisioned by the Railway template: **postgres**, **redis**, **meilisearch** and an S3-compatible object store (**MinIO**, standing in for a Railway bucket).

- `docker compose up -d` starts everything. A one-shot init job creates a public `medusa-media` bucket automatically.
- The commented `S3_*` and `MEILISEARCH_*` values in `backend/.env.template` match these services - uncomment them in your `backend/.env` to enable file storage and search locally.
- MinIO console: http://localhost:9005 (login: `medusa` / `supersecret`), Meilisearch: http://localhost:7700.

## Backend
Video instructions: https://youtu.be/PPxenu7IjGM

- `cd backend/`
- `pnpm install` or `npm i`
- Rename `.env.template` ->  `.env`
- To connect to your online database from your local machine, copy the `DATABASE_URL` value auto-generated on Railway and add it to your `.env` file.
  - If connecting to a new database, for example a local one, run `pnpm ib` or `npm run ib` to seed the database.
- `pnpm dev` or `npm run dev`

### requirements
- **postgres database** (Automatic setup when using the Railway template)
- **redis** (Automatic setup when using the Railway template) - fallback to simulated redis.
- **S3-compatible storage** (Automatic setup when using the Railway template) - fallback to local storage.
- **Meilisearch** (Automatic setup when using the Railway template)

### commands

`cd backend/`
`npm run ib` or `pnpm ib` will initialize the backend by running migrations and seed the database with required system data.
`npm run dev` or `pnpm dev` will start the backend (and admin dashboard frontend on `localhost:9000/app`) in development mode.
`pnpm build && pnpm start` will compile the project and run from compiled source. This can be useful for reproducing issues on your cloud instance.

## Storefront
Video instructions: https://youtu.be/PPxenu7IjGM

- `cd storefront/`
- Install dependencies `npm i` or `pnpm i`
- Rename `.env.local.template` ->  `.env.local`

### requirements
- A running backend on port 9000 is required to fetch product data and other information needed to build Next.js pages.

### commands
`cd storefront/`
`npm run dev` or `pnpm dev` will run the storefront on uncompiled code, with hot-reloading as files are saved with changes.

## Useful resources
- How to setup credit card payment with Stripe payment module: https://youtu.be/dcSOpIzc1Og
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
