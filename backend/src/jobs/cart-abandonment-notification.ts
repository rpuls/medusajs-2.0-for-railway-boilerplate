import { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'

/**
 * Job that runs every hour to send cart abandonment notifications
 * 
 * NOTE: This job is currently disabled because it requires direct database access
 * which is not available in the job context in MedusaJS 2.0.
 * 
 * To enable this feature, consider:
 * 1. Implementing it as a workflow
 * 2. Using a separate cron service that calls the Admin API
 * 3. Implementing it as a custom module with proper repository injection
 */
export default async function cartAbandonmentNotificationJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  
  logger.info('Cart abandonment notification job is currently disabled')
  logger.info('This feature requires refactoring to work with MedusaJS 2.0 job system')
}

export const config = {
  name: 'cart-abandonment-notification',
  schedule: '0 * * * *', // Run every hour
}
