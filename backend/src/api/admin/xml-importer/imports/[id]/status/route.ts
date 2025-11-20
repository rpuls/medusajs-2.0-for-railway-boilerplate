import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { getService } from "../../../storage"

/**
 * GET /admin/xml-importer/imports/:id/status
 * Get import status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const service = getService(req)

    const execution = await service.findImportExecutionById(id)

    if (!execution) {
      res.status(404).json({ message: 'Import execution not found' })
      return
    }

    res.json({
      id: execution.id,
      status: execution.status,
      total_products: execution.total_products,
      processed_products: execution.processed_products,
      successful_products: execution.successful_products,
      failed_products: execution.failed_products,
      started_at: execution.started_at,
      completed_at: execution.completed_at,
      error: execution.error,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

