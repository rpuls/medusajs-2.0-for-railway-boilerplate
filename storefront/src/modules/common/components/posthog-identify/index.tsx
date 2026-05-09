"use client"

import { useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"

import { phIdentify, phReset } from "@lib/posthog"

/**
 * Ties the current PostHog session to the logged-in customer so
 * recordings + events the customer triggers can be filtered by them
 * in the PostHog dashboard. Mounts wherever the customer is in scope
 * (typically the account-dashboard layout).
 *
 * Pass `null` when there's no customer (e.g. logged-out shell) and we
 * call `phReset()` once so a previous identify doesn't leak across a
 * sign-out.
 */
export const PostHogIdentify = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  // Track which id we last identified so we don't re-fire identify
  // on every render — only when it actually changes.
  const lastIdRef = useRef<string | null>(null)

  useEffect(() => {
    const nextId = customer?.id ?? null
    if (lastIdRef.current === nextId) return

    if (nextId) {
      const fullName =
        [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim() ||
        customer?.email ||
        nextId
      phIdentify(nextId, {
        email: customer?.email,
        name: fullName,
        // Useful filter dimensions in PostHog's session-replay UI.
        has_account: true,
      })
    } else if (lastIdRef.current) {
      // Was identified, now isn't — log out.
      phReset()
    }
    lastIdRef.current = nextId
  }, [customer])

  return null
}
