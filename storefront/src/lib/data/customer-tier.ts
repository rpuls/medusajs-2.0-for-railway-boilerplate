"use server"

import { cache } from "react"

import { sdk } from "@lib/config"
import { getTierBySlug, type Tier } from "../customer-tiers"
import { authedNextHeaders, awaitedAuthHeaders } from "./sdk-helpers"
import { getAuthHeaders } from "./cookies"

/**
 * Returns the logged-in customer's resolved pricing tier (or null).
 *
 * Backed by the custom `/store/customers/me/tier` route — Medusa's core
 * store/customers/me endpoint deliberately doesn't expose customer_groups,
 * so a thin wrapper is needed for the storefront to know what tier the
 * shopper is in.
 *
 * Returns `null` for guests, customers without a tier assignment, and on
 * any backend failure (the storefront falls back to public pricing).
 */
export const getCustomerTier = cache(async function (): Promise<Tier | null> {
  const baseHeaders = await getAuthHeaders()
  if (!("authorization" in baseHeaders)) {
    return null
  }

  const headers = await authedNextHeaders({ tags: ["customer-tier"] })

  try {
    const resp = await sdk.client.fetch<{ tier: { slug: string } | null }>(
      "/store/customers/me/tier",
      { method: "GET", headers }
    )
    if (!resp?.tier?.slug) return null
    return getTierBySlug(resp.tier.slug)
  } catch {
    return null
  }
})
