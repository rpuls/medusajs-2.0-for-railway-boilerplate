import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/** Opaque, URL-safe secret: 256 bits by default */
export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url')

/** Hex SHA-256. Codes, tokens and client secrets are only ever stored as this hash. */
export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

/** Constant-time string comparison; unequal lengths still take the same path */
export const safeEqual = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) {
    // Compare anyway so timing does not reveal the length difference, then fail
    timingSafeEqual(bufferA, bufferA)
    return false
  }
  return timingSafeEqual(bufferA, bufferB)
}

// RFC 7636 §4.1: 43 to 128 characters from the unreserved set
const PKCE_VERIFIER = /^[A-Za-z0-9\-._~]{43,128}$/
// S256 challenges are base64url(sha256) without padding: exactly 43 characters
const PKCE_CHALLENGE = /^[A-Za-z0-9\-_]{43}$/

export const isValidCodeChallenge = (value: unknown): value is string =>
  typeof value === 'string' && PKCE_CHALLENGE.test(value)

export const isValidCodeVerifier = (value: unknown): value is string =>
  typeof value === 'string' && PKCE_VERIFIER.test(value)

/** PKCE S256: BASE64URL(SHA256(code_verifier)) must equal the stored code_challenge */
export const verifyPKCE = (codeVerifier: string, codeChallenge: string): boolean => {
  if (!isValidCodeVerifier(codeVerifier)) return false
  const computed = createHash('sha256').update(codeVerifier).digest('base64url')
  return safeEqual(computed, codeChallenge)
}

const base64url = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const fromBase64url = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

const hmac = (secret: string, payload: string) =>
  createHmac('sha256', secret).update(payload).digest('base64url')

/**
 * Signs a small JSON payload with HMAC-SHA256. Used for the consent form's request token,
 * which ties the form submission to the exact authorization request and signed-in user.
 */
export const signPayload = (secret: string, payload: Record<string, unknown>): string => {
  const encoded = base64url(JSON.stringify(payload))
  return `${encoded}.${hmac(secret, encoded)}`
}

export const verifyPayload = <T extends Record<string, unknown>>(
  secret: string,
  token: unknown,
): T | null => {
  if (typeof token !== 'string' || token.length > 8192) return null
  const [encoded, signature, ...rest] = token.split('.')
  if (!encoded || !signature || rest.length > 0) return null
  if (!safeEqual(hmac(secret, encoded), signature)) return null
  try {
    const parsed: unknown = JSON.parse(fromBase64url(encoded))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as T) : null
  } catch {
    return null
  }
}
