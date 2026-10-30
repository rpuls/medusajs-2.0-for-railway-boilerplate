import { configureStoreSearch, defineMiddlewares } from '@medusajs/framework/http';
import { serveWellKnown, WELL_KNOWN_MATCHER } from '../store-mcp/well-known';

/**
 * Opens the `products` index (declared in src/search/products.ts) to
 * `POST /store/search`, which is the only way the storefront searches.
 *
 * The storefront used to query MeiliSearch straight from the browser, by the
 * index name `products`. That stopped being possible in Medusa 2.20: the Search
 * Module now builds each index into a versioned physical index (`products_v1`,
 * then `products_v2` after a rebuild) and switches over when it is ready, so no
 * fixed name stays current. Going through the backend also means the browser
 * no longer needs a MeiliSearch key, and results are scoped to published
 * products in the publishable key's sales channels.
 *
 * Medusa answers every index that is not listed here as if it did not exist.
 * With no MeiliSearch configured, as on the trial template, Medusa runs the
 * Search Module on its built-in Postgres provider instead, so the same index
 * and route still work, with plainer matching.
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: '/store/search',
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            products: true,
          },
        }),
      ],
    },
    // OAuth discovery for the store MCP server. See src/store-mcp/well-known.ts.
    {
      matcher: WELL_KNOWN_MATCHER,
      middlewares: [serveWellKnown],
    },
  ],
});
