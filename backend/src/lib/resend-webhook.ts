import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Resend uses Svix for webhook signing.
 *
 * Required headers on each delivery:
 *   - `svix-id` — unique event identifier (idempotency key)
 *   - `svix-timestamp` — Unix seconds when the event was sent
 *   - `svix-signature` — one or more space-separated `vN,<base64>`
 *     entries. Currently only `v1`.
 *
 * Signature payload: `${svix-id}.${svix-timestamp}.${rawBody}`
 * Algorithm: HMAC-SHA256 keyed by the **decoded** secret (the secret
 * shown in the dashboard is prefixed with `whsec_` followed by
 * base64-encoded random bytes — strip the prefix, base64-decode the
 * rest to get the actual key).
 * Output: base64 of the digest.
 *
 * Tolerance window: 5 minutes by default. Reject deliveries older
 * than that to make replay attacks harder.
 */

export type ResendWebhookVerifyInput = {
  id: string | undefined | null
  timestamp: string | undefined | null
  signatureHeader: string | undefined | null
  rawBody: string
  secret: string
  toleranceSeconds?: number
  now?: number // override for tests
}

export type ResendWebhookVerifyResult =
  | { ok: true; id: string; event_type?: string }
  | { ok: false; reason: string }

const decodeSecret = (raw: string): Buffer => {
  const trimmed = raw.trim()
  const stripped = trimmed.startsWith("whsec_")
    ? trimmed.slice("whsec_".length)
    : trimmed
  // base64 decode. If the input wasn't base64 we fall back to UTF-8
  // bytes — Resend's whsec_-prefixed values are always base64 but a
  // dev placeholder might be a plain string.
  try {
    const buf = Buffer.from(stripped, "base64")
    // Round-trip check — if it round-trips back to the same string we
    // were given a valid base64 secret.
    if (buf.toString("base64").replace(/=+$/, "") === stripped.replace(/=+$/, "")) {
      return buf
    }
  } catch {
    /* fall through */
  }
  return Buffer.from(stripped, "utf8")
}

export function verifyResendWebhook(
  input: ResendWebhookVerifyInput
): ResendWebhookVerifyResult {
  const { id, timestamp, signatureHeader, rawBody, secret } = input
  const tolerance = input.toleranceSeconds ?? 5 * 60
  const now = input.now ?? Math.floor(Date.now() / 1000)

  if (!id || !timestamp || !signatureHeader) {
    return { ok: false, reason: "missing_headers" }
  }
  if (!secret) {
    return { ok: false, reason: "no_secret_configured" }
  }

  const ts = Number.parseInt(timestamp, 10)
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: "bad_timestamp" }
  }
  if (Math.abs(now - ts) > tolerance) {
    return { ok: false, reason: "stale" }
  }

  const key = decodeSecret(secret)
  const payload = `${id}.${timestamp}.${rawBody}`
  const expected = createHmac("sha256", key).update(payload).digest("base64")

  // svix-signature can carry multiple "v1,sig" entries separated by
  // spaces (rotation support). Match against ANY.
  const entries = signatureHeader.split(" ").map((s) => s.trim()).filter(Boolean)
  for (const entry of entries) {
    const [version, sig] = entry.split(",", 2)
    if (version !== "v1" || !sig) continue
    if (sig.length !== expected.length) continue
    try {
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return { ok: true, id }
      }
    } catch {
      /* loop to next signature */
    }
  }

  return { ok: false, reason: "bad_signature" }
}
