import type { InferTypeOf, IUserModuleService } from '@medusajs/framework/types'
import type { McpAuthorizationCode } from '../../modules/store-mcp/models/authorization-code'
import type { McpGrant } from '../../modules/store-mcp/models/grant'
import type { McpToken } from '../../modules/store-mcp/models/token'
import type StoreMcpModuleService from '../../modules/store-mcp/service'
import {
  ACCESS_TOKEN_LIFETIME,
  CLEANUP_INTERVAL,
  LAST_USED_WRITE_INTERVAL,
  REFRESH_TOKEN_LIFETIME,
  UNUSED_CLIENT_LIFETIME,
} from './constants'
import { randomToken, sha256 } from './crypto'
import { isThisMCPResource } from './urls'

export type OAuthGrant = InferTypeOf<typeof McpGrant>
export type OAuthToken = InferTypeOf<typeof McpToken>
export type OAuthAuthorizationCode = InferTypeOf<typeof McpAuthorizationCode>

export type TokenResponse = {
  access_token: string
  expires_in: number
  refresh_token: string
  scope?: string
  token_type: 'Bearer'
}

export const findAuthorizationCode = async (
  store: StoreMcpModuleService,
  code: string
): Promise<OAuthAuthorizationCode | null> => {
  const [record] = await store.listMcpAuthorizationCodes({ code_hash: sha256(code) }, { take: 1 })
  return record ?? null
}

export const findToken = async (
  store: StoreMcpModuleService,
  type: 'access' | 'refresh' | undefined,
  token: string
): Promise<OAuthToken | null> => {
  const [record] = await store.listMcpTokens(
    { token_hash: sha256(token), ...(type ? { type } : {}) },
    { take: 1 }
  )
  return record ?? null
}

export const findGrant = async (
  store: StoreMcpModuleService,
  grantId: string | null | undefined
): Promise<OAuthGrant | null> => {
  if (!grantId) return null
  const [grant] = await store.listMcpGrants({ id: grantId }, { take: 1 })
  return grant ?? null
}

/** One grant per client and admin: re-authorizing reuses it instead of adding a duplicate */
export const findOrCreateGrant = async ({
  clientRecordId,
  resource,
  scope,
  store,
  userId,
}: {
  clientRecordId: string
  resource: string
  scope: string | null | undefined
  store: StoreMcpModuleService
  userId: string
}): Promise<OAuthGrant> => {
  const [existing] = await store.listMcpGrants(
    { client_id: clientRecordId, user_id: userId, revoked_at: null },
    { take: 1 }
  )
  if (existing) {
    if (scope && scope !== existing.scope) {
      return store.updateMcpGrants({ id: existing.id, scope })
    }
    return existing
  }
  return store.createMcpGrants({
    client_id: clientRecordId,
    user_id: userId,
    resource,
    scope: scope ?? null,
  })
}

/** Issues a fresh access token and a fresh refresh token for a grant */
export const issueTokens = async ({
  grant,
  store,
}: {
  grant: OAuthGrant
  store: StoreMcpModuleService
}): Promise<TokenResponse> => {
  const accessToken = randomToken(32)
  const refreshToken = randomToken(32)
  const now = Date.now()

  const shared = {
    client_id: grant.client_id,
    grant_id: grant.id,
    resource: grant.resource,
    scope: grant.scope ?? null,
    user_id: grant.user_id,
  }
  await store.createMcpTokens([
    {
      ...shared,
      type: 'access' as const,
      expires_at: new Date(now + ACCESS_TOKEN_LIFETIME),
      token_hash: sha256(accessToken),
    },
    {
      ...shared,
      type: 'refresh' as const,
      expires_at: new Date(now + REFRESH_TOKEN_LIFETIME),
      token_hash: sha256(refreshToken),
    },
  ])

  return {
    access_token: accessToken,
    expires_in: Math.floor(ACCESS_TOKEN_LIFETIME / 1000),
    refresh_token: refreshToken,
    token_type: 'Bearer',
    ...(grant.scope ? { scope: grant.scope } : {}),
  }
}

/** Revokes a grant and deletes every token issued under it. Idempotent. */
export const revokeGrant = async (store: StoreMcpModuleService, grantId: string): Promise<void> => {
  await store.updateMcpGrants({ id: grantId, revoked_at: new Date() })
  const tokens = await store.listMcpTokens({ grant_id: grantId }, { select: ['id'] })
  if (tokens.length) await store.deleteMcpTokens(tokens.map((token) => token.id))
}

export type McpAuthContext = {
  grantId: string
  clientId: string
  appName: string
  userId: string
  userEmail: string
}

export type AccessTokenAuthentication = { ok: false; reason: string } | ({ ok: true } & McpAuthContext)

/**
 * Resolves a bearer token presented to /mcp to the admin it acts for. Rejects unknown, expired
 * and revoked tokens, tokens issued for any other resource, and tokens whose admin was deleted.
 */
export const authenticateAccessToken = async ({
  store,
  token,
  users,
  warn,
}: {
  store: StoreMcpModuleService
  token: string
  users: IUserModuleService
  warn: (message: string) => void
}): Promise<AccessTokenAuthentication> => {
  if (!token || token.length > 512) return { ok: false, reason: 'The access token is malformed' }

  const record = await findToken(store, 'access', token)
  if (!record) return { ok: false, reason: 'The access token is unknown or has been revoked' }
  if (new Date(record.expires_at).getTime() <= Date.now()) {
    return { ok: false, reason: 'The access token has expired' }
  }
  if (!isThisMCPResource(record.resource)) {
    return { ok: false, reason: 'The access token was issued for another resource' }
  }

  const grant = await findGrant(store, record.grant_id)
  if (!grant || grant.revoked_at) return { ok: false, reason: 'Access has been revoked' }

  const [user] = await users.listUsers({ id: grant.user_id }, { take: 1 })
  if (!user) return { ok: false, reason: 'The admin user no longer exists' }

  const [client] = await store.listMcpClients({ id: grant.client_id }, { take: 1 })

  // Keep "last used" roughly current without a write on every single MCP call
  const lastUsed = grant.last_used_at ? new Date(grant.last_used_at).getTime() : 0
  if (Date.now() - lastUsed > LAST_USED_WRITE_INTERVAL) {
    store
      .updateMcpGrants({ id: grant.id, last_used_at: new Date() })
      .catch(() => warn('Store MCP: could not update last_used_at on a grant'))
  }

  return {
    ok: true,
    grantId: grant.id,
    clientId: grant.client_id,
    appName: client?.client_name ?? 'An AI app',
    userId: user.id,
    userEmail: user.email,
  }
}

let lastCleanup = 0

/** Deletes long-expired codes and tokens. Called from the token endpoint, throttled. */
export const cleanupExpired = async (
  store: StoreMcpModuleService,
  warn: (message: string) => void
): Promise<void> => {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  try {
    const codes = await store.listMcpAuthorizationCodes(
      { expires_at: { $lt: new Date(now - 60 * 60 * 1000) } },
      { select: ['id'], take: 500 }
    )
    if (codes.length) await store.deleteMcpAuthorizationCodes(codes.map((code) => code.id))
    const tokens = await store.listMcpTokens(
      { expires_at: { $lt: new Date(now - 24 * 60 * 60 * 1000) } },
      { select: ['id'], take: 500 }
    )
    if (tokens.length) await store.deleteMcpTokens(tokens.map((token) => token.id))

    // Registering is open to anyone, so apps no admin ever approved must not pile up
    const stale = await store.listMcpClients(
      { created_at: { $lt: new Date(now - UNUSED_CLIENT_LIFETIME) } },
      { select: ['id'], take: 500, order: { created_at: 'ASC' } }
    )
    if (stale.length) {
      const approved = await store.listMcpGrants({ client_id: stale.map((client) => client.id) }, { select: ['client_id'] })
      const keep = new Set(approved.map((grant) => grant.client_id))
      const unused = stale.filter((client) => !keep.has(client.id)).map((client) => client.id)
      if (unused.length) await store.deleteMcpClients(unused)
    }
  } catch {
    warn('Store MCP: cleanup of expired codes and tokens failed')
  }
}
