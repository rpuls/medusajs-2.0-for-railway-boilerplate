import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/reports/regions
 *
 * Lightweight regions list for the Reports page filter dropdown. Just
 * id + name — the admin's existing /admin/regions endpoint returns far
 * more than we need and this keeps the filter bar fast.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  try {
    const { data } = await query.graph({
      entity: "region",
      fields: ["id", "name", "currency_code"],
      pagination: { take: 100, skip: 0 },
    })
    const regions = ((data as any[]) ?? []).map((r) => ({
      id: r.id,
      name: r.name ?? r.id,
      currency_code: r.currency_code ?? null,
    }))
    regions.sort((a, b) => a.name.localeCompare(b.name))
    return res.json({ regions })
  } catch (err: any) {
    logger.error?.(`[reports/regions] graph failed: ${err?.message ?? err}`)
    return res.json({ regions: [] })
  }
}
