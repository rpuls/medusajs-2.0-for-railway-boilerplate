import { model } from '@medusajs/framework/utils'

/**
 * A change to how the store sells: regions, shipping or tax, proposed by an AI app. All of it
 * is live at checkout the moment it exists, so an app only saves the proposal here and an
 * admin applies or discards it on the AI assistants page.
 *
 * `applying` is held while an admin's Apply runs, so a second click cannot apply it twice.
 * `failed` keeps what was done before the step that failed, in `result`.
 */
export const McpSetupProposal = model.define('store_mcp_setup_proposal', {
  id: model.id({ prefix: 'smcpsp' }).primaryKey(),
  grant_id: model.text().nullable(),
  user_id: model.text(),
  app_name: model.text(),
  summary: model.text(),
  changes: model.json(),
  status: model.enum(['pending', 'applying', 'applied', 'discarded', 'failed']).default('pending'),
  result: model.json().nullable(),
  resolved_by: model.text().nullable(),
  resolved_at: model.dateTime().nullable(),
})
