import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, getAuthInfo, pushNotification } from "../../_lib"
import { analyzeVideoWithGemini } from "../../../../../lib/ai-client"

function toDirectDownloadUrl(link: string): string {
  const m = link.match(/\/d\/([a-zA-Z0-9_-]+)/) || link.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (!m) return link
  return `https://drive.usercontent.google.com/download?id=${m[1]}&export=download&confirm=t`
}

async function runAnalysis(pool: any, id: string, link: string, model: string, email: string, req: MedusaRequest) {
  const setStatus = (status: string) => pool.query(`UPDATE mkt_video SET ai_status = $1, updated_at = now() WHERE id = $2`, [status, id])
  try {
    await setStatus("uploading")
    const directUrl = toDirectDownloadUrl(link)
    await setStatus("analyzing")
    const review = await analyzeVideoWithGemini(directUrl, model)

    await pool.query(
      `UPDATE mkt_video SET ai_status = 'done', ai_score = $1, ai_review = $2,
         script = COALESCE(NULLIF(script, ''), $3), updated_at = now()
       WHERE id = $4`,
      [review.diem_ban_hang, JSON.stringify(review), review.loi_thoai || "", id]
    )
    await pushNotification(req, {
      title: `🤖 Phân tích AI xong: điểm ${review.diem_ban_hang}/10`,
      description: review.tong_quan?.slice(0, 150) || "",
    })
  } catch (e: any) {
    await setStatus("error")
    console.error("[video-content analyze] error:", e.message)
    await pushNotification(req, { title: "❌ Phân tích AI thất bại", description: e.message?.slice(0, 150) })
  }
}

/**
 * POST /admin/video-content/:id/analyze
 * Body: { model? } — fire-and-forget, trả ngay { queued: true }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })

    const id = (req.params as any).id
    const b = (req.body as any) ?? {}
    const model = b.model || "gemini-2.0-flash"

    const pool = getPool()
    const { rows: [video] } = await pool.query(`SELECT id, link FROM mkt_video WHERE id = $1`, [id])
    if (!video) return res.status(404).json({ error: "Không tìm thấy video" })
    if (!video.link) return res.status(400).json({ error: "Video chưa có link" })

    await pool.query(`UPDATE mkt_video SET ai_status = 'queued', updated_at = now() WHERE id = $1`, [id])

    runAnalysis(pool, id, video.link, model, auth.email, req).catch((e) => {
      console.error("[video-content analyze] fire-and-forget error:", e.message)
    })

    return res.json({ queued: true, ai_status: "queued" })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

/**
 * GET /admin/video-content/:id/analyze — poll trạng thái AI
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const id = (req.params as any).id
    const pool = getPool()
    const { rows } = await pool.query(`SELECT ai_status, ai_score, ai_review FROM mkt_video WHERE id = $1`, [id])
    if (!rows.length) return res.status(404).json({ error: "Not found" })
    const r = rows[0]
    return res.json({ aiStatus: r.ai_status ?? null, aiScore: r.ai_score ? parseFloat(r.ai_score) : null, aiReview: r.ai_review ?? null })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
