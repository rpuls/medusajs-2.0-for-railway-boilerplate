import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPool, getAuthInfo } from "../../_lib"

/**
 * DELETE /admin/video-content/post/:postId — hủy bài đang lên lịch (chưa đăng).
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const auth = await getAuthInfo(req)
    if (!auth) return res.status(401).json({ error: "Unauthenticated" })
    const id = (req.params as any).postId
    const pool = getPool()
    await pool.query(`UPDATE fb_scheduled_post SET status = 'cancelled' WHERE id = $1 AND status = 'scheduled'`, [id])
    return res.json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}
