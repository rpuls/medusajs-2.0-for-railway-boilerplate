import type { MetadataRoute } from "next"

import { getBaseURL } from "@lib/util/env"

/**
 * /robots.txt
 *
 * Pairs with src/app/sitemap.ts. Without the `sitemap:` line a crawler has no
 * way to discover the sitemap short of guessing the path.
 *
 * The disallow list is about crawl budget, not secrecy. None of these pages
 * expose anything (they are all per-visitor and behind a cookie or a session),
 * but they are infinite in the way that matters to a crawler: every search
 * query is a distinct URL, and cart and checkout pages are unique per visitor
 * and worthless in an index. The patterns carry a leading `/*` because every
 * route in this storefront is region-prefixed, so the paths are `/gb/cart`,
 * `/de/cart` and so on.
 *
 * `/buy/` is the exception to "nothing to protect": a GET there creates a cart
 * (see src/app/buy), so a crawler following one would fill the admin with
 * abandoned carts. `/ucp/` is for agents that call it, not for indexes.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getBaseURL().replace(/\/+$/, "")

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/buy/",
          "/ucp/",
          "/*/account",
          "/*/cart",
          "/*/checkout",
          "/*/order/",
          "/*/results/",
          "/*/search",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
