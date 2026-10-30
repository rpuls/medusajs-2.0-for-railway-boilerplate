import type { MedusaRequest } from '@medusajs/framework/http'
import type { InferTypeOf } from '@medusajs/framework/types'
import type { McpClient } from '../../modules/store-mcp/models/client'
import type StoreMcpModuleService from '../../modules/store-mcp/service'
import { fetchClientMetadataDocument } from './cimd'
import type { ClientMetadata } from './client-metadata'
import { randomToken, safeEqual, sha256 } from './crypto'

export type OAuthClient = InferTypeOf<typeof McpClient>

/** Client IDs that are URLs point at a client ID metadata document (ChatGPT does this) */
export const isMetadataDocumentClientId = (clientId: string): boolean => clientId.startsWith('https://')

export const getClientRedirectUris = (client: OAuthClient): string[] =>
  Array.isArray(client.redirect_uris)
    ? (client.redirect_uris as unknown[]).filter((uri): uri is string => typeof uri === 'string')
    : []

export const findClientByClientId = async (
  store: StoreMcpModuleService,
  clientId: string
): Promise<OAuthClient | null> => {
  const [client] = await store.listMcpClients({ client_id: clientId }, { take: 1 })
  return client ?? null
}

export type ResolvedClient = { client: OAuthClient; ok: true } | { description: string; ok: false }

/**
 * Finds the client for a `client_id`. Dynamically registered clients are plain lookups. For a
 * metadata document URL, the document is fetched (and cached in the clients table) when
 * `allowFetch` is set and the cached copy is missing or stale. The token endpoint passes
 * `allowFetch: false`: a client that never went through the consent page has nothing to exchange.
 */
export const resolveClient = async ({
  allowFetch,
  clientId,
  logger,
  store,
}: {
  allowFetch: boolean
  clientId: unknown
  logger?: { warn: (message: string) => void }
  store: StoreMcpModuleService
}): Promise<ResolvedClient> => {
  if (typeof clientId !== 'string' || clientId.length === 0) {
    return { ok: false, description: 'client_id is required' }
  }

  const existing = await findClientByClientId(store, clientId)

  if (!isMetadataDocumentClientId(clientId)) {
    return existing ? { ok: true, client: existing } : { ok: false, description: 'Unknown client_id' }
  }

  const stillFresh = existing?.metadata_expires_at
    ? new Date(existing.metadata_expires_at).getTime() > Date.now()
    : false
  if (existing && (stillFresh || !allowFetch)) return { ok: true, client: existing }

  const fetched = await fetchClientMetadataDocument(clientId)
  if (fetched.ok === false) {
    if (existing) {
      logger?.warn(
        `Store MCP: could not refresh the client ID metadata document for ${clientId}, using the cached copy (${fetched.description})`
      )
      return { ok: true, client: existing }
    }
    return { ok: false, description: fetched.description }
  }

  const data = {
    client_id: clientId,
    client_name: fetched.metadata.clientName,
    client_uri: fetched.metadata.clientUri ?? null,
    logo_uri: fetched.metadata.logoUri ?? null,
    metadata: fetched.raw,
    metadata_expires_at: fetched.expiresAt,
    redirect_uris: fetched.metadata.redirectUris as unknown as Record<string, unknown>,
    registration_type: 'metadata_document' as const,
    token_endpoint_auth_method: 'none' as const,
  }
  const client = existing
    ? await store.updateMcpClients({ id: existing.id, ...data })
    : await store.createMcpClients(data)

  return { ok: true, client }
}

/** RFC 7591 registration: mints a client id (and a secret for confidential clients) */
export const registerDynamicClient = async ({
  metadata,
  store,
}: {
  metadata: ClientMetadata
  store: StoreMcpModuleService
}): Promise<{ client: OAuthClient; clientSecret: string | null }> => {
  const clientId = `mcp_${randomToken(16)}`
  const clientSecret = metadata.tokenEndpointAuthMethod === 'none' ? null : randomToken(32)

  const client = await store.createMcpClients({
    client_id: clientId,
    client_name: metadata.clientName,
    client_secret_hash: clientSecret ? sha256(clientSecret) : null,
    client_uri: metadata.clientUri ?? null,
    logo_uri: metadata.logoUri ?? null,
    metadata: metadata.registered,
    redirect_uris: metadata.redirectUris as unknown as Record<string, unknown>,
    registration_type: 'dynamic',
    token_endpoint_auth_method: metadata.tokenEndpointAuthMethod,
  })

  return { client, clientSecret }
}

export type ClientAuthentication =
  | { client: OAuthClient; ok: true; usedBasicAuth: boolean }
  | { description: string; ok: false; usedBasicAuth: boolean }

/**
 * Client authentication at the token and revocation endpoints (RFC 6749 §2.3). Public clients
 * only name themselves; PKCE is their proof. Confidential clients present their secret, either
 * as HTTP Basic credentials or in the body, and it is compared in constant time against the hash.
 */
export const authenticateClient = async ({
  params,
  req,
  store,
}: {
  params: URLSearchParams
  req: MedusaRequest
  store: StoreMcpModuleService
}): Promise<ClientAuthentication> => {
  const authorization = req.get('authorization')
  const usedBasicAuth = Boolean(authorization && /^basic\s/i.test(authorization))
  const fail = (description: string): ClientAuthentication => ({ ok: false, description, usedBasicAuth })

  let basicId: string | undefined
  let basicSecret: string | undefined
  if (authorization && usedBasicAuth) {
    try {
      const decoded = Buffer.from(authorization.slice(6).trim(), 'base64').toString('utf8')
      const separator = decoded.indexOf(':')
      if (separator === -1) return fail('Malformed Basic authorization header')
      // RFC 6749 §2.3.1: both values are form-urlencoded before being base64 encoded
      basicId = decodeURIComponent(decoded.slice(0, separator))
      basicSecret = decodeURIComponent(decoded.slice(separator + 1))
    } catch {
      return fail('Malformed Basic authorization header')
    }
  }

  const bodyId = params.get('client_id') ?? undefined
  if (basicId && bodyId && basicId !== bodyId) {
    return fail('client_id in the Authorization header and in the body differ')
  }
  const clientId = basicId ?? bodyId
  if (!clientId) return fail('client_id is required')

  const resolved = await resolveClient({ allowFetch: false, clientId, store })
  if (resolved.ok === false) return fail('Unknown client')
  const { client } = resolved

  if (client.token_endpoint_auth_method === 'none') return { ok: true, client, usedBasicAuth }

  const secret = basicSecret ?? params.get('client_secret') ?? undefined
  if (!secret || !client.client_secret_hash || !safeEqual(sha256(secret), client.client_secret_hash)) {
    return fail('Invalid client credentials')
  }
  return { ok: true, client, usedBasicAuth }
}
