import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { createHash } from 'node:crypto'
import { ISSUER } from '../config'

/**
 * Response helpers shared by the OAuth endpoints and discovery documents.
 *
 * Token-style endpoints are called by other servers and by browser-based clients such as the
 * MCP Inspector, so they answer with permissive CORS; they never rely on cookies. The consent
 * page does the opposite and insists on same-origin.
 */
export const publicCORSHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Max-Age': '86400',
}

export const noStoreHeaders: Record<string, string> = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
}

export const oauthJSON = (
  res: MedusaResponse,
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): void => {
  res.set({ ...publicCORSHeaders, ...noStoreHeaders, ...headers }).status(status).json(body)
}

/** RFC 6749 §5.2 error body */
export const oauthError = (
  res: MedusaResponse,
  error: string,
  description: string,
  status = 400,
  headers: Record<string, string> = {}
): void => oauthJSON(res, { error, error_description: description }, status, headers)

export const preflight = (_req: MedusaRequest, res: MedusaResponse): void => {
  res.set(publicCORSHeaders).status(204).end()
}

export const rateLimited = (res: MedusaResponse, retryAfterSeconds: number): void =>
  oauthError(res, 'too_many_requests', 'Too many requests. Try again later.', 429, {
    'Retry-After': String(retryAfterSeconds),
  })

/** 303 so a POSTed form never gets re-posted to the client's redirect URI */
export const seeOther = (res: MedusaResponse, location: string): void => {
  res.set({ ...noStoreHeaders, Location: location }).status(303).end()
}

/**
 * Medusa has already parsed the body as JSON or as a form, whichever the content type said.
 * OAuth specifies forms and some clients send JSON anyway; both arrive here as one shape.
 */
export const readParams = (req: MedusaRequest): URLSearchParams => {
  const params = new URLSearchParams()
  const body = req.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) return params
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (typeof value === 'string') params.set(key, value)
    else if (typeof value === 'number' || typeof value === 'boolean') params.set(key, String(value))
  }
  return params
}

/** Query parameters as single strings, with repeated ones reported so the caller can refuse them */
export const readQuery = (req: MedusaRequest): Record<string, string | string[] | undefined> => {
  const out: Record<string, string | string[] | undefined> = {}
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (typeof value === 'string') out[key] = value
    else if (Array.isArray(value)) out[key] = value.filter((entry): entry is string => typeof entry === 'string')
  }
  return out
}

/**
 * The consent form only accepts submissions that the browser marks as coming from this site.
 * The admin session cookie is SameSite=Lax already; this is the second lock on the same door.
 */
export const isSameOriginRequest = (req: MedusaRequest): boolean => {
  const origin = req.get('origin')
  if (origin && origin !== ISSUER) return false
  const site = req.get('sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none') return false
  return true
}

/**
 * A small fixed-window rate limiter. State lives in process memory, which fits the single
 * backend instance this template deploys and needs no Redis, so the trial template has it
 * too. Several replicas multiply the effective limit.
 */
type Bucket = { count: number; resetAt: number }
type Limit = { limit: number; windowMs: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10_000
let lastPrune = 0

const prune = (now: number) => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/** Keys are hashed, so a caller-chosen value such as an email cannot make one bucket large */
const bucketKey = (key: string) => createHash('sha256').update(key).digest('base64url')

export const checkRateLimit = (
  rawKey: string,
  { limit, windowMs }: Limit,
  now = Date.now()
): { allowed: boolean; retryAfterSeconds: number } => {
  if (now - lastPrune > 60_000) {
    prune(now)
    lastPrune = now
  }

  const key = bucketKey(rawKey)
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    // A flood of distinct keys must not grow memory without bound. Dropping the oldest buckets
    // (a Map iterates in insertion order) rather than all of them means a flood cannot be used
    // to wipe the counters of an attack in progress.
    if (!bucket && buckets.size >= MAX_BUCKETS) {
      for (const oldest of buckets.keys()) {
        buckets.delete(oldest)
        if (buckets.size < MAX_BUCKETS * 0.9) break
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

/**
 * Takes back one counted attempt, for limits that only count failures: the attempt is counted
 * before the slow check runs, so parallel attempts cannot all slip under the limit, and handed
 * back when it succeeds.
 */
export const refundRateLimit = (rawKey: string): void => {
  const bucket = buckets.get(bucketKey(rawKey))
  if (bucket && bucket.count > 0) bucket.count -= 1
}

/**
 * The caller's address. Medusa sets `trust proxy` to one hop, so `req.ip` is the address
 * Railway's proxy saw. The leftmost X-Forwarded-For entry would be whatever the caller wrote.
 */
export const getClientIP = (req: MedusaRequest): string => req.ip || req.socket?.remoteAddress || 'unknown'
