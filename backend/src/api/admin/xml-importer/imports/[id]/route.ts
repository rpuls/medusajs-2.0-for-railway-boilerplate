import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { getService } from "../../storage"

/**
 * GET /admin/xml-importer/imports/:id
 * Get import execution details
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
      res.status(404).json({ message: "Import execution not found" })
      return
    }

    // Fetch logs separately if needed
    const logsArray = await service.getImportExecutionLogs(id)

    res.json({
      execution: {
        ...execution,
        logs: logsArray,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

