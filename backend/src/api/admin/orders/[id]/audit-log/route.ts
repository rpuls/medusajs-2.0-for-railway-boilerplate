import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/orders/:id/audit-log — full activity trail for an order.
 *
 * Includes both:
 *   - Polymorphic audit_log entries (entity = "order", entity_id = id)
 *   - In-line stage transitions from order.metadata.production_stage_history
 *     (those are written to metadata, not audit_log, for performance —
 *     stage changes happen often and going through audit_log every time
 *     would balloon the table).
 *
 * Combines both into a single chronological list for the UI to render.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const orderId = req.params.id
  if (!orderId) return res.status(400).json({ error: "id required" })

  // Audit log entries pinned to this order
  let auditRows: any[] = []
  try {
    const { data } = await query.graph({
      entity: "audit_log",
      fields: [
        "id",
        "action",
        "actor_id",
        "actor_email",
        "details",
        "created_at",
      ],
      filters: { entity: "order", entity_id: orderId },
      pagination: { take: 500, skip: 0, order: { created_at: "DESC" } },
    })
    auditRows = (data as any[]) ?? []
  } catch {
    auditRows = []
  }

  // Stage history from order metadata
  let stageRows: any[] = []
  try {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "metadata"],
      filters: { id: orderId },
      pagination: { take: 1, skip: 0 },
    })
    const order = (data as any[])?.[0]
    const history = (order?.metadata as any)?.production_stage_history
    if (Array.isArray(history)) {
      stageRows = history
        .filter(
          (e: any) =>
            e &&
            typeof e === "object" &&
            typeof e.stage === "string" &&
            typeof e.changed_at === "string"
        )
        .map((e: any) => ({
          id: `stage_${e.changed_at}_${e.stage}`,
          action: "stage_changed",
          actor_id: typeof e.changed_by === "string" ? e.changed_by : null,
          actor_email: null,
          details: { to_stage: e.stage, note: e.note ?? null },
          created_at: e.changed_at,
        }))
    }
  } catch {
    stageRows = []
  }

  const combined = [...auditRows, ...stageRows].sort(
    (a, b) => Date.parse(b.created_at ?? "0") - Date.parse(a.created_at ?? "0")
  )

  return res.json({ entries: combined })
}
