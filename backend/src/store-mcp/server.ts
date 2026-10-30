import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { IUserModuleService, Logger } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { STORE_MCP_MODULE } from '../modules/store-mcp'
import type StoreMcpModuleService from '../modules/store-mcp/service'
import { RATE_LIMITS } from './oauth/constants'
import { checkRateLimit, publicCORSHeaders } from './oauth/http'
import { authenticateAccessToken } from './oauth/tokens'
import { buildBearerChallenge } from './oauth/urls'
import { registerPrompts } from './tools/prompts'
import { registerReadTools } from './tools/read'
import { registerWriteTools } from './tools/write'

const INSTRUCTIONS = `You are connected to an online store's backend as one of its admins.
Call get_store_overview first: it has the currencies, regions, categories and ids the other tools need.
All prices and totals are in major currency units: 19.99 means 19.99, not cents.
You can read the catalogue, stock, orders, customers and sales. You can create products only as drafts and edit them only while they are drafts. A published product cannot be changed directly: use suggest_product_changes and tell the admin it is waiting on the product page.
You cannot publish, delete, change stock, change prices on published products, refund or cancel orders, or change settings. Say so plainly when asked, and point the admin to the dashboard.
Customer data is limited to name, email, country and order history. Do not ask for more.`

const unauthorized = (res: MedusaResponse, challenge?: { error?: string; errorDescription?: string }) => {
  res
    .set({ ...publicCORSHeaders, 'WWW-Authenticate': buildBearerChallenge(challenge) })
    .status(401)
    .json({ error: challenge?.error ?? 'unauthorized', error_description: challenge?.errorDescription ?? 'Sign in to use this MCP server' })
}

/**
 * POST /mcp, the Streamable HTTP transport in stateless mode: every request carries its own
 * bearer token, gets a fresh server, and is answered with plain JSON. Nothing lives in memory
 * between requests, so a restart or a redeploy never drops a connected app, and no Redis is
 * needed.
 */
export const handleMcpRequest = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const authorization = req.get('authorization')
  // RFC 6750 §3.1: no error code when the request carried no credentials at all
  if (!authorization || !/^bearer\s/i.test(authorization)) return unauthorized(res)

  const logger = req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
  const auth = await authenticateAccessToken({
    store: req.scope.resolve<StoreMcpModuleService>(STORE_MCP_MODULE),
    token: authorization.slice('bearer '.length).trim(),
    users: req.scope.resolve<IUserModuleService>(Modules.USER),
    warn: (message) => logger.warn(message),
  })
  if (auth.ok === false) return unauthorized(res, { error: 'invalid_token', errorDescription: auth.reason })

  const limit = checkRateLimit(`mcp:${auth.grantId}`, RATE_LIMITS.mcp)
  if (!limit.allowed) {
    res.set({ ...publicCORSHeaders, 'Retry-After': String(limit.retryAfterSeconds) }).status(429).json({ error: 'too_many_requests' })
    return
  }

  const server = new McpServer({ name: 'store-mcp', title: 'Store MCP server', version: '1.0.0' }, { instructions: INSTRUCTIONS })
  const ctx = { scope: req.scope, auth }
  registerReadTools(server, ctx)
  registerWriteTools(server, ctx)
  registerPrompts(server)

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })
  res.on('close', () => {
    transport.close().catch(() => undefined)
    server.close().catch(() => undefined)
  })
  res.set(publicCORSHeaders)
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
}

/** Stateless: there is no event stream to open and no session to end */
export const methodNotAllowed = (_req: MedusaRequest, res: MedusaResponse): void => {
  res
    .set({ ...publicCORSHeaders, Allow: 'POST, OPTIONS' })
    .status(405)
    .json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null })
}
