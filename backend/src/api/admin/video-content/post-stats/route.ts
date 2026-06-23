import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, ensureTables, getAuthInfo } from "../_lib"

const FB_V = "v18.0"

/**
 * GET /admin/video-content/post-stats — list bài đã đăng + filter + summary
 * Query: page_id?, product_code?, from?, to?, sort?, limit?, offset?
 * POST /admin/video-content/post-stats { page_id? } — sync feed + insights từ Facebook (toàn bộ page hoặc 1 page)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const pool = getPool()
    await ensureTables(pool)
    const q = req.query as Record<string, string>

    const params: any[] = []
    let where = "WHERE 1=1"
    if (q.page_id)      { params.push(q.page_id); where += ` AND page_id = $${params.length}` }
    if (q.product_code) { params.push(q.product_code); where += ` AND UPPER(product_code) = UPPER($${params.length})` }
    if (q.from) { params.push(q.from); where += ` AND published_at >= $${params.length}` }
    if (q.to)   { params.push(q.to);   where += ` AND published_at <= $${params.length}` }

    const allowed = ["likes", "comments", "shares", "reach", "published_at"]
    const sort = allowed.includes(q.sort) ? q.sort : "published_at"
    const limit = Math.min(parseInt(q.limit || "50") || 50, 200)
    const offset = parseInt(q.offset || "0") || 0

    const { rows } = await pool.query(
      `SELECT * FROM fb_post_stats ${where} ORDER BY ${sort} DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    )
    const { rows: countRows } = await pool.query(`SELECT COUNT(*) AS total FROM fb_post_stats ${where}`, params)
    const { rows: sumRows } = await pool.query(
      `SELECT SUM(likes) AS total_likes, SUM(comments) AS total_comments,
              SUM(shares) AS total_shares, SUM(reach) AS total_reach,
              MAX(synced_at) AS last_synced
         FROM fb_post_stats ${where}`,
      params
    )
    return res.json({ posts: rows, total: parseInt(countRows[0].total, 10), summary: sumRows[0] })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

async function syncPageStats(pool: any, pageId: string, pageToken: string, pageName: string): Promise<number> {
  const feedUrl = `https://graph.facebook.com/${FB_V}/${pageId}/feed?fields=id,message,created_time,full_picture,likes.summary(true),comments.summary(true),shares,attachments&limit=50&access_token=${pageToken}`
  const feed = await fetch(feedUrl).then(r => r.json()) as any
  if (feed?.error) throw new Error(feed.error.message)
  const posts: any[] = feed.data ?? []

  const postIds = posts.map(p => p.id).filter(Boolean)
  const productMap: Record<string, { product_code: string | null; product_name: string | null; created_by: string | null }> = {}
  if (postIds.length > 0) {
    const { rows: dbPosts } = await pool.query(
      `SELECT p.post_id, v.product_code, mp.name AS product_name, p.created_by
         FROM fb_scheduled_post p
         LEFT JOIN mkt_video v ON v.id = p.video_id
         LEFT JOIN mkt_product mp ON UPPER(mp.code) = UPPER(v.product_code)
        WHERE p.post_id = ANY($1::text[])`,
      [postIds]
    )
    for (const r of dbPosts) {
      productMap[r.post_id] = { product_code: r.product_code, product_name: r.product_name, created_by: r.created_by }
    }
  }

  let synced = 0
  for (const post of posts) {
    const postId = post.id
    if (!postId) continue

    const likes = post.likes?.summary?.total_count ?? 0
    const comments = post.comments?.summary?.total_count ?? 0
    const shares = post.shares?.count ?? 0
    const attType: string = post.attachments?.data?.[0]?.type ?? ""
    const mediaType = attType.includes("video") ? "video" : attType.includes("photo") ? "image" : "text"
    const thumbnailUrl: string | null = post.full_picture ?? null

    let reach = 0
    try {
      const insightUrl = `https://graph.facebook.com/${FB_V}/${postId}/insights?metric=post_impressions_unique&access_token=${pageToken}`
      const insight = await fetch(insightUrl).then(r => r.json()) as any
      reach = insight?.data?.[0]?.values?.[0]?.value ?? 0
    } catch {}

    let videoViews = 0
    if (mediaType === "video") {
      try {
        const vUrl = `https://graph.facebook.com/${FB_V}/${postId}?fields=video_views&access_token=${pageToken}`
        const vd = await fetch(vUrl).then(r => r.json()) as any
        videoViews = vd?.video_views ?? 0
      } catch {}
    }

    const meta = productMap[postId] || { product_code: null, product_name: null, created_by: null }

    await pool.query(
      `INSERT INTO fb_post_stats (post_id, page_id, page_name, message, media_type, thumbnail_url,
                                   product_code, product_name, created_by, published_at,
                                   likes, comments, shares, reach, video_views, synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, now())
       ON CONFLICT (post_id) DO UPDATE SET
         likes = EXCLUDED.likes, comments = EXCLUDED.comments, shares = EXCLUDED.shares,
         reach = EXCLUDED.reach, video_views = EXCLUDED.video_views, synced_at = now(),
         media_type = EXCLUDED.media_type,
         thumbnail_url = COALESCE(EXCLUDED.thumbnail_url, fb_post_stats.thumbnail_url),
         product_code = COALESCE(EXCLUDED.product_code, fb_post_stats.product_code),
         product_name = COALESCE(EXCLUDED.product_name, fb_post_stats.product_name),
         created_by   = COALESCE(EXCLUDED.created_by, fb_post_stats.created_by)`,
      [postId, pageId, pageName, post.message ?? "", mediaType, thumbnailUrl,
       meta.product_code, meta.product_name, meta.created_by, post.created_time ?? null,
       likes, comments, shares, reach, videoViews]
    )
    synced++
  }
  return synced
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const pool = getPool()
    await ensureTables(pool)
    const b = (req.body as any) ?? {}

    const where = b.page_id ? "WHERE page_id = $1" : ""
    const { rows: pages } = await pool.query(
      `SELECT page_id, page_name, access_token FROM fb_page_token ${where}`,
      b.page_id ? [b.page_id] : []
    )
    if (!pages.length) return res.json({ ok: true, synced: 0, pages: 0 })

    let totalSynced = 0
    for (const page of pages) {
      try {
        totalSynced += await syncPageStats(pool, page.page_id, page.access_token, page.page_name)
      } catch (e: any) {
        console.error(`[post-stats] sync error page ${page.page_id}:`, e.message)
      }
    }
    return res.json({ ok: true, synced: totalSynced, pages: pages.length })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
