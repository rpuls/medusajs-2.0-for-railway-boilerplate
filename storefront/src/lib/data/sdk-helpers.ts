import "server-only"

import type { ClientHeaders } from "@medusajs/js-sdk"

import { getAuthHeaders } from "./cookies"

/**
 * Tiny adapter layer between this app's async cookie reader and the Medusa SDK's
 * synchronous `ClientHeaders` parameter. Two real bugs lived in the data layer:
 *   1. Spreading `getAuthHeaders()` (a Promise) into headers — the auth header
 *      never actually got sent, every authenticated SDK call ran unauth.
 *   2. Passing a `{ next: { tags, revalidate } }` Next.js fetch hint where the
 *      SDK types only allow a top-level `{ tags: string[] }` value.
 *
 * Both helpers always await + return ClientHeaders-compatible objects so the
 * data-layer files don't have to litter `await getAuthHeaders()` + casts.
 */

/** Auth header bag, awaited. Empty when the customer isn't signed in. */
export async function awaitedAuthHeaders(): Promise<ClientHeaders> {
  const auth = await getAuthHeaders()
  return auth as ClientHeaders
}

type NextCacheConfig = {
  tags: string[]
  revalidate?: number
}

/**
 * Auth headers + Next.js cache hint, ready to pass as the SDK's third arg.
 * The cast is deliberate: the SDK forwards this object to `fetch` as part of
 * the request init, which Next.js intercepts to read `next.tags` /
 * `next.revalidate`. The SDK's `ClientHeaders` type doesn't model that.
 */
export async function authedNextHeaders(next: NextCacheConfig): Promise<ClientHeaders> {
  const auth = await getAuthHeaders()
  return { next, ...auth } as unknown as ClientHeaders
}

/** Same as `authedNextHeaders` but for unauthenticated calls (e.g. catalog). */
export function nextHeaders(next: NextCacheConfig): ClientHeaders {
  return { next } as unknown as ClientHeaders
}
