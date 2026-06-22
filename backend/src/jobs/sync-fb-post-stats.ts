import { MedusaContainer } from "@medusajs/framework/types"
import { Pool } from "pg"
import { getPostInsights } from "../lib/fb-graph"

/** Đồng bộ insights (likes/comments/shares/reach) cho các bài FB đã đăng trong 30 ngày gần nhất. */
export default async function syncFbPostStats(_container: MedusaContainer) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const { rows: posts } = await pool.query(`
      SELECT p.post_id, p.page_id, p.page_name, t.access_token
        FROM fb_scheduled_post p
        JOIN fb_page_token t ON t.page_id = p.page_id
       WHERE p.post_id IS NOT NULL AND p.status = 'published'
         AND p.published_at > now() - interval '30 days'
       LIMIT 200
    `)
    for (const post of posts) {
      try {
        const insights = await getPostInsights(post.post_id, post.access_token)
        await pool.query(
          `INSERT INTO fb_post_stats (post_id, page_id, page_name, likes, comments, shares, reach, video_views, synced_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
           ON CONFLICT (post_id) DO UPDATE SET
             likes = EXCLUDED.likes, comments = EXCLUDED.comments, shares = EXCLUDED.shares,
             reach = EXCLUDED.reach, video_views = EXCLUDED.video_views, synced_at = now()`,
          [post.post_id, post.page_id, post.page_name, insights.likes, insights.comments, insights.shares, insights.reach, insights.video_views]
        )
      } catch (e: any) {
        console.error("[sync-fb-post-stats] post error:", post.post_id, e.message)
      }
    }
  } catch (e: any) {
    console.error("[sync-fb-post-stats] job error:", e.message)
  } finally {
    await pool.end()
  }
}

export const config = {
  name: "sync-fb-post-stats",
  schedule: "0 */6 * * *",
}
