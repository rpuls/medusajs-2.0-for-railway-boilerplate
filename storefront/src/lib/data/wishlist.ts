"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { cache } from "react"

import { getAuthHeaders } from "./cookies"

export type WishlistItem = {
  id: string
  customer_id: string
  product_id: string
  variant_id: string | null
  note: string | null
  created_at: string
  updated_at: string
}

const WISHLIST_TAG = "customer-wishlist"

const cacheInit = {
  next: { tags: [WISHLIST_TAG] as string[] },
}

export const listMyWishlist = cache(async function (): Promise<{
  items: WishlistItem[]
  count: number
}> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { items: [], count: 0 }
  }
  try {
    const res = (await sdk.client.fetch("/store/customers/me/wishlist", {
      headers: { ...headers, ...cacheInit },
    })) as { wishlist_items?: WishlistItem[]; count?: number }
    return { items: res.wishlist_items ?? [], count: res.count ?? 0 }
  } catch {
    return { items: [], count: 0 }
  }
})

export async function addToWishlist(input: {
  product_id: string
  variant_id?: string | null
  note?: string | null
}): Promise<{ ok: true; item: WishlistItem; duplicate: boolean } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to save items." }
  }
  try {
    const res = (await sdk.client.fetch("/store/customers/me/wishlist", {
      method: "POST",
      headers,
      body: {
        product_id: input.product_id,
        variant_id: input.variant_id ?? undefined,
        note: input.note ?? undefined,
      },
    })) as { wishlist_item: WishlistItem; duplicate?: boolean }
    revalidateTag(WISHLIST_TAG, "max")
    return { ok: true, item: res.wishlist_item, duplicate: Boolean(res.duplicate) }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save.",
    }
  }
}

export async function removeFromWishlist(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to manage your wishlist." }
  }
  try {
    await sdk.client.fetch(
      `/store/customers/me/wishlist/${encodeURIComponent(id)}`,
      { method: "DELETE", headers }
    )
    revalidateTag(WISHLIST_TAG, "max")
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to remove.",
    }
  }
}
