import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import type { IStoreModuleService, Logger } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { STORE_MCP_MODULE } from '../../modules/store-mcp'
import type StoreMcpModuleService from '../../modules/store-mcp/service'
import { STORE_MCP_ENABLED } from '../config'
import { type Admin, checkAdminPassword, getSessionAdmin } from './admin-identity'
import {
  buildAuthorizeURL,
  buildRedirectURL,
  createConsentToken,
  issueAuthorizationCode,
  parseAuthorizationRequest,
  readConsentToken,
} from './authorize'
import { validateClientMetadata } from './client-metadata'
import { authenticateClient, getClientRedirectUris, type OAuthClient, registerDynamicClient } from './clients'
import { renderConsentPage, renderRequestError } from './consent-page'
import { RATE_LIMITS } from './constants'
import { verifyPKCE } from './crypto'
import {
  checkRateLimit,
  getClientIP,
  isSameOriginRequest,
  oauthError,
  oauthJSON,
  publicCORSHeaders,
  rateLimited,
  readParams,
  readQuery,
  refundRateLimit,
  seeOther,
} from './http'
import { redirectUriMatches } from './redirect-uris'
import {
  cleanupExpired,
  findAuthorizationCode,
  findGrant,
  findOrCreateGrant,
  findToken,
  issueTokens,
  revokeGrant,
} from './tokens'
import { isThisMCPResource, oauthPaths } from './urls'

/**
 * The OAuth authorization server's HTTP surface: /oauth/register, /oauth/token and
 * /oauth/revoke for apps, /oauth/authorize for the admin's browser. Ported from the
 * mcp-oauth plugin in payload-4-boilerplate, which follows the MCP authorization spec.
 */

type Handler = (req: MedusaRequest, res: MedusaResponse) => Promise<void> | void

const storeOf = (req: MedusaRequest) => req.scope.resolve<StoreMcpModuleService>(STORE_MCP_MODULE)
const loggerOf = (req: MedusaRequest) => req.scope.resolve<Logger>(ContainerRegistrationKeys.LOGGER)

/** With STORE_MCP_ENABLED=false every endpoint answers as if it did not exist */
export const whenEnabled =
  (handler: Handler): Handler =>
  (req, res) => {
    if (!STORE_MCP_ENABLED) {
      res.status(404).json({ message: 'Not found' })
      return
    }
    return handler(req, res)
  }

/** Dynamic client registration (RFC 7591). Open to anyone, like every registration endpoint. */
export const register: Handler = async (req, res) => {
  const limit = checkRateLimit(`register:${getClientIP(req)}`, RATE_LIMITS.register)
  if (!limit.allowed) return rateLimited(res, limit.retryAfterSeconds)
  const overall = checkRateLimit('register:all', RATE_LIMITS.registerGlobal)
  if (!overall.allowed) return rateLimited(res, overall.retryAfterSeconds)

  const validated = validateClientMetadata(req.body, 'dynamic')
  if (validated.ok === false) return oauthError(res, validated.error, validated.description)

  const { client, clientSecret } = await registerDynamicClient({ metadata: validated.metadata, store: storeOf(req) })
  loggerOf(req).info(`Store MCP: app registered: ${client.client_name} (${client.client_id})`)
  void cleanupExpired(storeOf(req), (message) => loggerOf(req).warn(message))

  oauthJSON(
    res,
    {
      client_id: client.client_id,
      client_id_issued_at: Math.floor(new Date(client.created_at).getTime() / 1000),
      ...(clientSecret ? { client_secret: clientSecret, client_secret_expires_at: 0 } : {}),
      ...validated.metadata.registered,
    },
    201
  )
}

const exchangeAuthorizationCode = async (
  req: MedusaRequest,
  res: MedusaResponse,
  client: OAuthClient,
  params: URLSearchParams
): Promise<void> => {
  const store = storeOf(req)
  const code = params.get('code')
  const codeVerifier = params.get('code_verifier')
  const redirectUri = params.get('redirect_uri')
  const resource = params.get('resource')

  if (!code) return oauthError(res, 'invalid_request', 'code is required')
  if (!codeVerifier) return oauthError(res, 'invalid_request', 'code_verifier is required')

  const record = await findAuthorizationCode(store, code)
  if (!record) return oauthError(res, 'invalid_grant', 'Unknown authorization code')

  // Client and PKCE first: only the party that started this sign-in may trigger the replay
  // revocation below, not anyone who saw a spent code in a browser history or a log
  if (record.client_id !== client.id) {
    return oauthError(res, 'invalid_grant', 'Authorization code was issued to another client')
  }
  if (!verifyPKCE(codeVerifier, record.code_challenge)) {
    return oauthError(res, 'invalid_grant', 'code_verifier does not match code_challenge')
  }
  if (record.used_at) {
    // OAuth 2.1 §4.1.3: a replayed code revokes what the first exchange produced
    if (record.grant_id) await revokeGrant(store, record.grant_id)
    loggerOf(req).warn(`Store MCP: authorization code replayed by ${client.client_name}, grant revoked`)
    return oauthError(res, 'invalid_grant', 'Authorization code was already used')
  }
  if (new Date(record.expires_at).getTime() <= Date.now()) {
    return oauthError(res, 'invalid_grant', 'Authorization code has expired')
  }
  if (redirectUri !== null && redirectUri !== record.redirect_uri) {
    return oauthError(res, 'invalid_grant', 'redirect_uri does not match the authorization request')
  }
  if (resource !== null && !isThisMCPResource(resource)) {
    return oauthError(res, 'invalid_target', 'The token can only be issued for this MCP server')
  }

  // Claim the code before issuing anything, so a concurrent duplicate request gets nothing
  if (!(await store.claimSingleUse('authorization_code', record.id))) {
    return oauthError(res, 'invalid_grant', 'Authorization code was already used')
  }

  const grant = await findOrCreateGrant({
    clientRecordId: client.id,
    resource: record.resource,
    scope: record.scope,
    store,
    userId: record.user_id,
  })
  // Remember what the code produced, so a later replay can revoke it
  await store.updateMcpAuthorizationCodes({ id: record.id, grant_id: grant.id })

  const tokens = await issueTokens({ grant, store })
  loggerOf(req).info(`Store MCP: ${client.client_name} connected as admin ${record.user_id}`)
  oauthJSON(res, tokens)
}

const refreshAccessToken = async (
  req: MedusaRequest,
  res: MedusaResponse,
  client: OAuthClient,
  params: URLSearchParams
): Promise<void> => {
  const store = storeOf(req)
  const refreshToken = params.get('refresh_token')
  const resource = params.get('resource')
  const requestedScope = params.get('scope')

  if (!refreshToken) return oauthError(res, 'invalid_request', 'refresh_token is required')

  const record = await findToken(store, 'refresh', refreshToken)
  if (!record) return oauthError(res, 'invalid_grant', 'Unknown refresh token')
  if (record.client_id !== client.id) {
    return oauthError(res, 'invalid_grant', 'Refresh token was issued to another client')
  }

  if (record.used_at) {
    // OAuth 2.1 §4.3.1: a spent refresh token showing up again means it leaked. Revoke everything.
    await revokeGrant(store, record.grant_id)
    loggerOf(req).warn(`Store MCP: refresh token reuse by ${client.client_name}, grant revoked`)
    return oauthError(res, 'invalid_grant', 'Refresh token was already used')
  }
  if (new Date(record.expires_at).getTime() <= Date.now()) {
    return oauthError(res, 'invalid_grant', 'Refresh token has expired')
  }
  if (resource !== null && !isThisMCPResource(resource)) {
    return oauthError(res, 'invalid_target', 'The token can only be issued for this MCP server')
  }

  const grant = await findGrant(store, record.grant_id)
  if (!grant || grant.revoked_at) return oauthError(res, 'invalid_grant', 'Access has been revoked')

  if (requestedScope !== null) {
    const granted = new Set((grant.scope ?? '').split(' ').filter(Boolean))
    const requested = requestedScope.split(' ').filter(Boolean)
    if (requested.some((scope) => !granted.has(scope))) {
      return oauthError(res, 'invalid_scope', 'Requested scope exceeds the original grant')
    }
  }

  if (!(await store.claimSingleUse('token', record.id))) {
    return oauthError(res, 'invalid_grant', 'Refresh token was already used')
  }

  oauthJSON(res, await issueTokens({ grant, store }))
}

const clientAuthFailed = (res: MedusaResponse, description: string, usedBasicAuth: boolean) =>
  oauthError(res, 'invalid_client', description, 401, usedBasicAuth ? { 'WWW-Authenticate': 'Basic realm="OAuth"' } : {})

/** The token endpoint (OAuth 2.1 §3.2): authorization codes in, access and refresh tokens out */
export const token: Handler = async (req, res) => {
  const limit = checkRateLimit(`token:${getClientIP(req)}`, RATE_LIMITS.token)
  if (!limit.allowed) return rateLimited(res, limit.retryAfterSeconds)

  const params = readParams(req)
  const auth = await authenticateClient({ params, req, store: storeOf(req) })
  if (auth.ok === false) return clientAuthFailed(res, auth.description, auth.usedBasicAuth)

  const grantType = params.get('grant_type')
  if (grantType === 'authorization_code') {
    await exchangeAuthorizationCode(req, res, auth.client, params)
  } else if (grantType === 'refresh_token') {
    await refreshAccessToken(req, res, auth.client, params)
  } else {
    oauthError(res, 'unsupported_grant_type', 'Supported grant types: authorization_code, refresh_token')
  }

  // Housekeeping rides along with real traffic, so no scheduled job is needed
  await cleanupExpired(storeOf(req), (message) => loggerOf(req).warn(message))
}

/**
 * Token revocation (RFC 7009), for apps that offer a "disconnect" action. Revoking either an
 * access or a refresh token revokes the whole grant, since the app is walking away from it.
 * Tokens that do not belong to the calling client are ignored silently, as the RFC requires.
 */
export const revoke: Handler = async (req, res) => {
  const limit = checkRateLimit(`revoke:${getClientIP(req)}`, RATE_LIMITS.revoke)
  if (!limit.allowed) return rateLimited(res, limit.retryAfterSeconds)

  const store = storeOf(req)
  const params = readParams(req)
  const auth = await authenticateClient({ params, req, store })
  if (auth.ok === false) return clientAuthFailed(res, auth.description, auth.usedBasicAuth)

  const value = params.get('token')
  if (!value) return oauthError(res, 'invalid_request', 'token is required')

  const record = await findToken(store, undefined, value)
  if (record && record.client_id === auth.client.id) {
    await revokeGrant(store, record.grant_id)
    loggerOf(req).info(`Store MCP: ${auth.client.client_name} disconnected itself`)
  }

  res.set({ ...publicCORSHeaders, 'Cache-Control': 'no-store' }).status(200).end()
}

const storeName = async (req: MedusaRequest): Promise<string> => {
  if (process.env.STORE_NAME) return process.env.STORE_NAME
  const [store] = await req.scope.resolve<IStoreModuleService>(Modules.STORE).listStores({}, { take: 1 })
  return store?.name || 'Your store'
}

/**
 * GET /oauth/authorize: the consent page. An AI app sends the admin here. An admin already
 * signed in to the dashboard only has to click Allow; anyone else signs in on the page itself.
 */
export const authorizePage: Handler = async (req, res) => {
  const params = readQuery(req)
  if (typeof params.reason === 'string' && !params.client_id) {
    return renderRequestError(res, { reason: params.reason })
  }

  const limit = checkRateLimit(`authorize:${getClientIP(req)}`, RATE_LIMITS.authorizePage)
  if (!limit.allowed) {
    return renderRequestError(res, { description: 'Too many requests. Wait a minute and try again.' }, 429)
  }

  const parsed = await parseAuthorizationRequest({
    callerIP: getClientIP(req),
    logger: loggerOf(req),
    params,
    store: storeOf(req),
  })
  if (parsed.kind === 'invalid') {
    return renderRequestError(res, { description: parsed.description, error: parsed.error })
  }
  // Apps known only from a fetched metadata document are created here, so clean up here too
  void cleanupExpired(storeOf(req), (message) => loggerOf(req).warn(message))

  const sessionAdmin = await getSessionAdmin(req)
  const showPasswordForm = !sessionAdmin || params.account === 'other'
  const authorizeURL = buildAuthorizeURL(parsed.request)

  renderConsentPage(res, {
    appName: parsed.client.client_name,
    appUri: parsed.client.client_uri ?? null,
    redirectUri: parsed.request.redirectUri,
    storeName: await storeName(req),
    requestToken: createConsentToken({
      clientRecordId: parsed.client.id,
      request: parsed.request,
      userId: showPasswordForm ? undefined : sessionAdmin!.id,
    }),
    sessionAdmin,
    showPasswordForm,
    switchAccountHref: `${authorizeURL}&account=other`,
  })
}

/**
 * POST /oauth/authorize: the admin's decision. The signed request token carries the whole
 * authorization request, so nothing in it can be swapped. On "allow" the admin is checked
 * once more, either as the same dashboard session the page was shown to or by email and
 * password, and only then is a code issued and the browser sent back to the app. The redirect
 * URI is checked against the client's registration again, so a stale token can never redirect
 * anywhere the app no longer owns.
 */
export const authorizeDecision: Handler = async (req, res) => {
  if (!isSameOriginRequest(req)) {
    res.status(403).json({ message: 'Cross-site form submissions are not accepted' })
    return
  }

  const store = storeOf(req)
  const form = readParams(req)
  const consent = readConsentToken(form.get('request'))
  if (!consent) return seeOther(res, `${oauthPaths.authorize}?reason=expired`)

  const [client] = await store.listMcpClients({ id: consent.cid }, { take: 1 })
  if (!client || client.client_id !== consent.req.clientId) {
    return seeOther(res, `${oauthPaths.authorize}?reason=unknown_client`)
  }
  if (!redirectUriMatches(getClientRedirectUris(client), consent.req.redirectUri)) {
    return renderRequestError(res, { description: 'The redirect URI is no longer registered for this app.' })
  }

  const { redirectUri, state } = consent.req
  if (form.get('decision') !== 'allow') {
    loggerOf(req).info(`Store MCP: an admin denied ${client.client_name}`)
    return seeOther(res, buildRedirectURL(redirectUri, { error: 'access_denied', error_description: 'The admin denied the request', state }))
  }

  let admin: Admin | null = null
  let failure: string | undefined
  const email = (form.get('email') ?? '').trim().toLowerCase()

  if (consent.uid) {
    const sessionAdmin = await getSessionAdmin(req)
    if (sessionAdmin?.id === consent.uid) admin = sessionAdmin
    // Signed out, or signed in as someone else, since the page was rendered: start over there
    else return seeOther(res, buildAuthorizeURL(consent.req))
  } else {
    const password = form.get('password') ?? ''
    // Counted before the password check, so parallel attempts cannot all slip under the limit,
    // and handed back on success, so an admin who signs in correctly is never locked out
    const ipKey = `password-ip:${getClientIP(req)}`
    const emailKey = `password-email:${email}`
    const perIP = checkRateLimit(ipKey, RATE_LIMITS.passwordPerIP)
    const perEmail = checkRateLimit(emailKey, RATE_LIMITS.passwordPerEmail)
    if (!perIP.allowed || !perEmail.allowed) {
      failure = 'Too many failed sign-in attempts. Wait 15 minutes and try again.'
    } else if (!email || !password || email.length > 254 || password.length > 1024) {
      failure = 'Enter your admin email and password.'
    } else {
      const checked = await checkAdminPassword(req, email, password)
      if (checked.ok === true) {
        admin = checked.admin
        refundRateLimit(ipKey)
        refundRateLimit(emailKey)
      } else {
        failure =
          checked.ok === false && checked.reason === 'mfa'
            ? 'This account uses two-step verification. Sign in to the admin dashboard in this browser first, then reload this page.'
            : 'That email and password do not match an admin account.'
      }
    }
  }

  if (!admin) {
    return renderConsentPage(
      res,
      {
        appName: client.client_name,
        appUri: client.client_uri ?? null,
        redirectUri,
        storeName: await storeName(req),
        requestToken: createConsentToken({ clientRecordId: client.id, request: consent.req }),
        sessionAdmin: null,
        showPasswordForm: true,
        switchAccountHref: buildAuthorizeURL(consent.req),
        error: failure,
        email,
      },
      401
    )
  }

  const code = await issueAuthorizationCode({ client, request: consent.req, store, userId: admin.id })
  loggerOf(req).info(`Store MCP: admin ${admin.id} allowed ${client.client_name}`)
  seeOther(res, buildRedirectURL(redirectUri, { code, state }))
}
