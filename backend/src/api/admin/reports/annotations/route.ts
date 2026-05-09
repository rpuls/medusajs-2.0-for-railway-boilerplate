import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REPORT_ANNOTATION_MODULE } from "../../../../modules/report-annotation"

const VALID_COLORS = new Set(["slate", "teal", "amber", "rose", "emerald"])

const isIsoDate = (s: unknown): s is string => {
  if (typeof s !== "string") return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const ms = Date.parse(s)
  return Number.isFinite(ms)
}

/**
 * GET /admin/reports/annotations?from=&to=
 *   List annotations, optionally restricted to a date window. The
 *   Reports page passes the active date range so the overlay only
 *   shows annotations the chart can actually render.
 *
 * POST /admin/reports/annotations { date, label, description?, color? }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  try {
    const { data } = await query.graph({
      entity: "report_annotation",
      fields: ["id", "date", "label", "description", "color", "created_at"],
      pagination: { take: 1000, skip: 0, order: { date: "ASC" } },
    })
    let rows = (data as any[]) ?? []

    const fromIso = typeof req.query.from === "string" ? req.query.from : null
    const toIso = typeof req.query.to === "string" ? req.query.to : null
    if (fromIso || toIso) {
      const fromMs = fromIso ? Date.parse(fromIso) : -Infinity
      const toMs = toIso ? Date.parse(toIso) : Infinity
      rows = rows.filter((r) => {
        const ms = Date.parse(r?.date ?? "")
        if (!Number.isFinite(ms)) return false
        return ms >= fromMs && ms <= toMs
      })
    }

    return res.json({ annotations: rows })
  } catch (err: any) {
    logger.warn?.(
      `[annotations] graph failed (module not migrated yet?): ${err?.message ?? err}`
    )
    return res.json({ annotations: [], data_available: false })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const body = (req.body ?? {}) as any
  if (!isIsoDate(body.date)) {
    return res.status(400).json({
      error: "`date` must be an ISO date string (YYYY-MM-DD).",
    })
  }
  if (typeof body.label !== "string" || body.label.trim().length === 0) {
    return res.status(400).json({ error: "`label` is required." })
  }
  if (body.label.length > 80) {
    return res.status(400).json({
      error: "`label` is too long (max 80 chars). Put detail in `description`.",
    })
  }
  const color = typeof body.color === "string" ? body.color : "slate"
  if (!VALID_COLORS.has(color)) {
    return res.status(400).json({
      error: `\`color\` must be one of: ${Array.from(VALID_COLORS).join(", ")}.`,
    })
  }

  const service = req.scope.resolve(REPORT_ANNOTATION_MODULE) as any
  try {
    const created = await service.createReportAnnotations({
      date: body.date,
      label: body.label.trim(),
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description.trim()
          : null,
      color,
    })
    return res.status(201).json({ annotation: created })
  } catch (err: any) {
    logger.error?.(
      `[annotations] create failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to create annotation",
      detail: String(err?.message ?? err),
    })
  }
}
