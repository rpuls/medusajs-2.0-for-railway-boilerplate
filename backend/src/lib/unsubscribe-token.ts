import { createHmac, timingSafeEqual } from "node:crypto"

import { UNSUBSCRIBE_LINK_SECRET } from "./constants"

/**
 * Signed one-click unsubscribe URL parameter.
 *
 * The unsubscribe link in marketing emails has the shape:
 *   {backend}/email/unsubscribe?email=<lowered>&kind=<template_kind|all>&sig=<hex16>
 *
 * The signature is HMAC-SHA256 over `${email}:${kind}` keyed by
 * `UNSUBSCRIBE_LINK_SECRET`, truncated to 16 hex chars. Same pattern
 * as `nps-requests/sign.ts`; cryptographic-strength is overkill for
 * unsubscribe — we just need to deter trivial tampering.
 */

export type SignedUnsubscribe = {
  email: string
  kind: string // template kind, or the literal "all"
  sig: string
}

const sign = (email: string, kind: string): string => {
  const h = createHmac("sha256", UNSUBSCRIBE_LINK_SECRET)
  h.update(`${email}:${kind}`)
  return h.digest("hex").slice(0, 16)
}

export function signUnsubscribe(email: string, kind: string): string {
  return sign(String(email).trim().toLowerCase(), kind)
}

export function buildUnsubscribeQuery(
  email: string,
  kind: string
): string {
  const lowered = String(email).trim().toLowerCase()
  const sig = sign(lowered, kind)
  return `email=${encodeURIComponent(lowered)}&kind=${encodeURIComponent(kind)}&sig=${sig}`
}

export function verifyUnsubscribe(
  input: SignedUnsubscribe
): { ok: true; email: string; kind: string } | { ok: false; reason: string } {
  if (!input?.email || !input?.kind || !input?.sig) {
    return { ok: false, reason: "missing_params" }
  }
  const lowered = String(input.email).trim().toLowerCase()
  const kind = String(input.kind).trim()
  if (lowered.length === 0 || kind.length === 0) {
    return { ok: false, reason: "empty_params" }
  }
  const expected = sign(lowered, kind)
  if (expected.length !== input.sig.length) {
    return { ok: false, reason: "bad_sig" }
  }
  try {
    const ok = timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(input.sig)
    )
    return ok
      ? { ok: true, email: lowered, kind }
      : { ok: false, reason: "bad_sig" }
  } catch {
    return { ok: false, reason: "bad_sig" }
  }
}
