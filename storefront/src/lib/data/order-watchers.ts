"use server"

import { sdk } from "@lib/config"

import { getAuthHeaders } from "./cookies"

export async function listOrderWatchers(orderId: string): Promise<string[]> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return []
  try {
    const res = (await sdk.client.fetch(
      `/store/customers/me/orders/${encodeURIComponent(orderId)}/watchers`,
      { headers }
    )) as { watchers?: string[] }
    return res.watchers ?? []
  } catch {
    return []
  }
}

export async function addOrderWatcher(
  orderId: string,
  email: string
): Promise<{ ok: true; watchers: string[] } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to manage watchers." }
  }
  try {
    const res = (await sdk.client.fetch(
      `/store/customers/me/orders/${encodeURIComponent(orderId)}/watchers`,
      { method: "POST", headers, body: { email } }
    )) as { watchers: string[] }
    return { ok: true, watchers: res.watchers }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to add watcher.",
    }
  }
}

export async function removeOrderWatcher(
  orderId: string,
  email: string
): Promise<{ ok: true; watchers: string[] } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to manage watchers." }
  }
  try {
    const res = (await sdk.client.fetch(
      `/store/customers/me/orders/${encodeURIComponent(orderId)}/watchers?email=${encodeURIComponent(email)}`,
      { method: "DELETE", headers }
    )) as { watchers: string[] }
    return { ok: true, watchers: res.watchers }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to remove watcher.",
    }
  }
}
