"use server"

import { sdk } from "@lib/config"

export type ArtworkApprovalState = {
  order_id: string
  order_display_id: number | null
  artwork_stage: string | null
  artwork_approved_at: string | null
  artwork_approver_name: string | null
  latest_photo_url: string | null
  mockup_urls: { side: string; side_label?: string | null; url: string }[]
}

export async function getArtworkApproval(
  orderId: string,
  sig: string
): Promise<ArtworkApprovalState | null> {
  try {
    return (await sdk.client.fetch("/store/artwork-approval", {
      query: { order: orderId, sig },
    })) as ArtworkApprovalState
  } catch {
    return null
  }
}

export async function submitArtworkDecision(input: {
  order: string
  sig: string
  approved: boolean
  approver_name?: string
  comment?: string
}): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  try {
    const res = (await sdk.client.fetch("/store/artwork-approval", {
      method: "POST",
      body: input,
    })) as { ok: boolean; status: string }
    if (!res?.ok) {
      return { ok: false, error: "Server rejected the decision." }
    }
    return { ok: true, status: res.status }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Submit failed.",
    }
  }
}
