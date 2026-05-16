"use server"

import { cookies } from "next/headers"

const REQUEST_ID_COOKIE = "_request_id"

/**
 * Get or create a request ID for this session.
 *
 * The ID is read from a `_request_id` cookie and persists for 24h. On the
 * first request (no cookie), we generate one and attempt to set the cookie
 * so subsequent requests reuse the same ID for trace correlation.
 *
 * IMPORTANT — Next.js 16 hard-errors on `cookies().set()` from anywhere
 * other than a Server Action or Route Handler. This helper is called
 * transitively from page renders (cart, checkout, etc.) via the SDK
 * header builders, so the set MUST be wrapped in try/catch. When it fails,
 * we still return a fresh request ID for THIS request — tracing within
 * the request works, only cross-request continuity is lost until the
 * next Server Action / Route Handler sets the cookie. Without the
 * try/catch the entire cart page throws "Cookies can only be modified
 * in a Server Action or Route Handler" and renders the error boundary.
 */
export async function getOrCreateRequestId(): Promise<string> {
  const cookieStore = await cookies()
  let requestId = cookieStore.get(REQUEST_ID_COOKIE)?.value

  if (!requestId) {
    requestId = generateRequestId()
    try {
      cookieStore.set(REQUEST_ID_COOKIE, requestId, {
        maxAge: 86400,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
    } catch {
      // Page render context — cookie set is forbidden. The request ID is
      // still valid for this request; a later Server Action or Route
      // Handler will persist it for cross-request continuity.
    }
  }

  return requestId
}

/**
 * Generate a simple request ID (UUID v4).
 */
function generateRequestId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Create trace context headers for API requests.
 */
export async function getTraceHeaders(): Promise<Record<string, string>> {
  const requestId = await getOrCreateRequestId()
  return {
    "x-request-id": requestId,
    "x-trace-context": requestId,
  }
}
