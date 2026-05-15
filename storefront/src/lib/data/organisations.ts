"use server"

import { sdk } from "@lib/config"

import { getAuthHeaders } from "./cookies"

export type Membership = {
  organisation: {
    id: string
    handle: string
    name: string
    contact_email: string | null
    notes: string | null
    default_pricing_tier: string | null
    tax_exempt: boolean
  } | null
  role: "owner" | "purchaser" | "viewer"
  joined_at: string | null
}

export async function listMyOrganisations(): Promise<Membership[]> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return []
  try {
    const res = (await sdk.client.fetch("/store/customers/me/organisations", {
      headers,
    })) as { organisations?: Membership[] }
    return res.organisations ?? []
  } catch {
    return []
  }
}
