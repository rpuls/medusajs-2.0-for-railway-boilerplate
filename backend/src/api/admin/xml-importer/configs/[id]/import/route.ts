import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ulid } from "ulid"
import xmlProductImportWorkflow from "../../../../../../workflows/xml-product-import"
import { ImportConfig, FieldMapping } from "../../../../../../modules/xml-product-importer/types"
import { getService } from "../../../storage"

/**
 * POST /admin/xml-importer/configs/:id/import
 * Trigger manual import
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const importExecutionId = ulid()
    const service = getService(req)

    // Load config and mapping from database
    const config = await service.findImportConfigById(id)

    if (!config) {
      res.status(404).json({ message: "Configuration not found" })
      return
    }

    const mapping = await service.findFieldMappingById(config.mapping_id)

    if (!mapping) {
      res.status(404).json({ message: "Mapping not found for this configuration" })
      return
    }

    // Create execution record in database
    const execution = await service.createImportExecution({
      id: importExecutionId,
      config_id: id,
      status: "pending",
      started_at: new Date(),
      total_products: 0,
      processed_products: 0,
      successful_products: 0,
      failed_products: 0,
    })

    // Convert database fields (snake_case) to API format (camelCase)
    const fieldMappingApiFormat = {
      id: mapping.id,
      name: mapping.name,
      description: mapping.description,
      xmlUrl: mapping.xml_url,
      mappings: mapping.mappings,
      created_at: mapping.created_at,
      updated_at: mapping.updated_at,
    }

    // Trigger the import workflow asynchronously
    xmlProductImportWorkflow(req.scope)
      .run({
        input: {
          configId: id,
          importExecutionId,
          xmlUrl: config.xml_url,
          fieldMapping: fieldMappingApiFormat,
          shippingProfileId: (config as any).shippingProfileId,
          options: {
            batchSize: config.options?.batchSize || 100,
            updateExisting: config.options?.updateExisting || false,
            updateBy: config.options?.updateBy || "sku",
            skipErrors: config.options?.skipErrors ?? true,
          },
        },
      })
      .then(async ({ result }) => {
        // Log the result structure for debugging
        const logger = req.scope.resolve('logger')
        logger.info(`Import ${importExecutionId} workflow completed. Result: ${JSON.stringify(result, null, 2)}`)
        
        // Update execution with final status in database
        try {
          await service.updateImportExecution(importExecutionId, {
            status: result?.status || 'completed',
            completed_at: new Date(),
            total_products: result?.totalProducts ?? 0,
            successful_products: result?.successfulProducts ?? 0,
            failed_products: result?.failedProducts ?? 0,
            processed_products: (result?.successfulProducts ?? 0) + (result?.failedProducts ?? 0),
          })
          logger.info(`Import ${importExecutionId} status updated successfully - Status: ${result?.status || 'completed'}, Total: ${result?.totalProducts ?? 0}, Successful: ${result?.successfulProducts ?? 0}, Failed: ${result?.failedProducts ?? 0}`)
        } catch (updateError) {
          logger.error(`Failed to update import execution ${importExecutionId}: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`)
          if (updateError instanceof Error && updateError.stack) {
            logger.error(`Update error stack: ${updateError.stack}`)
          }
        }
        
        if (result?.successfulProducts === 0 && result?.totalProducts > 0) {
          logger.warn(`Import ${importExecutionId} completed but no products were imported. Check validation errors.`)
        }
      })
      .catch(async (error) => {
        // Update execution with error status in database
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        const errorStack = error instanceof Error ? error.stack : undefined
        const logger = req.scope.resolve("logger")
        
        logger.error(`Import ${importExecutionId} workflow failed: ${errorMessage}${errorStack ? "\n" + errorStack : ""}`)

        // Log the full error object if available
        if (error && typeof error === "object") {
          try {
            const errorDetails = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
            logger.error(`Import ${importExecutionId} error details: ${errorDetails}`)
          } catch (stringifyError) {
            logger.error(`Import ${importExecutionId} error details: [Could not stringify error object]`)
          }
        }
        
        try {
          await service.updateImportExecution(importExecutionId, {
            status: "failed",
            completed_at: new Date(),
            error: errorMessage + (errorStack ? "\n" + errorStack : ""),
          })
          logger.info(`Import ${importExecutionId} status updated to 'failed'`)
        } catch (updateError) {
          logger.error(`Failed to update import execution ${importExecutionId} to 'failed' status: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`)
          if (updateError instanceof Error && updateError.stack) {
            logger.error(`Update error stack: ${updateError.stack}`)
          }
        }
      })

    // Update execution status to processing
    const updatedExecution = await service.updateImportExecution(importExecutionId, {
        status: "processing",
    })

    res.json({
      execution: {
        id: importExecutionId,
        status: "processing",
        started_at: execution.started_at,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

