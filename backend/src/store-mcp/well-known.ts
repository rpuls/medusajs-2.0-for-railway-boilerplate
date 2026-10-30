import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { STORE_MCP_ENABLED } from './config'
import { publicCORSHeaders } from './oauth/http'
import { getAuthorizationServerMetadata, getProtectedResourceMetadata } from './oauth/urls'

/**
 * Serves the two OAuth discovery documents an MCP client reads before it signs in:
 * /.well-known/oauth-protected-resource[/mcp] and /.well-known/oauth-authorization-server[/mcp].
 *
 * A middleware rather than a route file because `medusa build` compiles src/ with TypeScript,
 * which skips dot-directories, so src/api/.well-known would work in development and vanish
 * from the production build.
 */
export const WELL_KNOWN_MATCHER = /^\/\.well-known\/oauth-(protected-resource|authorization-server)(\/mcp)?\/?$/

export const serveWellKnown = (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
  // Medusa mounts middlewares with app.use, which strips the matched part from req.path
  const match = req.originalUrl.split('?')[0].match(WELL_KNOWN_MATCHER)
  if (!STORE_MCP_ENABLED || !match) return next()

  const headers = { ...publicCORSHeaders, 'Access-Control-Allow-Methods': 'GET, OPTIONS' }
  if (req.method === 'OPTIONS') return void res.set(headers).status(204).end()
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()

  const document = match[1] === 'protected-resource' ? getProtectedResourceMetadata() : getAuthorizationServerMetadata()
  res.set({ ...headers, 'Cache-Control': 'public, max-age=300' }).json(document)
}
