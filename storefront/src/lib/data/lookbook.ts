"use server"

import { sdk } from "@lib/config"

export type LookbookItem = {
  id: string
  title: string
  description: string | null
  image_url: string
  attribution: string | null
  tags: string[]
  product_ids: string[]
}

export async function getLookbookItems(): Promise<LookbookItem[]> {
  try {
    const res = (await sdk.client.fetch("/store/lookbook")) as {
      items?: LookbookItem[]
    }
    return res.items ?? []
  } catch {
    return []
  }
}
