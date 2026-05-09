import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { REPORT_ANNOTATION_MODULE } from "../../../../../modules/report-annotation"

/**
 * DELETE /admin/reports/annotations/:id
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const id = req.params.id
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "id is required" })
  }
  const service = req.scope.resolve(REPORT_ANNOTATION_MODULE) as any
  try {
    await service.deleteReportAnnotations([id])
    return res.json({ id, deleted: true })
  } catch (err: any) {
    logger.error?.(
      `[annotations] delete failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to delete annotation",
      detail: String(err?.message ?? err),
    })
  }
}
