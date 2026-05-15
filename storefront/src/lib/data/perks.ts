"use server"

import { sdk } from "@lib/config"
import { cache } from "react"

import { getAuthHeaders } from "./cookies"

export type ActivePerk = {
  perk: "free_shipping"
  granted_by_tag: string
}

export type CustomerPerks = {
  perks: ActivePerk[]
  tags: Array<{ label: string; color: string | null }>
}

const PERKS_TAG = "customer-perks"

export const getCustomerPerks = cache(async function (): Promise<CustomerPerks> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { perks: [], tags: [] }
  }
  try {
    const res = (await sdk.client.fetch("/store/customers/me/perks", {
      headers: { ...headers, next: { tags: [PERKS_TAG] as string[] } },
    })) as CustomerPerks
    return res
  } catch {
    return { perks: [], tags: [] }
  }
})
