import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../../modules/admin-workspace"

/**
 * DELETE /admin/orders/:id/comments/:comment_id
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const commentId = req.params.comment_id
  if (!commentId) return res.status(400).json({ error: "comment_id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.deleteOrderComments([commentId])
    return res.json({ id: commentId, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete comment",
      detail: String(err?.message ?? err),
    })
  }
}
