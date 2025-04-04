# Meilisearch plugin for Medusa V2

## Installation

Run the following command to install the plugin with **npm**:

```bash
npm install --save @rokmohar/medusa-plugin-meilisearch
```

Or with **yarn**:

```bash
yarn add @rokmohar/medusa-plugin-meilisearch
```

### Upgrade to v1.0

_This step is required only if you are upgrading from previous version to v1.0._

- The plugin now supports new MedusaJS plugin system.
- Subscribers are included in the plugin.
- You don't need custom subscribers anymore, you can remove them.

## ⚠️ MedusaJS v2.4.0 or newer

This plugin is only for MedusaJS v2.4.0 or newer.

If you are using MedusaJS v2.3.1 or older, please use the [older version of this plugin](https://github.com/rokmohar/medusa-plugin-meilisearch/tree/v0.2.1).

## Configuration

Add the plugin to your `medusa-config.ts` file:

```js
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  // ... other config
  plugins: [
    // ... other plugins
    {
      resolve: '@rokmohar/medusa-plugin-meilisearch',
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST ?? '',
          apiKey: process.env.MEILISEARCH_API_KEY ?? '',
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ['title', 'description', 'variant_sku'],
              displayedAttributes: ['id', 'title', 'description', 'variant_sku', 'thumbnail', 'handle'],
            },
            primaryKey: 'id',
            // Create your own transformer
            /*transformer: (product) => ({
              id: product.id,
              // other attributes...
            }),*/
          },
        },
      },
    },
  ],
})
```

## ENV variables

Add the environment variables to your `.env` and `.env.template` file:

```env
# ... others vars
MEILISEARCH_HOST=
MEILISEARCH_API_KEY=
```

If you want to use with the `docker-compose` from this README, use the following values:

```env
# ... others vars
MEILISEARCH_HOST=http://127.0.0.1:7700
MEILISEARCH_API_KEY=ms
```

## docker-compose

You can add the following configuration for Meilisearch to your `docker-compose.yml`:

```yml
services:
  # ... other services

  meilisearch:
    image: getmeili/meilisearch:latest
    ports:
      - '7700:7700'
    volumes:
      - ~/data.ms:/data.ms
    environment:
      - MEILI_MASTER_KEY=ms
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:7700']
      interval: 10s
      timeout: 5s
      retries: 5
```

## Add search to Medusa NextJS starter

You can find instructions on how to add search to a Medusa NextJS starter inside the [nextjs](nextjs) folder.
