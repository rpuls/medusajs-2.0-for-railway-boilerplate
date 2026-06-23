"use server"

import { searchProducts } from "@lib/data/products"

export async function search(query: string, countryCode: string = "vn") {
  return searchProducts({ query, countryCode, limit: 6 })
}
