import { MedusaContainer } from '@medusajs/framework/types'
import { Logger } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import xmlProductImportWorkflow from '../workflows/xml-product-import'
import { XML_PRODUCT_IMPORTER_MODULE } from '../modules/xml-product-importer'
import { ImportConfig } from '../modules/xml-product-importer/types'
import { ulid } from 'ulid'

/**
 * Recurring import job that runs periodically to check for active recurring imports
 * and triggers the import workflow for each one.
 */
export default async function xmlProductImportRecurringJob(container: MedusaContainer) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info('Starting recurring XML product import job')

  try {
    // TODO: Load active recurring import configurations from database
    // For now, this is a placeholder that will be implemented once database schema is added
    const activeConfigs: ImportConfig[] = []

    if (activeConfigs.length === 0) {
      logger.info('No active recurring import configurations found')
      return
    }

    logger.info(`Found ${activeConfigs.length} active recurring import configurations`)

    // Process each active configuration
    for (const config of activeConfigs) {
      if (!config.recurring?.enabled || !config.enabled) {
        continue
      }

      try {
        const importExecutionId = ulid()

        logger.info(`Starting import for config ${config.id} (execution: ${importExecutionId})`)

        // Trigger the import workflow
        const { result } = await xmlProductImportWorkflow(container).run({
          input: {
            configId: config.id!,
            importExecutionId,
          },
        })

        logger.info(`Import completed for config ${config.id}`, {
          executionId: result.executionId,
          totalProducts: result.totalProducts,
          successfulProducts: result.successfulProducts,
          failedProducts: result.failedProducts,
          status: result.status,
        })
      } catch (error) {
        logger.error(`Failed to process import for config ${config.id}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    logger.info('Recurring XML product import job completed')
  } catch (error) {
    logger.error('Error in recurring XML product import job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export const config = {
  name: 'xml-product-import-recurring',
  schedule: '*/15 * * * *', // Run every 15 minutes to check for scheduled imports
}

