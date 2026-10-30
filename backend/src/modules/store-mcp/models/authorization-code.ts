import { model } from '@medusajs/framework/utils'

/** A single-use code from the consent page, exchanged for tokens within minutes. Only its hash is stored. */
export const McpAuthorizationCode = model.define('store_mcp_authorization_code', {
  id: model.id({ prefix: 'smcpac' }).primaryKey(),
  code_hash: model.text().unique(),
  client_id: model.text(),
  user_id: model.text(),
  grant_id: model.text().nullable(),
  code_challenge: model.text(),
  redirect_uri: model.text(),
  resource: model.text(),
  scope: model.text().nullable(),
  expires_at: model.dateTime(),
  used_at: model.dateTime().nullable(),
})
