import { PANCAKE_API_BASE, PANCAKE_API_KEY, PANCAKE_SHOP_ID } from "./constants"

export type PancakeProduct = { name: string; code: string; pancake_id: string }

/** Lấy toàn bộ sản phẩm từ Pancake POS (phân trang). */
export async function fetchPancakeProducts(): Promise<PancakeProduct[]> {
  if (!PANCAKE_API_KEY || !PANCAKE_SHOP_ID) {
    throw new Error("Chưa cấu hình PANCAKE_API_KEY / PANCAKE_SHOP_ID")
  }
  const fetched: PancakeProduct[] = []
  let page = 1
  while (true) {
    const url = `${PANCAKE_API_BASE}/shops/${PANCAKE_SHOP_ID}/products?api_key=${PANCAKE_API_KEY}&page=${page}&limit=100`
    const r = await fetch(url)
    if (!r.ok) {
      console.error("[pancake-client] fetch failed:", r.status, r.statusText)
      break
    }
    const data: any = await r.json()
    const items: any[] = data.data ?? data.products ?? []
    if (!items.length) break
    for (const p of items) {
      const name = (p.name || "").trim()
      const code = (p.custom_id || p.variations?.[0]?.display_id || "").trim().toUpperCase()
      const pancake_id = String(p.id || "")
      if (name) fetched.push({ name, code, pancake_id })
    }
    if (page >= (data.total_pages ?? 1)) break
    page++
  }
  return fetched
}
