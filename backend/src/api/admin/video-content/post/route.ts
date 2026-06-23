import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { getPool, ensureTables, getAuthInfo, filterByPerm, pushNotification } from "../_lib"
import { publishPost, isTokenError } from "../../../../lib/fb-graph"

const BATCH = 5

/** FB yêu cầu lịch đăng 10 phút → 6 tháng tới. Trả unix hoặc null (đăng ngay). */
function parseScheduled(iso?: string): number | null {
  if (!iso) return null
  const t = Math.floor(new Date(iso).getTime() / 1000)
  const now = Math.floor(Date.now() / 1000)
  if (t < now + 600) return null
  if (t > now + 180 * 86400) throw new Error("Lịch đăng không được quá 6 tháng")
  return t
}

async function getAllowedPages(pool: any, auth: any) {
  const { rows } = await pool.query(
    `SELECT page_id, page_name, access_token FROM fb_page_token WHERE hoat_dong != 'stopped'`
  )
  return filterByPerm<{ page_id: string; page_name: string; access_token: string }>(rows, auth)
}

async function runPublishJob(
  pool: any, jobId: string, notifSvc: any,
  pages: Array<{ page_id: string; page_name: string; access_token: string }>,
  payload: { message: string; driveUrl?: string; mediaType: "text" | "video" | "photo"; scheduledTime: number | null; videoId?: string; email: string; title?: string }
) {
  const progress: any[] = []
  let done = 0

  for (let i = 0; i < pages.length; i += BATCH) {
    const slice = pages.slice(i, i + BATCH)
    await Promise.all(slice.map(async (page) => {
      let entry: any
      try {
        const { post_id } = await publishPost({
          pageId: page.page_id, pageToken: page.access_token,
          message: payload.message, driveUrl: payload.driveUrl,
          mediaType: payload.mediaType, scheduledTime: payload.scheduledTime ?? undefined,
          title: payload.title,
        })
        entry = { page_id: page.page_id, page_name: page.page_name, status: "success", post_id }
        await pool.query(
          `INSERT INTO fb_scheduled_post (page_id, page_name, post_id, message, drive_url, media_type, video_id, scheduled_for, published_at, status, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [page.page_id, page.page_name, post_id, payload.message, payload.driveUrl ?? null, payload.mediaType,
           payload.videoId ?? null,
           payload.scheduledTime ? new Date(payload.scheduledTime * 1000) : null,
           payload.scheduledTime ? null : new Date(),
           payload.scheduledTime ? "scheduled" : "published", payload.email]
        )
      } catch (e: any) {
        const msg = isTokenError(e) ? "Token hết hạn" : (e.message || "Lỗi không xác định")
        entry = { page_id: page.page_id, page_name: page.page_name, status: "failed", error: msg }
        await pool.query(
          `INSERT INTO fb_scheduled_post (page_id, page_name, message, drive_url, media_type, video_id, status, error_msg, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,'failed',$7,$8)`,
          [page.page_id, page.page_name, payload.message, payload.driveUrl ?? null, payload.mediaType, payload.videoId ?? null, msg, payload.email]
        )
      }
      progress.push(entry); done++
      await pool.query(`UPDATE fb_publish_job SET done = $1, progress = $2 WHERE id = $3`, [done, JSON.stringify(progress), jobId])
    }))
  }

  const anyOk = progress.some(p => p.status === "success")
  const allOk = progress.every(p => p.status === "success")
  await pool.query(`UPDATE fb_publish_job SET status = $1, finished_at = now() WHERE id = $2`, [allOk || anyOk ? "completed" : "failed", jobId])

  if (payload.videoId && anyOk) {
    const newStatus = payload.scheduledTime ? "scheduled" : "posted"
    const newLinks = progress
      .filter(p => p.status === "success" && p.post_id)
      .map(p => ({ page_id: p.page_id, page_name: p.page_name, post_url: `https://www.facebook.com/${p.post_id}`, posted_at: new Date().toISOString() }))
    const { rows: [cur] } = await pool.query(`SELECT fb_post_links FROM mkt_video WHERE id = $1`, [payload.videoId])
    const existing: any[] = Array.isArray(cur?.fb_post_links) ? cur.fb_post_links : []
    const existingUrls = new Set(existing.map((l: any) => l.post_url))
    const merged = [...existing, ...newLinks.filter(l => !existingUrls.has(l.post_url))]
    await pool.query(`UPDATE mkt_video SET status = $1, fb_post_links = $2, updated_at = now() WHERE id = $3`, [newStatus, JSON.stringify(merged), payload.videoId])
  }

  const okCount = progress.filter(p => p.status === "success").length
  const failCount = progress.filter(p => p.status !== "success").length
  const isScheduled = !!payload.scheduledTime
  const pageLines = progress.map(p => `  ${p.status === "success" ? "✓" : "✗"} ${p.page_name}${p.status !== "success" ? `: ${p.error || "lỗi"}` : ""}`).join("\n")
  const title = allOk
    ? (isScheduled ? `📅 Lên lịch ${okCount} trang` : `✅ Đã đăng ${okCount} trang`)
    : anyOk ? `⚠️ ${okCount} thành công, ${failCount} thất bại` : `❌ Thất bại tất cả ${failCount} trang`
  try {
    await (notifSvc as any).createNotifications({ channel: "feed", template: "admin-ui", to: "admin", data: { title, description: pageLines } })
  } catch {}
}

/**
 * GET /admin/video-content/post?posts=1 — list bài đã đăng/lên lịch
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const q = req.query as Record<string, string>
    const pool = getPool()
    await ensureTables(pool)

    const params: any[] = []
    let where = "WHERE 1=1"
    if (q.status) { params.push(q.status); where += ` AND p.status = $${params.length}` }
    if (q.from) { params.push(q.from); where += ` AND COALESCE(p.published_at, p.scheduled_for, p.created_at) >= $${params.length}` }
    if (q.to)   { params.push(q.to);   where += ` AND COALESCE(p.published_at, p.scheduled_for, p.created_at) <= $${params.length}` }
    if (!auth.isAdmin && auth.email) { params.push(auth.email); where += ` AND p.created_by = $${params.length}` }

    const { rows } = await pool.query(
      `SELECT p.*, v.vd_code, v.product, v.maker
         FROM fb_scheduled_post p
         LEFT JOIN mkt_video v ON v.id = p.video_id
       ${where} ORDER BY COALESCE(p.published_at, p.scheduled_for, p.created_at) DESC LIMIT 200`,
      params
    )
    return res.json({ posts: rows })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * POST /admin/video-content/post — tạo job đăng nền, trả 202 { jobId }.
 * body: { page_ids[], message, drive_url?, media_type, scheduled_for?, video_id? }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })

    const b: Record<string, any> = (req.body && typeof req.body === "object") ? (req.body as any) : {}
    const pageIds: string[] = Array.isArray(b.page_ids) ? b.page_ids.map(String) : []
    const message: string = b.message ?? ""
    if (!pageIds.length) return res.status(400).json({ error: "Chưa chọn trang nào" })
    if (!message.trim() && (b.media_type ?? "text") === "text") return res.status(400).json({ error: "Nội dung trống" })

    let scheduledTime: number | null
    try { scheduledTime = parseScheduled(b.scheduled_for) }
    catch (e: any) { return res.status(400).json({ error: e.message }) }

    const pool = getPool()
    await ensureTables(pool)
    const allowed = await getAllowedPages(pool, auth)
    const selected = allowed.filter((p: any) => pageIds.includes(p.page_id))
    if (!selected.length) return res.status(403).json({ error: "Không có quyền đăng các trang đã chọn" })

    const { rows: [job] } = await pool.query(
      `INSERT INTO fb_publish_job (total, done, status, progress, created_by) VALUES ($1, 0, 'running', '[]', $2) RETURNING id`,
      [selected.length, auth.email]
    )

    const notifSvc = req.scope.resolve(Modules.NOTIFICATION)

    runPublishJob(pool, job.id, notifSvc, selected, {
      message, driveUrl: b.drive_url, mediaType: (b.media_type ?? "text"),
      scheduledTime, videoId: b.video_id, email: auth.email, title: b.title,
    }).catch((e) => {
      console.error("[video-content post job error]", e?.message)
    })

    return res.status(202).json({ jobId: job.id, total: selected.length })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
