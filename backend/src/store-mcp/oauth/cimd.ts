import { lookup as dnsLookup } from 'node:dns/promises'
import { isIP, isIPv4 } from 'node:net'

import {
  CLIENT_METADATA_DEFAULT_TTL,
  CLIENT_METADATA_FETCH_TIMEOUT,
  CLIENT_METADATA_MAX_BYTES,
  CLIENT_METADATA_MAX_TTL,
  CLIENT_METADATA_MIN_TTL,
  MAX_URI_LENGTH,
} from './constants'
import { type ClientMetadata, validateClientMetadata } from './client-metadata'

/**
 * OAuth Client ID Metadata Documents (draft-ietf-oauth-client-id-metadata-document-00): a client
 * identifies itself with an HTTPS URL, and the authorization server fetches the JSON document at
 * that URL to learn the client's name and redirect URIs. ChatGPT uses this with
 * https://chatgpt.com/oauth/client.json.
 *
 * Fetching a client-supplied URL from the server is an SSRF risk, so the URL and its DNS answers
 * are checked before anything is requested, and the response is capped in time and size.
 */

export type ClientIdURLCheck = { description: string; ok: false } | { ok: true; url: URL }

const isForbiddenHostname = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname.endsWith('.localhost') ||
  hostname.endsWith('.local') ||
  hostname.endsWith('.internal') ||
  hostname.endsWith('.arpa') ||
  !hostname.includes('.')

/** draft-ietf-oauth-client-id-metadata-document-00 §4: https, a host, a path, no fragment */
export const checkClientIdURL = (clientId: string): ClientIdURLCheck => {
  if (clientId.length > MAX_URI_LENGTH) return { ok: false, description: 'client_id is too long' }
  let url: URL
  try {
    url = new URL(clientId)
  } catch {
    return { ok: false, description: 'client_id is not a valid URL' }
  }
  if (url.protocol !== 'https:') {
    return { ok: false, description: 'A client ID metadata document URL must use https' }
  }
  if (url.username || url.password) {
    return { ok: false, description: 'A client ID metadata document URL must not contain credentials' }
  }
  if (url.hash || clientId.includes('#')) {
    return { ok: false, description: 'A client ID metadata document URL must not contain a fragment' }
  }
  if (!url.pathname || url.pathname === '/') {
    return { ok: false, description: 'A client ID metadata document URL must contain a path' }
  }
  const bareHost = url.hostname.replace(/^\[|\]$/g, '')
  if (isIP(bareHost) || isForbiddenHostname(url.hostname)) {
    return { ok: false, description: 'A client ID metadata document URL must use a public host name' }
  }
  return { ok: true, url }
}

const ipv4ToNumber = (address: string): number =>
  address.split('.').reduce((total, octet) => total * 256 + Number(octet), 0)

const inRange = (value: number, base: string, bits: number): boolean => {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (value & mask) >>> 0 === (ipv4ToNumber(base) & mask) >>> 0
}

const PRIVATE_IPV4: Array<[string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]

/** True for globally routable unicast addresses only */
export const isPublicAddress = (address: string): boolean => {
  if (isIPv4(address)) {
    const value = ipv4ToNumber(address)
    return !PRIVATE_IPV4.some(([base, bits]) => inRange(value, base, bits))
  }
  if (!isIP(address)) return false

  const lower = address.toLowerCase()
  // IPv4-mapped (::ffff:1.2.3.4) and NAT64 (64:ff9b::1.2.3.4) addresses embed an IPv4 address
  const mapped = lower.match(/^(?:::ffff:|64:ff9b::)(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPublicAddress(mapped[1]!)
  if (lower === '::' || lower === '::1') return false
  if (/^(::ffff:|64:ff9b:)/.test(lower)) return false
  // fc00::/7 unique local, fe80::/10 link local, fec0::/10 site local, ff00::/8 multicast
  if (/^(f[cd][0-9a-f]{2}|fe[89ab][0-9a-f]|fe[c-f][0-9a-f]|ff[0-9a-f]{2}):/.test(lower)) return false
  // 2001:db8::/32 documentation, 2001::/32 Teredo, 2002::/16 6to4 are not plain public hosts
  if (/^2001:(db8|0?0?0?0?):/.test(lower) || lower.startsWith('2002:')) return false
  return true
}

export type MetadataDocumentDeps = {
  fetch?: typeof fetch
  lookup?: (hostname: string) => Promise<string[]>
  now?: () => number
}

export type MetadataDocumentResult =
  | { description: string; ok: false }
  | { expiresAt: Date; metadata: ClientMetadata; ok: true; raw: Record<string, unknown> }

const defaultLookup = async (hostname: string): Promise<string[]> =>
  (await dnsLookup(hostname, { all: true })).map((entry) => entry.address)

/** Reads the body up to `maxBytes`; returns null when the document is larger */
const readLimited = async (response: Response, maxBytes: number): Promise<null | string> => {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) return null
  if (!response.body) return ''

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf8')
}

/** How long to reuse a fetched document: the response's max-age, clamped to sane bounds */
export const metadataCacheTTL = (cacheControl: null | string): number => {
  const match = cacheControl?.match(/max-age=(\d+)/i)
  if (!match) return CLIENT_METADATA_DEFAULT_TTL
  const seconds = Number(match[1])
  return Math.min(CLIENT_METADATA_MAX_TTL, Math.max(CLIENT_METADATA_MIN_TTL, seconds * 1000))
}

export const fetchClientMetadataDocument = async (
  clientId: string,
  deps: MetadataDocumentDeps = {},
): Promise<MetadataDocumentResult> => {
  const check = checkClientIdURL(clientId)
  if (check.ok === false) return check

  let addresses: string[]
  try {
    addresses = await (deps.lookup ?? defaultLookup)(check.url.hostname)
  } catch {
    return { ok: false, description: 'The client_id host name could not be resolved' }
  }
  if (addresses.length === 0 || !addresses.every(isPublicAddress)) {
    return { ok: false, description: 'The client_id host must resolve to a public address' }
  }

  let response: Response
  try {
    response = await (deps.fetch ?? fetch)(check.url, {
      headers: { Accept: 'application/json', 'User-Agent': 'store-mcp-oauth-server' },
      redirect: 'error',
      signal: AbortSignal.timeout(CLIENT_METADATA_FETCH_TIMEOUT),
    })
  } catch {
    return { ok: false, description: 'The client ID metadata document could not be fetched' }
  }
  if (response.ok === false) {
    return {
      ok: false,
      description: `The client ID metadata document responded with HTTP ${response.status}`,
    }
  }

  const text = await readLimited(response, CLIENT_METADATA_MAX_BYTES)
  if (text === null) return { ok: false, description: 'The client ID metadata document is too large' }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, description: 'The client ID metadata document is not valid JSON' }
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, description: 'The client ID metadata document must be a JSON object' }
  }
  const doc = raw as Record<string, unknown>
  if (doc.client_id !== clientId) {
    return { ok: false, description: 'client_id inside the metadata document does not match its URL' }
  }

  const validated = validateClientMetadata(doc, 'metadata_document')
  if (validated.ok === false) return { ok: false, description: validated.description }

  const ttl = metadataCacheTTL(response.headers.get('cache-control'))
  return {
    ok: true,
    expiresAt: new Date((deps.now?.() ?? Date.now()) + ttl),
    metadata: validated.metadata,
    raw: doc,
  }
}
