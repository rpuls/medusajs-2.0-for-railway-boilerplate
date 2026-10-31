import { toOpenAiFeed } from "@lib/util/product-feed"

import { loadFeed } from "../../load-feed"

/**
 * /feeds/openai/{country}.csv, for example /feeds/openai/us.csv
 *
 * The catalogue in OpenAI's product feed format, for ChatGPT's shopping
 * results. OpenAI does not fetch it: approved merchants push it to OpenAI's
 * SFTP server, which backend/src/jobs/push-openai-feed.ts does daily once its
 * variables are set. Served here too so an owner can download and check it
 * before applying. See src/lib/util/product-feed.ts.
 */
export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const feed = await loadFeed((await params).file, "csv", "feeds/openai")
  if ("error" in feed) return feed.error

  return new Response(toOpenAiFeed(feed.items, feed.store), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  })
}
