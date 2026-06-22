import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, ensureTables, getAuthInfo } from "../_lib"
import { getPostInsights } from "../../../../lib/fb-graph"

/**
 * GET /admin/video-content/post-stats — list insights đã đồng bộ
 * POST /admin/video-content/post-stats { post_id } — sync insights cho 1 post đã đăng
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const pool = getPool()
    await ensureTables(pool)
    const { rows } = await pool.query(`SELECT * FROM fb_post_stats ORDER BY synced_at DESC LIMIT 200`)
    return res.json({ stats: rows })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const b = (req.body as any) ?? {}
    if (!b.post_id) return res.status(400).json({ error: "Thiếu post_id" })

    const pool = getPool()
    await ensureTables(pool)
    const { rows: [post] } = await pool.query(
      `SELECT p.post_id, p.page_id, p.page_name, t.access_token
         FROM fb_scheduled_post p
         JOIN fb_page_token t ON t.page_id = p.page_id
        WHERE p.post_id = $1`,
      [b.post_id]
    )
    if (!post) return res.status(404).json({ error: "Không tìm thấy bài đăng" })

    const insights = await getPostInsights(post.post_id, post.access_token)
    await pool.query(
      `INSERT INTO fb_post_stats (post_id, page_id, page_name, likes, comments, shares, reach, video_views, synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
       ON CONFLICT (post_id) DO UPDATE SET
         likes = EXCLUDED.likes, comments = EXCLUDED.comments, shares = EXCLUDED.shares,
         reach = EXCLUDED.reach, video_views = EXCLUDED.video_views, synced_at = now()`,
      [post.post_id, post.page_id, post.page_name, insights.likes, insights.comments, insights.shares, insights.reach, insights.video_views]
    )
    return res.json({ ok: true, insights })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
