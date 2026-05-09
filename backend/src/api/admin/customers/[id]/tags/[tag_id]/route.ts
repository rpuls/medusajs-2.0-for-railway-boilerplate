import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../../modules/admin-workspace"

/**
 * DELETE /admin/customers/:id/tags/:tag_id
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const tagId = req.params.tag_id
  if (!tagId) return res.status(400).json({ error: "tag_id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.deleteCustomerTags([tagId])
    return res.json({ id: tagId, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete tag",
      detail: String(err?.message ?? err),
    })
  }
}
