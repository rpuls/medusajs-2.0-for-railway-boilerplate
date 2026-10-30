/**
 * Lifetimes and limits for the OAuth authorization server that protects /mcp.
 * Everything is in milliseconds unless the name says otherwise.
 */
export const AUTHORIZATION_CODE_LIFETIME = 5 * 60 * 1000
export const CONSENT_REQUEST_LIFETIME = 10 * 60 * 1000
export const ACCESS_TOKEN_LIFETIME = 60 * 60 * 1000
export const REFRESH_TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000

/** How long a fetched Client ID Metadata Document is reused when the client sends no cache headers */
export const CLIENT_METADATA_DEFAULT_TTL = 60 * 60 * 1000
export const CLIENT_METADATA_MIN_TTL = 5 * 60 * 1000
export const CLIENT_METADATA_MAX_TTL = 24 * 60 * 60 * 1000
export const CLIENT_METADATA_FETCH_TIMEOUT = 5 * 1000
export const CLIENT_METADATA_MAX_BYTES = 64 * 1024

export const MAX_REDIRECT_URIS = 10
export const MAX_URI_LENGTH = 2048
export const MAX_CLIENT_NAME_LENGTH = 120
export const MAX_SCOPE_LENGTH = 512
export const MAX_STATE_LENGTH = 1024

/** Expired codes and tokens are deleted opportunistically from the token endpoint, at most this often */
export const CLEANUP_INTERVAL = 10 * 60 * 1000

/** `last_used_at` on a grant is refreshed at most this often, so MCP calls stay cheap */
export const LAST_USED_WRITE_INTERVAL = 5 * 60 * 1000

/** Apps that registered, or whose metadata document was fetched, but were never approved, are deleted after this */
export const UNUSED_CLIENT_LIFETIME = 24 * 60 * 60 * 1000

export const RATE_LIMITS = {
  // ChatGPT registers once per connection; the MCP Inspector registers on every connect
  register: { limit: 10, windowMs: 10 * 60 * 1000 },
  // Across all callers, so spreading over many addresses cannot fill the clients table either
  registerGlobal: { limit: 200, windowMs: 60 * 60 * 1000 },
  authorizePage: { limit: 60, windowMs: 60 * 1000 },
  // Each one is an outbound request to a host the caller chose, and a row
  metadataFetch: { limit: 10, windowMs: 10 * 60 * 1000 },
  metadataFetchGlobal: { limit: 200, windowMs: 60 * 60 * 1000 },
  token: { limit: 60, windowMs: 60 * 1000 },
  revoke: { limit: 60, windowMs: 60 * 1000 },
  // The consent page takes an admin password, so it gets a login form's limits
  passwordPerIP: { limit: 20, windowMs: 15 * 60 * 1000 },
  passwordPerEmail: { limit: 5, windowMs: 15 * 60 * 1000 },
  // Per grant. A busy agent makes a few calls a second at most.
  mcp: { limit: 120, windowMs: 60 * 1000 },
} as const
