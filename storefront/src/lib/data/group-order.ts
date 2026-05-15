"use server"

import { sdk } from "@lib/config"

import { getAuthHeaders } from "./cookies"

export type GroupOrder = {
  id: string
  public_token: string
  status: "open" | "closed" | "converted" | "expired"
  title: string
  organisation_name: string | null
  owner_name: string | null
  owner_email?: string
  base_product_id: string | null
  base_variant_id: string | null
  base_design_id: string | null
  customizer_metadata: Record<string, unknown>
  deadline_at: string | null
  notes: string | null
  created_at?: string
}

export type GroupOrderParticipant = {
  id: string
  name: string
  size_label: string
  quantity: number
  player_number: string | null
  custom_notes: string | null
  created_at: string
}

export async function getGroupOrderByToken(
  token: string
): Promise<{ group_order: GroupOrder; participants: GroupOrderParticipant[] } | null> {
  try {
    return (await sdk.client.fetch(
      `/store/group-orders/${encodeURIComponent(token)}`
    )) as { group_order: GroupOrder; participants: GroupOrderParticipant[] }
  } catch {
    return null
  }
}

export async function joinGroupOrder(
  token: string,
  input: {
    name: string
    size_label: string
    quantity?: number
    player_number?: string
    custom_notes?: string
    submitter_email?: string
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await sdk.client.fetch(
      `/store/group-orders/${encodeURIComponent(token)}/participants`,
      { method: "POST", body: input }
    )
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to submit",
    }
  }
}

export async function createGroupOrder(input: {
  title: string
  organisation_name?: string
  owner_email: string
  owner_name?: string
  base_product_id?: string
  base_variant_id?: string
  base_design_id?: string
  customizer_metadata?: Record<string, unknown>
  deadline_at?: string
  notes?: string
}): Promise<{ ok: true; group_order: GroupOrder } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to create a group order." }
  }
  try {
    const res = (await sdk.client.fetch("/store/group-orders", {
      method: "POST",
      headers,
      body: input,
    })) as { group_order: GroupOrder }
    return { ok: true, group_order: res.group_order }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create.",
    }
  }
}

export async function listMyGroupOrders(): Promise<GroupOrder[]> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return []
  try {
    const res = (await sdk.client.fetch("/store/customers/me/group-orders", {
      headers,
    })) as { group_orders?: GroupOrder[] }
    return res.group_orders ?? []
  } catch {
    return []
  }
}

export async function setGroupOrderStatus(
  id: string,
  status: "open" | "closed" | "converted"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in required." }
  }
  try {
    await sdk.client.fetch(
      `/store/customers/me/group-orders/${encodeURIComponent(id)}/status`,
      { method: "POST", headers, body: { status } }
    )
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update status",
    }
  }
}
