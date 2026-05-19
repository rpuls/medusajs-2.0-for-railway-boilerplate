import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../../modules/admin-workspace"
import { writeAudit } from "../../../../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../../../../lib/audit-entities"

/**
 * DELETE /admin/customers/:id/tags/:tag_id
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const tagId = req.params.tag_id
  const customerId = req.params.id
  if (!tagId) return res.status(400).json({ error: "tag_id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const actor = (req as any).auth_context?.actor_id ?? null

  // Snapshot the tag for the audit row before deletion.
  let tagSnapshot: { label?: string; color?: string } | null = null
  try {
    const existing = await service.retrieveCustomerTag(tagId)
    tagSnapshot = existing
      ? { label: (existing as any).label, color: (existing as any).color }
      : null
  } catch {
    /* tag may not exist; deletion still proceeds */
  }

  try {
    await service.deleteCustomerTags([tagId])
    if (customerId) {
      await writeAudit({
        container: req.scope as any,
        entity: AUDIT_ENTITY.CUSTOMER,
        entity_id: customerId,
        action: AUDIT_ACTION.TAG_REMOVED,
        actor_id: actor,
        details: { tag_id: tagId, ...(tagSnapshot ?? {}) },
      })
    }
    return res.json({ id: tagId, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete tag",
      detail: String(err?.message ?? err),
    })
  }
}
