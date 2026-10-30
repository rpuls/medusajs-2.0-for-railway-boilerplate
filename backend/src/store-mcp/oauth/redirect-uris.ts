import { MAX_URI_LENGTH } from './constants'

// `URL.hostname` keeps the brackets around IPv6 literals
const LOOPBACK_IPS = new Set(['127.0.0.1', '[::1]'])

const parseURL = (value: string): URL | null => {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export const isLoopbackIP = (hostname: string): boolean => LOOPBACK_IPS.has(hostname)

export const isLoopbackHost = (hostname: string): boolean =>
  isLoopbackIP(hostname) || hostname === 'localhost' || hostname.endsWith('.localhost')

/**
 * Redirect URIs must be https, or http on the loopback interface for native clients and local
 * development. Returns a reason the URI is unacceptable, or null when it is fine.
 */
export const validateRedirectUri = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length === 0) return 'redirect_uri must be a string'
  if (value.length > MAX_URI_LENGTH) return 'redirect_uri is too long'
  const url = parseURL(value)
  if (!url) return 'redirect_uri must be an absolute URL'
  if (url.hash || value.includes('#')) return 'redirect_uri must not contain a fragment'
  if (url.username || url.password) return 'redirect_uri must not contain credentials'
  if (url.protocol === 'https:') return null
  if (url.protocol === 'http:' && isLoopbackHost(url.hostname)) return null
  return 'redirect_uri must use https (http is only allowed for localhost)'
}

/**
 * Exact string match, with the one exception OAuth 2.1 §8.4.2 requires: a loopback IP redirect
 * URI (http://127.0.0.1 or http://[::1]) may use any port, because native apps bind a random
 * port per run. `localhost` as a host name gets no such exception.
 */
export const redirectUriMatches = (registered: readonly string[], requested: string): boolean => {
  if (registered.includes(requested)) return true

  const requestedURL = parseURL(requested)
  if (!requestedURL || requestedURL.protocol !== 'http:' || !isLoopbackIP(requestedURL.hostname)) {
    return false
  }

  return registered.some((candidate) => {
    const url = parseURL(candidate)
    if (!url || url.protocol !== 'http:' || url.hostname !== requestedURL.hostname) return false
    return url.pathname === requestedURL.pathname && url.search === requestedURL.search
  })
}

/** Human-readable host for the consent page, e.g. "chatgpt.com" or "127.0.0.1:6274" */
export const redirectUriHost = (value: string): string => parseURL(value)?.host ?? value
