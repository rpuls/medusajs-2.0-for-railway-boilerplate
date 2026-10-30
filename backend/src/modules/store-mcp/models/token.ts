import { model } from '@medusajs/framework/utils'

/**
 * Access and refresh tokens. Only the SHA-256 of each is stored, so a
 * database dump hands nobody a working token. Refresh tokens are single use
 * and rotate on every refresh.
 */
export const McpToken = model.define('store_mcp_token', {
  id: model.id({ prefix: 'smcptk' }).primaryKey(),
  token_hash: model.text().unique(),
  type: model.enum(['access', 'refresh']),
  grant_id: model.text().index(),
  client_id: model.text(),
  user_id: model.text(),
  resource: model.text(),
  scope: model.text().nullable(),
  expires_at: model.dateTime(),
  used_at: model.dateTime().nullable(),
})
