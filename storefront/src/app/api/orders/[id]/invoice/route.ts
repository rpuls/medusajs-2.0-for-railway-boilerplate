import { NextRequest } from "next/server"

import { MEDUSA_BACKEND_URL } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

/**
 * Proxies the Medusa-side invoice HTML through the storefront so the
 * "Tax invoice" button can be opened in a new tab without exposing the
 * customer's auth cookie to client JS. The cookie is httpOnly and lives
 * on the storefront's origin — only the Next runtime can read it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return new Response("missing order id", { status: 400 })
  }

  const headers = (await getAuthHeaders()) as Record<string, string>
  const upstream = await fetch(
    `${MEDUSA_BACKEND_URL}/store/customers/me/orders/${encodeURIComponent(
      id
    )}/invoice`,
    { headers, cache: "no-store" }
  )

  if (!upstream.ok) {
    return new Response(
      `Couldn't load invoice (server returned ${upstream.status}).`,
      { status: upstream.status }
    )
  }

  const html = await upstream.text()
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}
