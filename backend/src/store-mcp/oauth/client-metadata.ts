import {
  MAX_CLIENT_NAME_LENGTH,
  MAX_REDIRECT_URIS,
  MAX_SCOPE_LENGTH,
  MAX_URI_LENGTH,
} from './constants'
import { redirectUriHost, validateRedirectUri } from './redirect-uris'

export type TokenEndpointAuthMethod = 'client_secret_basic' | 'client_secret_post' | 'none'
export type RegistrationType = 'dynamic' | 'metadata_document'

/** The subset of RFC 7591 client metadata this server understands, normalized */
export type ClientMetadata = {
  applicationType?: 'native' | 'web'
  clientName: string
  clientUri?: string
  grantTypes: string[]
  logoUri?: string
  redirectUris: string[]
  /** Everything that was accepted, echoed back to dynamic clients and stored for reference */
  registered: Record<string, unknown>
  responseTypes: string[]
  scope?: string
  tokenEndpointAuthMethod: TokenEndpointAuthMethod
}

export type ClientMetadataError = {
  description: string
  error: 'invalid_client_metadata' | 'invalid_redirect_uri'
}

export type ClientMetadataResult =
  | ({ ok: false } & ClientMetadataError)
  | { metadata: ClientMetadata; ok: true }

const SUPPORTED_AUTH_METHODS: readonly TokenEndpointAuthMethod[] = [
  'none',
  'client_secret_basic',
  'client_secret_post',
]
const SUPPORTED_GRANT_TYPES = ['authorization_code', 'refresh_token']
const SUPPORTED_RESPONSE_TYPES = ['code']
const HTTPS_URL_FIELDS = ['client_uri', 'logo_uri', 'tos_uri', 'policy_uri'] as const

const fail = (error: ClientMetadataError['error'], description: string): ClientMetadataResult => ({
  ok: false,
  error,
  description,
})

/** Trims, strips control characters and caps the length. Empty strings become undefined. */
const cleanText = (value: unknown, maxLength: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
  return cleaned || undefined
}

const isHttpsURL = (value: string): boolean => {
  if (value.length > MAX_URI_LENGTH) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const stringList = (value: unknown): null | string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string')
    ? (value as string[])
    : null

/**
 * Validates client metadata from a dynamic registration request (RFC 7591) or a fetched
 * Client ID Metadata Document. Strict on everything security-relevant, lenient elsewhere:
 * unknown fields are ignored, missing optional fields get the RFC defaults.
 */
export const validateClientMetadata = (
  input: unknown,
  registrationType: RegistrationType,
): ClientMetadataResult => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('invalid_client_metadata', 'Client metadata must be a JSON object')
  }
  const doc = input as Record<string, unknown>

  if (!Array.isArray(doc.redirect_uris) || doc.redirect_uris.length === 0) {
    return fail('invalid_redirect_uri', 'redirect_uris must be a non-empty array')
  }
  if (doc.redirect_uris.length > MAX_REDIRECT_URIS) {
    return fail('invalid_redirect_uri', `At most ${MAX_REDIRECT_URIS} redirect_uris are allowed`)
  }
  const redirectUris: string[] = []
  for (const uri of doc.redirect_uris) {
    const problem = validateRedirectUri(uri)
    if (problem) return fail('invalid_redirect_uri', problem)
    if (!redirectUris.includes(uri as string)) redirectUris.push(uri as string)
  }

  let tokenEndpointAuthMethod: TokenEndpointAuthMethod
  if (registrationType === 'metadata_document') {
    // A client identified by a metadata document shares no secret with us, so only the public
    // client flow (PKCE, no client authentication) can work. Draft -00 names a single method;
    // ChatGPT additionally publishes the plural list from MCP SEP-3149. `none` must be allowed.
    const methods = Array.isArray(doc.token_endpoint_auth_methods_supported)
      ? doc.token_endpoint_auth_methods_supported
      : doc.token_endpoint_auth_method === undefined
        ? ['none']
        : [doc.token_endpoint_auth_method]
    if (!methods.includes('none')) {
      return fail(
        'invalid_client_metadata',
        'This server only supports token_endpoint_auth_method "none" for client ID metadata documents',
      )
    }
    tokenEndpointAuthMethod = 'none'
  } else {
    // RFC 7591 §2: the default when omitted is client_secret_basic
    const requested = doc.token_endpoint_auth_method ?? 'client_secret_basic'
    if (
      typeof requested !== 'string' ||
      !SUPPORTED_AUTH_METHODS.includes(requested as TokenEndpointAuthMethod)
    ) {
      return fail(
        'invalid_client_metadata',
        `Unsupported token_endpoint_auth_method. Supported: ${SUPPORTED_AUTH_METHODS.join(', ')}`,
      )
    }
    tokenEndpointAuthMethod = requested as TokenEndpointAuthMethod
  }

  const grantTypes = doc.grant_types === undefined ? ['authorization_code'] : stringList(doc.grant_types)
  if (!grantTypes || grantTypes.some((type) => !SUPPORTED_GRANT_TYPES.includes(type))) {
    return fail(
      'invalid_client_metadata',
      `Unsupported grant_types. Supported: ${SUPPORTED_GRANT_TYPES.join(', ')}`,
    )
  }
  if (!grantTypes.includes('authorization_code')) {
    return fail('invalid_client_metadata', 'grant_types must include authorization_code')
  }

  const responseTypes = doc.response_types === undefined ? ['code'] : stringList(doc.response_types)
  if (!responseTypes || responseTypes.some((type) => !SUPPORTED_RESPONSE_TYPES.includes(type))) {
    return fail('invalid_client_metadata', 'Only response_types ["code"] is supported')
  }

  const urls: Partial<Record<(typeof HTTPS_URL_FIELDS)[number], string>> = {}
  for (const field of HTTPS_URL_FIELDS) {
    const value = doc[field]
    if (value === undefined || value === null || value === '') continue
    if (typeof value !== 'string' || !isHttpsURL(value)) {
      return fail('invalid_client_metadata', `${field} must be an https URL`)
    }
    urls[field] = value
  }

  let applicationType: ClientMetadata['applicationType']
  if (doc.application_type !== undefined) {
    if (doc.application_type !== 'web' && doc.application_type !== 'native') {
      return fail('invalid_client_metadata', 'application_type must be "web" or "native"')
    }
    applicationType = doc.application_type
  }

  const clientName = cleanText(doc.client_name, MAX_CLIENT_NAME_LENGTH) ?? redirectUriHost(redirectUris[0]!)
  const scope = cleanText(doc.scope, MAX_SCOPE_LENGTH)

  const registered: Record<string, unknown> = {
    client_name: clientName,
    redirect_uris: redirectUris,
    grant_types: grantTypes,
    response_types: responseTypes,
    token_endpoint_auth_method: tokenEndpointAuthMethod,
    ...urls,
    ...(scope ? { scope } : {}),
    ...(applicationType ? { application_type: applicationType } : {}),
    ...(typeof doc.software_id === 'string' ? { software_id: doc.software_id.slice(0, 200) } : {}),
    ...(typeof doc.software_version === 'string'
      ? { software_version: doc.software_version.slice(0, 100) }
      : {}),
  }

  return {
    ok: true,
    metadata: {
      applicationType,
      clientName,
      clientUri: urls.client_uri,
      grantTypes,
      logoUri: urls.logo_uri,
      redirectUris,
      registered,
      responseTypes,
      scope,
      tokenEndpointAuthMethod,
    },
  }
}
