import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, ensureTables, getAuthInfo, filterByPerm } from "../_lib"
import { fetchAllPageTokens, isTokenError } from "../../../../lib/fb-graph"

const CACHE_TTL_HOURS = 24

async function getPageTokens(pool: any, force = false) {
  if (!force) {
    const { rows } = await pool.query(
      `SELECT page_id, page_name, access_token, category, fan_count, hoat_dong
       FROM fb_page_token WHERE fetched_at > now() - interval '${CACHE_TTL_HOURS} hours'`
    )
    if (rows.length) return rows
  }
  const pages = await fetchAllPageTokens()
  for (const p of pages) {
    await pool.query(
      `INSERT INTO fb_page_token (page_id, page_name, access_token, category, fan_count, fetched_at)
       VALUES ($1,$2,$3,$4,$5, now())
       ON CONFLICT (page_id) DO UPDATE SET
         page_name = EXCLUDED.page_name, access_token = EXCLUDED.access_token,
         category = EXCLUDED.category, fan_count = EXCLUDED.fan_count, fetched_at = now()`,
      [p.page_id, p.page_name, p.access_token, p.category, p.fan_count]
    )
  }
  return pages.map(p => ({ ...p, hoat_dong: "active" }))
}

/**
 * GET /admin/video-content/pages — list Facebook Page đã kết nối (đã lọc quyền)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const q = req.query as Record<string, string>
    const pool = getPool()
    await ensureTables(pool)

    let pages: any[]
    try {
      pages = await getPageTokens(pool, q.force_refresh === "true")
    } catch (e: any) {
      if (isTokenError(e)) return res.status(200).json({ pages: [], error: "FB_TOKEN_EXPIRED" })
      throw e
    }
    const filtered = (q.all === "true" && auth.isAdmin) ? pages : filterByPerm(pages, auth)
    const visible = filtered.map(p => ({
      page_id: p.page_id, page_name: p.page_name, category: p.category, fan_count: p.fan_count, hoat_dong: p.hoat_dong,
    }))
    return res.json({ pages: visible })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * PATCH /admin/video-content/pages — cập nhật trạng thái hoạt động 1 page
 * Body: { page_id, hoat_dong: "active"|"paused"|"stopped" }
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const b = (req.body as any) ?? {}
    if (!b.page_id) return res.status(400).json({ error: "Thiếu page_id" })
    const pool = getPool()
    await ensureTables(pool)
    await pool.query(`UPDATE fb_page_token SET hoat_dong = $1 WHERE page_id = $2`, [b.hoat_dong || "active", b.page_id])
    return res.json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
