import { NextRequest } from "next/server"

import { MEDUSA_BACKEND_URL } from "@lib/config"
import { getAuthHeaders } from "@lib/data/cookies"

/**
 * Proxies the Medusa-side receipt PDF through the storefront so the
 * "Download receipt" button can be opened in a new tab without exposing
 * the customer's auth cookie to client JS. The cookie is httpOnly and lives
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
    )}/receipt-pdf`,
    { headers, cache: "no-store" }
  )

  if (!upstream.ok) {
    return new Response(
      `Couldn't generate receipt (server returned ${upstream.status}).`,
      { status: upstream.status }
    )
  }

  const buffer = await upstream.arrayBuffer()
  const filename =
    upstream.headers.get("content-disposition") ??
    `attachment; filename="receipt-${id}.pdf"`

  return new Response(buffer, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": filename,
      "cache-control": "no-store",
    },
  })
}
