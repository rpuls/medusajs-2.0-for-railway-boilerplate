import { model } from '@medusajs/framework/utils'

/**
 * An app that may ask an admin for access: registered by the app itself
 * (dynamic client registration, which most MCP clients use) or fetched from the URL
 * it names as its client_id (a client ID metadata document, which ChatGPT
 * uses). Registering grants nothing on its own. Access only exists once an
 * admin has approved the app on the consent page, as a grant.
 */
export const McpClient = model.define('store_mcp_client', {
  id: model.id({ prefix: 'smcpcl' }).primaryKey(),
  client_id: model.text().unique(),
  client_name: model.text(),
  client_uri: model.text().nullable(),
  logo_uri: model.text().nullable(),
  redirect_uris: model.json(),
  registration_type: model.enum(['dynamic', 'metadata_document']),
  token_endpoint_auth_method: model.enum(['none', 'client_secret_basic', 'client_secret_post']),
  client_secret_hash: model.text().nullable(),
  metadata: model.json().nullable(),
  metadata_expires_at: model.dateTime().nullable(),
})
