import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../modules/admin-workspace"

/**
 * DELETE /admin/admin-workspace/bookmarks/:id
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.deleteAdminBookmarks([id])
    return res.json({ id, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete bookmark",
      detail: String(err?.message ?? err),
    })
  }
}
