import { toGoogleFeed } from "@lib/util/product-feed"

import { loadFeed } from "../../load-feed"

/**
 * /feeds/google/{country}.xml, for example /feeds/google/us.xml
 *
 * The catalogue for Google Merchant Center, with prices in the currency of the
 * region that covers {country}. Add the URL in Merchant Center as a scheduled
 * fetch, one feed per country you sell to. See src/lib/util/product-feed.ts.
 *
 * Built on every request, like /llms.txt, so a product published in the admin
 * is in the next fetch without a storefront redeploy.
 */
export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const feed = await loadFeed((await params).file, "xml", "feeds/google")
  if ("error" in feed) return feed.error

  return new Response(toGoogleFeed(feed.items, feed.store), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
