import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/pos-bridge/items
 *   body: {
 *     pos_session_id: string,
 *     kind: "standard" | "customizer",
 *     variant_id: string | null,
 *     product_id: string,
 *     product_title: string,
 *     variant_title?: string | null,
 *     quantity: number,
 *     unit_price_cents?: number | null,
 *     metadata?: Record<string, unknown>,
 *   }
 *
 * Relays a single line-item add from the storefront customizer to the
 * backend POS session. Called by the customizer's "Add to cart" path
 * when it detects `?pos_session=<id>` in the URL (POS mode).
 *
 * No auth on this route — the session ID itself is the capability,
 * matching the backend /store/pos-sessions/:id/items route's threat
 * model. Returns the backend's response verbatim.
 */
function getBackendBaseUrl(): string {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_MEDUSA_BACKEND_URL")
  }
  return backendUrl.replace(/\/+$/, "").replace(/\/store$/, "")
}

export async function POST(req: NextRequest) {
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  const sessionId: string | undefined = payload?.pos_session_id
  if (!sessionId || typeof sessionId !== "string") {
    return NextResponse.json(
      { error: "pos_session_id required" },
      { status: 400 }
    )
  }

  // Strip pos_session_id from the body — the backend route reads it
  // from the URL.
  const { pos_session_id: _drop, ...itemBody } = payload

  let backendBaseUrl: string
  try {
    backendBaseUrl = getBackendBaseUrl()
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "backend not configured" },
      { status: 503 }
    )
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (publishableKey) headers["x-publishable-api-key"] = publishableKey

  try {
    const res = await fetch(
      `${backendBaseUrl}/store/pos-sessions/${encodeURIComponent(
        sessionId
      )}/items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(itemBody),
        cache: "no-store",
      }
    )

    const text = await res.text()
    let body: unknown
    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      body = { error: "bad_backend_response", raw: text }
    }

    return NextResponse.json(body, { status: res.status })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "bridge_failed" },
      { status: 502 }
    )
  }
}
