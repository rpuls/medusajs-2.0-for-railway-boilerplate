import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type CalendarEntry = {
  order_id: string
  display_id: number | null
  email: string | null
  total: number
  currency_code: string
  stage: string | null
  created_at: string
  deadline_at: string | null
  is_stale: boolean
}

/**
 * GET /admin/production-calendar
 *   → { entries: CalendarEntry[] }
 *
 * Every in-flight order (not delivered, not cancelled) with its
 * created_at and optional deadline. Deadline comes from
 * `metadata.deadline_at` if staff have set one, otherwise null.
 *
 * Live read — small data volume (orders in flight). Frontend renders
 * the Gantt-style view.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "status",
      "created_at",
      "metadata",
    ],
    pagination: { take: 5000, skip: 0 },
  })

  const entries: CalendarEntry[] = []
  for (const o of (orders as any[]) ?? []) {
    if ((o?.status ?? "").toLowerCase() === "canceled") continue
    const meta = (o?.metadata as Record<string, unknown> | undefined) ?? {}
    const stage = typeof meta.production_stage === "string" ? meta.production_stage : null
    if (stage === "delivered") continue
    entries.push({
      order_id: o.id as string,
      display_id: typeof o.display_id === "number" ? o.display_id : null,
      email: typeof o.email === "string" ? o.email : null,
      total:
        typeof o.total === "number"
          ? o.total
          : typeof o.total === "string"
            ? Number.parseFloat(o.total)
            : typeof (o.total as any)?.numeric === "number"
              ? Number((o.total as any).numeric)
              : 0,
      currency_code: String(o.currency_code ?? "aud").toUpperCase(),
      stage,
      created_at: o.created_at as string,
      deadline_at:
        typeof meta.deadline_at === "string" ? (meta.deadline_at as string) : null,
      is_stale: meta.is_stale === true,
    })
  }

  // Sort: orders with a deadline first (by deadline asc), then the rest by oldest first.
  entries.sort((a, b) => {
    if (a.deadline_at && b.deadline_at)
      return a.deadline_at < b.deadline_at ? -1 : 1
    if (a.deadline_at) return -1
    if (b.deadline_at) return 1
    return a.created_at < b.created_at ? -1 : 1
  })

  res.json({ entries })
}
