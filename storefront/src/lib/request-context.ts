"use server"

import { cookies } from "next/headers"

const REQUEST_ID_COOKIE = "_request_id"

/**
 * Get or create a request ID for this session.
 * The ID persists for the lifetime of the session via cookies.
 */
export async function getOrCreateRequestId(): Promise<string> {
  const cookieStore = await cookies()
  let requestId = cookieStore.get(REQUEST_ID_COOKIE)?.value

  if (!requestId) {
    // Generate a new request ID (UUID v4 style)
    requestId = generateRequestId()
    // Set cookie for 24 hours
    cookieStore.set(REQUEST_ID_COOKIE, requestId, {
      maxAge: 86400,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
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
