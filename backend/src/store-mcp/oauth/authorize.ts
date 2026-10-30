import type StoreMcpModuleService from '../../modules/store-mcp/service'
import { ISSUER, MCP_RESOURCE_URL, SIGNING_SECRET } from '../config'
import { getClientRedirectUris, type OAuthClient, resolveClient } from './clients'
import {
  AUTHORIZATION_CODE_LIFETIME,
  CONSENT_REQUEST_LIFETIME,
  MAX_SCOPE_LENGTH,
  MAX_STATE_LENGTH,
} from './constants'
import { isValidCodeChallenge, randomToken, sha256, signPayload, verifyPayload } from './crypto'
import { redirectUriMatches } from './redirect-uris'
import { isThisMCPResource, oauthPaths } from './urls'

/** A validated authorization request, as shown on the consent page and signed into its form */
export type AuthorizationRequest = {
  clientId: string
  codeChallenge: string
  codeChallengeMethod: 'S256'
  redirectUri: string
  resource: string
  scope?: string
  state?: string
}

export type SearchParams = Record<string, string | string[] | undefined>

export type ParsedAuthorizationRequest =
  /** Shown as an error page. Never redirected: see failWithoutRedirect below. */
  | { description: string; error: string; kind: 'invalid' }
  | { client: OAuthClient; kind: 'ok'; request: AuthorizationRequest }

/**
 * Appends response parameters to a registered redirect URI, keeping any query the client
 * registered, and adds `iss` so clients can detect mix-up attacks (RFC 9207).
 */
export const buildRedirectURL = (redirectUri: string, params: Record<string, string | undefined>): string => {
  const url = new URL(redirectUri)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, value)
  }
  url.searchParams.set('iss', ISSUER)
  return url.toString()
}

// Scope tokens are printable ASCII without quotes or backslashes (RFC 6749 §3.3)
const cleanScope = (value: string): string =>
  value
    .replace(/[^\x21\x23-\x5b\x5d-\x7e ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export const parseAuthorizationRequest = async ({
  callerIP,
  logger,
  params,
  store,
}: {
  callerIP?: string
  logger?: { warn: (message: string) => void }
  params: SearchParams
  store: StoreMcpModuleService
}): Promise<ParsedAuthorizationRequest> => {
  const duplicates: string[] = []
  const read = (key: string): string | undefined => {
    const value = params[key]
    if (Array.isArray(value)) {
      duplicates.push(key)
      return value[0]
    }
    return value
  }

  const clientId = read('client_id')
  if (!clientId) {
    return { kind: 'invalid', description: 'The request has no client_id.', error: 'invalid_request' }
  }
  const resolved = await resolveClient({ allowFetch: true, callerIP, clientId, logger, store })
  if (resolved.ok === false) return { kind: 'invalid', description: resolved.description, error: 'invalid_client' }
  const { client } = resolved
  const registered = getClientRedirectUris(client)

  let redirectUri = read('redirect_uri')
  if (!redirectUri) {
    if (registered.length !== 1) {
      return { kind: 'invalid', description: 'The request has no redirect_uri.', error: 'invalid_request' }
    }
    redirectUri = registered[0]!
  }
  if (!redirectUriMatches(registered, redirectUri)) {
    return {
      kind: 'invalid',
      description: 'The redirect_uri is not registered for this client.',
      error: 'invalid_request',
    }
  }

  // OAuth would deliver the remaining errors to the redirect URI. It is not done here: anyone
  // can register an app with any https redirect URI, so a malformed link to this page would
  // bounce visitors straight from the store's domain to a site of the attacker's choosing
  // (RFC 9700 §4.11.2). Real MCP clients never send a malformed request, so nothing is lost.
  const rawState = read('state')
  const state = rawState !== undefined && rawState.length <= MAX_STATE_LENGTH ? rawState : undefined
  const failWithoutRedirect = (error: string, description: string): ParsedAuthorizationRequest => ({
    kind: 'invalid',
    error,
    description,
  })
  if (rawState !== undefined && state === undefined) {
    return failWithoutRedirect('invalid_request', 'state is too long')
  }

  const responseType = read('response_type')
  const responseMode = read('response_mode')
  const codeChallenge = read('code_challenge')
  const codeChallengeMethod = read('code_challenge_method')
  const rawScope = read('scope')
  const rawResource = read('resource')

  if (duplicates.length > 0) {
    return failWithoutRedirect('invalid_request', `Duplicate parameter: ${duplicates[0]}`)
  }
  if (responseType !== 'code') {
    return failWithoutRedirect('unsupported_response_type', 'Only response_type=code is supported')
  }
  if (responseMode !== undefined && responseMode !== 'query') {
    return failWithoutRedirect('invalid_request', 'Only response_mode=query is supported')
  }
  if (!codeChallenge) return failWithoutRedirect('invalid_request', 'code_challenge is required (PKCE)')
  if (codeChallengeMethod !== 'S256') {
    return failWithoutRedirect('invalid_request', 'code_challenge_method must be S256')
  }
  if (!isValidCodeChallenge(codeChallenge)) {
    return failWithoutRedirect('invalid_request', 'code_challenge is not a valid S256 challenge')
  }

  const scope = rawScope === undefined ? undefined : cleanScope(rawScope)
  if (scope !== undefined && scope.length > MAX_SCOPE_LENGTH) {
    return failWithoutRedirect('invalid_scope', 'scope is too long')
  }

  // RFC 8707: tokens are only ever issued for this store's MCP server
  if (rawResource !== undefined && !isThisMCPResource(rawResource)) {
    return failWithoutRedirect('invalid_target', `This authorization server only issues tokens for ${MCP_RESOURCE_URL}`)
  }

  return {
    kind: 'ok',
    client,
    request: {
      clientId,
      codeChallenge,
      codeChallengeMethod: 'S256',
      redirectUri,
      resource: MCP_RESOURCE_URL,
      scope: scope || undefined,
      state,
    },
  }
}

/** The consent page URL (path and query) for a request, to start over from */
export const buildAuthorizeURL = (request: AuthorizationRequest): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: request.clientId,
    code_challenge: request.codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: request.redirectUri,
    resource: request.resource,
  })
  if (request.scope) params.set('scope', request.scope)
  if (request.state !== undefined) params.set('state', request.state)
  return `${oauthPaths.authorize}?${params.toString()}`
}

/**
 * What the consent form posts back, signed so it cannot be altered in transit. When the page
 * was shown to an admin who was already signed in to the dashboard, `uid` binds it to that
 * admin and the submission must come from the same session. Without `uid` the form carries an
 * email and password instead.
 */
export type ConsentToken = {
  cid: string
  exp: number
  n: string
  req: AuthorizationRequest
  uid?: string
  v: 1
}

export const createConsentToken = ({
  clientRecordId,
  request,
  userId,
}: {
  clientRecordId: string
  request: AuthorizationRequest
  userId?: string
}): string =>
  signPayload(SIGNING_SECRET, {
    cid: clientRecordId,
    exp: Date.now() + CONSENT_REQUEST_LIFETIME,
    n: randomToken(8),
    req: request,
    ...(userId ? { uid: userId } : {}),
    v: 1,
  } satisfies ConsentToken)

export const readConsentToken = (token: unknown): ConsentToken | null => {
  const parsed = verifyPayload<ConsentToken>(SIGNING_SECRET, token)
  if (!parsed || parsed.v !== 1 || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
    return null
  }
  const request = parsed.req
  if (
    !request ||
    typeof request !== 'object' ||
    typeof request.clientId !== 'string' ||
    typeof request.redirectUri !== 'string' ||
    typeof request.codeChallenge !== 'string' ||
    request.codeChallengeMethod !== 'S256' ||
    typeof request.resource !== 'string'
  ) {
    return null
  }
  if (typeof parsed.cid !== 'string' || (parsed.uid !== undefined && typeof parsed.uid !== 'string')) {
    return null
  }
  return parsed
}

/** Creates a single-use authorization code and returns the plain value for the redirect */
export const issueAuthorizationCode = async ({
  client,
  request,
  store,
  userId,
}: {
  client: OAuthClient
  request: AuthorizationRequest
  store: StoreMcpModuleService
  userId: string
}): Promise<string> => {
  const code = randomToken(32)

  await store.createMcpAuthorizationCodes({
    client_id: client.id,
    code_challenge: request.codeChallenge,
    code_hash: sha256(code),
    expires_at: new Date(Date.now() + AUTHORIZATION_CODE_LIFETIME),
    redirect_uri: request.redirectUri,
    resource: request.resource,
    scope: request.scope ?? null,
    user_id: userId,
  })

  return code
}
