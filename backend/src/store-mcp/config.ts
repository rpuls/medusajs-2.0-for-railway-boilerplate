import { BACKEND_URL, JWT_SECRET } from '../lib/constants'

/**
 * The store MCP server is on unless STORE_MCP_ENABLED is set to "false". It
 * exposes nothing until an admin signs in on its consent page and approves an
 * app, with the same credentials that already guard the dashboard, so being on
 * by default adds no way in that was not there before.
 */
export const STORE_MCP_ENABLED = process.env.STORE_MCP_ENABLED !== 'false'

/**
 * The backend is the OAuth authorization server and /mcp the protected
 * resource. Both come from BACKEND_URL, which Railway derives from the
 * service's public domain. A store on its own domain sets BACKEND_PUBLIC_URL.
 */
export const ISSUER = BACKEND_URL.replace(/\/+$/, '')
export const MCP_PATH = '/mcp'
export const MCP_RESOURCE_URL = `${ISSUER}${MCP_PATH}`

/** Signs the consent form's request token. Derived, so a token for this can never pass as a Medusa JWT. */
export const SIGNING_SECRET = `store-mcp-consent:${JWT_SECRET}`

export const DOCS_URL =
  'https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate/blob/master/docs/store-mcp.md'
