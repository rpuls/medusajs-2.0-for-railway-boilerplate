import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../modules/admin-workspace"

/**
 * DELETE /admin/email-suppressions/:id — remove a suppression row.
 * Used when staff need to manually re-enable a customer who's been
 * accidentally suppressed (e.g. a bounce that was actually a typo).
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.deleteEmailSuppressions([id])
    return res.json({ id, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "delete failed",
      detail: String(err?.message ?? err),
    })
  }
}
