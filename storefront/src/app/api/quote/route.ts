import { NextRequest, NextResponse } from "next/server"

/**
 * Storefront proxy → backend POST /store/quotes. Forwards the
 * (potentially large) request body so the BYO form can attach mood-
 * board image uploads without the storefront becoming a CORS
 * negotiator.
 */
function getBackendBaseUrl() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!backendUrl) {
    throw new Error("Missing NEXT_PUBLIC_MEDUSA_BACKEND_URL")
  }
  return backendUrl.replace(/\/+$/, "")
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (publishableKey) {
      headers["x-publishable-api-key"] = publishableKey
    }

    const res = await fetch(`${getBackendBaseUrl()}/store/quotes`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            body?.message ?? body?.error ?? "Quote request rejected by backend.",
        },
        { status: res.status }
      )
    }
    return NextResponse.json(body, { status: 200 })
  } catch (err) {
    console.error("Quote proxy failed", err)
    return NextResponse.json(
      {
        success: false,
        message: "Quote service is unavailable. Please try again shortly.",
      },
      { status: 500 }
    )
  }
}
