import { MedusaContainer } from '@medusajs/framework/types'
import { Logger } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import xmlProductImportWorkflow from '../workflows/xml-product-import'
import { XML_PRODUCT_IMPORTER_MODULE } from '../modules/xml-product-importer'
import XmlProductImporterService from '../modules/xml-product-importer/service'
import { ulid } from 'ulid'

/**
 * Recurring import job that runs periodically to check for active recurring imports
 * and triggers the import workflow for each one.
 */
export default async function xmlProductImportRecurringJob(container: MedusaContainer) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const importerService: XmlProductImporterService = container.resolve(XML_PRODUCT_IMPORTER_MODULE)

  logger.info('Starting recurring XML product import job')

  try {
    // Load active recurring import configurations from database
    const { configs: allConfigs } = await importerService.listAllImportConfigs()
    const activeConfigs = allConfigs.filter(
      (config: any) => config.recurring?.enabled && config.enabled && !config.deleted_at
    )

    if (activeConfigs.length === 0) {
      logger.info('No active recurring import configurations found')
      return
    }

    logger.info(`Found ${activeConfigs.length} active recurring import configurations`)

    // Process each active configuration
    for (const config of activeConfigs) {
      try {
        const importExecutionId = ulid()

        logger.info(`Starting import for config ${config.id} (execution: ${importExecutionId})`)

        // Load the mapping for this config
        const mapping = await importerService.findFieldMappingById(config.mapping_id)
        if (!mapping) {
          logger.error(`Mapping not found for config ${config.id}`)
          continue
        }

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

        // Create execution record in database
        await importerService.createImportExecution({
          id: importExecutionId,
          config_id: config.id,
          status: 'pending',
          started_at: new Date(),
          total_products: 0,
          processed_products: 0,
          successful_products: 0,
          failed_products: 0,
        })

        // Trigger the import workflow asynchronously
        xmlProductImportWorkflow(container)
          .run({
            input: {
              configId: config.id,
              importExecutionId,
              xmlUrl: config.xml_url,
              fieldMapping: fieldMappingApiFormat,
              shippingProfileId: (config as any).shippingProfileId,
              options: {
                batchSize: config.options?.batchSize || 100,
                updateExisting: config.options?.updateExisting || false,
                updateBy: config.options?.updateBy || 'sku',
                skipErrors: config.options?.skipErrors ?? true,
              },
            },
          })
          .then(async ({ result }) => {
            await importerService.updateImportExecution(importExecutionId, {
              status: result?.status || 'completed',
              completed_at: new Date(),
              total_products: result?.totalProducts ?? 0,
              successful_products: result?.successfulProducts ?? 0,
              failed_products: result?.failedProducts ?? 0,
              processed_products: (result?.successfulProducts ?? 0) + (result?.failedProducts ?? 0),
            })

            logger.info(
              `Import completed for config ${config.id} - Status: ${result?.status || 'completed'}, Total: ${result?.totalProducts ?? 0}, Successful: ${result?.successfulProducts ?? 0}, Failed: ${result?.failedProducts ?? 0}`
            )
          })
          .catch(async (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            await importerService.updateImportExecution(importExecutionId, {
              status: 'failed',
              completed_at: new Date(),
              error: errorMessage,
            })
            logger.error(`Failed to process import for config ${config.id}: ${errorMessage}`)
          })

        // Update execution status to processing
        await importerService.updateImportExecution(importExecutionId, {
          status: 'processing',
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error(`Failed to process import for config ${config.id}: ${errorMessage}`)
      }
    }

    logger.info('Recurring XML product import job completed')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Error in recurring XML product import job: ${errorMessage}`)
  }
}

export const config = {
  name: 'xml-product-import-recurring',
  schedule: '*/15 * * * *', // Run every 15 minutes to check for scheduled imports
}

