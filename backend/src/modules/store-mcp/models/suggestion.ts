import { model } from '@medusajs/framework/utils'

/**
 * A change an AI app proposed for a published product. The app cannot edit a
 * live product, so it saves the change here and an admin applies or discards
 * it from the product page.
 */
export const McpSuggestion = model.define('store_mcp_suggestion', {
  id: model.id({ prefix: 'smcpsg' }).primaryKey(),
  product_id: model.text().index(),
  grant_id: model.text().nullable(),
  user_id: model.text(),
  app_name: model.text(),
  changes: model.json(),
  note: model.text().nullable(),
  status: model.enum(['pending', 'applied', 'discarded']).default('pending'),
  resolved_by: model.text().nullable(),
  resolved_at: model.dateTime().nullable(),
})
