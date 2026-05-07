"use server"

import { HttpTypes } from "@medusajs/types"

import { getProductsList } from "./products"

export type CustomizerSearchProduct = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
}

/**
 * Server action used by the in-customizer "Choose a product" picker.
 *
 * The picker is opened with a pre-loaded slice of the catalog (~60 products)
 * for instant rendering. Once the user types into the search box, this hits
 * the Store API with `q=<term>` so the lookup spans the FULL catalog — not
 * just the slice. Without this, anything beyond the first 60 products was
 * effectively invisible (e.g. searching "5001" returned zero results because
 * Staple Tee | 5001 happened to be the 80-something-th product).
 *
 * Returns a trimmed shape (id, handle, title, thumbnail) to keep the over-
 * the-wire payload small. No pricing — the picker doesn't render it.
 */
export async function searchCustomizerProducts(
  query: string,
  countryCode: string
): Promise<CustomizerSearchProduct[]> {
  const q = query.trim()
  if (!q) return []

  try {
    const {
      response: { products },
    } = await getProductsList({
      countryCode,
      queryParams: {
        q,
        limit: 60,
        fields: "id,handle,title,thumbnail",
      } as HttpTypes.StoreProductParams,
    })
    return products
      .map((p) => ({
        id: p.id,
        handle: p.handle ?? "",
        title: p.title ?? "Untitled",
        thumbnail: p.thumbnail ?? null,
      }))
      .filter((p) => p.handle.length > 0)
  } catch {
    return []
  }
}
