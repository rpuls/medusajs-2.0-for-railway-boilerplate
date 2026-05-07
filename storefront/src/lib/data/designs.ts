"use server"

import { sdk } from "@lib/config"
import { revalidateTag } from "next/cache"
import { cache } from "react"

import type { CustomizerMetadata } from "@modules/customizer/lib/types"
import { getAuthHeaders } from "./cookies"

export type SavedDesign = {
  id: string
  customer_id: string
  name: string
  thumbnail_url: string | null
  base_product_id: string | null
  base_variant_id: string | null
  customizer_metadata: CustomizerMetadata
  created_at: string
  updated_at: string
}

const DESIGNS_TAG = "customer-designs"

const designsCacheInit = {
  next: { tags: [DESIGNS_TAG] as string[] },
}

export const listMyDesigns = cache(async function (
  options: { limit?: number; offset?: number } = {}
): Promise<{ designs: SavedDesign[]; count: number }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { designs: [], count: 0 }
  }

  try {
    const res = (await sdk.client.fetch("/store/customers/me/designs", {
      query: {
        limit: options.limit ?? 50,
        offset: options.offset ?? 0,
      },
      headers: { ...headers, ...designsCacheInit },
    })) as { designs?: SavedDesign[]; count?: number }
    return { designs: res.designs ?? [], count: res.count ?? 0 }
  } catch {
    return { designs: [], count: 0 }
  }
})

export const getMyDesign = cache(async function (
  id: string
): Promise<SavedDesign | null> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return null
  }
  try {
    const res = (await sdk.client.fetch(`/store/customers/me/designs/${encodeURIComponent(id)}`, {
      headers: { ...headers, ...designsCacheInit },
    })) as { design?: SavedDesign }
    return res.design ?? null
  } catch {
    return null
  }
})

export async function createMyDesign(input: {
  name: string
  thumbnail_url?: string | null
  base_product_id?: string | null
  base_variant_id?: string | null
  customizer_metadata: CustomizerMetadata
}): Promise<{ ok: true; design: SavedDesign } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to save designs." }
  }
  try {
    const res = (await sdk.client.fetch("/store/customers/me/designs", {
      method: "POST",
      headers,
      body: {
        name: input.name,
        thumbnail_url: input.thumbnail_url ?? undefined,
        base_product_id: input.base_product_id ?? undefined,
        base_variant_id: input.base_variant_id ?? undefined,
        customizer_metadata: input.customizer_metadata,
      },
    })) as { design: SavedDesign }
    revalidateTag(DESIGNS_TAG)
    return { ok: true, design: res.design }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save design.",
    }
  }
}

export async function renameMyDesign(
  id: string,
  name: string
): Promise<{ ok: true; design: SavedDesign } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to update designs." }
  }
  try {
    const res = (await sdk.client.fetch(
      `/store/customers/me/designs/${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers,
        body: { name },
      }
    )) as { design: SavedDesign }
    revalidateTag(DESIGNS_TAG)
    return { ok: true, design: res.design }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to rename design.",
    }
  }
}

export async function deleteMyDesign(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) {
    return { ok: false, error: "Sign in to delete designs." }
  }
  try {
    await sdk.client.fetch(`/store/customers/me/designs/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    })
    revalidateTag(DESIGNS_TAG)
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete design.",
    }
  }
}
