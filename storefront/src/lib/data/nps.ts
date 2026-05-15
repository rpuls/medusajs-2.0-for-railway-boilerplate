"use server"

import { sdk } from "@lib/config"

export async function recordNpsResponse(input: {
  order: string
  score: number
  sig: string
  comment?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await sdk.client.fetch("/store/nps", {
      method: "POST",
      body: input,
    })
    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to record rating.",
    }
  }
}
