import { logger, MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ListOptions, ImportStatus } from "../../../../modules/xml-product-importer/types"
import { getService } from "../storage"

/**
 * GET /admin/xml-importer/imports
 * List all import executions
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { limit = 10, offset = 0, status, configId } = req.query

    const service = getService(req)
    const { imports, count } = await service.listImports({
      status: status as ImportStatus | undefined,
      configId: configId as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    })

    // Transform snake_case to camelCase for frontend
    const transformedImports = imports.map((imp: any) => ({
      id: imp.id,
      configId: imp.config_id || imp.configId,
      status: imp.status,
      startedAt: imp.started_at || imp.startedAt,
      completedAt: imp.completed_at || imp.completedAt,
      totalProducts: imp.total_products ?? imp.totalProducts ?? 0,
      processedProducts: imp.processed_products ?? imp.processedProducts ?? 0,
      successfulProducts: imp.successful_products ?? imp.successfulProducts ?? 0,
      failedProducts: imp.failed_products ?? imp.failedProducts ?? 0,
      error: imp.error,
    }))

    res.json({
      imports: transformedImports,
      count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

