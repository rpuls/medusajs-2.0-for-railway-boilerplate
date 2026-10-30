import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { IUserModuleService, Logger } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, MedusaError, Modules } from '@medusajs/framework/utils'
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows'
import { STORE_MCP_MODULE } from '../modules/store-mcp'
import type StoreMcpModuleService from '../modules/store-mcp/service'
import { DOCS_URL, MCP_RESOURCE_URL, STORE_MCP_ENABLED } from './config'
import { getClientRedirectUris, type OAuthClient } from './oauth/clients'
import { CAN, CANNOT } from './oauth/consent-page'
import { redirectUriHost } from './oauth/redirect-uris'
import { revokeGrant } from './oauth/tokens'
import { parseSuggestionChanges } from './tools/write'

/**
 * The dashboard's side of the store MCP server, under /admin so Medusa's own admin
 * authentication guards it: the AI assistants page and the suggestions widget call these.
 */

type Req = AuthenticatedMedusaRequest
const storeOf = (req: Req) => req.scope.resolve<StoreMcpModuleService>(STORE_MCP_MODULE)
const loggerOf = (req: Req) => req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)

/** GET /admin/store-mcp: whether it is on, the URL to paste into an AI app, and every connected app */
export const getOverview = async (req: Req, res: MedusaResponse) => {
  const store = storeOf(req)
  const grants = await store.listMcpGrants({ revoked_at: null }, { order: { created_at: 'DESC' }, take: 200 })
  const clientIds = [...new Set(grants.map((grant) => grant.client_id))]
  const userIds = [...new Set(grants.map((grant) => grant.user_id))]
  const clients: OAuthClient[] = clientIds.length ? await store.listMcpClients({ id: clientIds }) : []
  const users = userIds.length ? await req.scope.resolve<IUserModuleService>(Modules.USER).listUsers({ id: userIds }) : []
  const pending = await store.listMcpSuggestions({ status: 'pending' }, { select: ['id'], take: 1000 })
  const clientById = new Map<string, OAuthClient>(clients.map((client) => [client.id, client]))
  const emailById = new Map<string, string>(users.map((user) => [user.id, user.email]))

  res.json({
    enabled: STORE_MCP_ENABLED,
    mcp_url: MCP_RESOURCE_URL,
    docs_url: DOCS_URL,
    can: CAN,
    cannot: CANNOT,
    pending_suggestions: pending.length,
    connected_apps: grants.map((grant) => {
      const client = clientById.get(grant.client_id)
      const firstRedirect = client ? getClientRedirectUris(client)[0] : undefined
      return {
        id: grant.id,
        app_name: client?.client_name ?? 'Unknown app',
        app_host: firstRedirect ? redirectUriHost(firstRedirect) : null,
        admin_email: emailById.get(grant.user_id) ?? null,
        connected_at: grant.created_at,
        last_used_at: grant.last_used_at,
      }
    }),
  })
}

/** DELETE /admin/store-mcp/grants/:id: the app's next call fails, and its tokens are gone */
export const revokeConnectedApp = async (req: Req, res: MedusaResponse) => {
  const store = storeOf(req)
  const [grant] = await store.listMcpGrants({ id: req.params.id }, { take: 1 })
  if (!grant) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'No connected app with that id')
  await revokeGrant(store, grant.id)
  loggerOf(req).info(`Store MCP: admin ${req.auth_context.actor_id} revoked grant ${grant.id}`)
  res.json({ id: grant.id, revoked: true })
}

/** GET /admin/store-mcp/suggestions?product_id=&status= */
export const listSuggestions = async (req: Req, res: MedusaResponse) => {
  const { product_id, status } = req.query as { product_id?: string; status?: string }
  const suggestions = await storeOf(req).listMcpSuggestions(
    {
      ...(typeof product_id === 'string' ? { product_id } : {}),
      status: (['pending', 'applied', 'discarded'].includes(status ?? '') ? status : 'pending') as 'pending',
    },
    { order: { created_at: 'DESC' }, take: 100 }
  )
  const productIds = [...new Set(suggestions.map((s) => s.product_id))]
  const { data: products } = productIds.length
    ? await req.scope.resolve(ContainerRegistrationKeys.QUERY).graph({
        entity: 'product',
        fields: ['id', 'title', 'status'],
        filters: { id: productIds },
      })
    : { data: [] as Array<{ id: string; title: string; status: string }> }
  const productById = new Map<string, { id: string; title: string; status: string }>(
    (products as Array<{ id: string; title: string; status: string }>).map((p) => [p.id, p])
  )
  res.json({
    suggestions: suggestions.map((s) => ({
      ...s,
      product_title: productById.get(s.product_id)?.title ?? null,
      product_status: productById.get(s.product_id)?.status ?? null,
    })),
  })
}

/** POST /admin/store-mcp/suggestions/:id with { action: "apply" | "discard" } */
export const resolveSuggestion = async (req: Req, res: MedusaResponse) => {
  const action = (req.body as { action?: string } | undefined)?.action
  if (action !== 'apply' && action !== 'discard') {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, 'action must be "apply" or "discard"')
  }
  const store = storeOf(req)
  const [suggestion] = await store.listMcpSuggestions({ id: req.params.id }, { take: 1 })
  if (!suggestion) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'No suggestion with that id')
  if (suggestion.status !== 'pending') {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, `This suggestion was already ${suggestion.status}`)
  }

  if (action === 'apply') {
    // Validated again on the way out: only texts and categories are ever applied
    const parsed = parseSuggestionChanges(suggestion.changes)
    if (!parsed.success) throw new MedusaError(MedusaError.Types.INVALID_DATA, 'This suggestion can no longer be applied')
    await updateProductsWorkflow(req.scope).run({ input: { selector: { id: suggestion.product_id }, update: parsed.data } })
  }

  const updated = await store.updateMcpSuggestions({
    id: suggestion.id,
    status: action === 'apply' ? 'applied' : 'discarded',
    resolved_by: req.auth_context.actor_id,
    resolved_at: new Date(),
  })
  res.json({ suggestion: updated })
}
