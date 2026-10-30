import { model } from '@medusajs/framework/utils'

/**
 * One admin's approval of one app. Tokens hang off it, so revoking the grant
 * cuts the app off on its next call. Re-approving the same app reuses the
 * grant instead of adding a second one.
 */
export const McpGrant = model.define('store_mcp_grant', {
  id: model.id({ prefix: 'smcpgr' }).primaryKey(),
  client_id: model.text().index(),
  user_id: model.text().index(),
  resource: model.text(),
  scope: model.text().nullable(),
  last_used_at: model.dateTime().nullable(),
  revoked_at: model.dateTime().nullable(),
})
