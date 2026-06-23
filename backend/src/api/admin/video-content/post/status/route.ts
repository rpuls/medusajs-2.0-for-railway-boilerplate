import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, getAuthInfo } from "../../_lib"

/**
 * GET /admin/video-content/post/status?jobId=xxx
 * Poll trạng thái job đăng bài FB.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const jobId = (req.query as any).jobId
    if (!jobId) return res.status(400).json({ error: "Thiếu jobId" })
    const pool = getPool()
    const { rows } = await pool.query(`SELECT * FROM fb_publish_job WHERE id = $1`, [jobId])
    if (!rows.length) return res.status(404).json({ error: "Không tìm thấy job" })
    const j = rows[0]
    return res.json({
      status: j.status,
      done: j.done,
      total: j.total,
      progress: Array.isArray(j.progress) ? j.progress : JSON.parse(j.progress || "[]"),
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
