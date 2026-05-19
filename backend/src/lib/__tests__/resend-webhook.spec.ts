jest.mock("../constants", () => ({
  RESEND_WEBHOOK_SECRET: undefined,
}))

import { createHmac } from "node:crypto"

import { verifyResendWebhook } from "../resend-webhook"

const FIXED_NOW = 1_750_000_000

const buildEntry = ({
  id,
  ts,
  body,
  secret,
}: {
  id: string
  ts: number
  body: string
  secret: string
}): string => {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64")
  const sig = createHmac("sha256", key)
    .update(`${id}.${ts}.${body}`)
    .digest("base64")
  return `v1,${sig}`
}

describe("verifyResendWebhook", () => {
  // Synthetic test secret — computed at runtime so the literal doesn't trip
  // GitHub's secret scanner (Resend reuses Stripe's `whsec_` prefix).
  const SECRET = `whsec_${Buffer.from("test-secret-resend-12345678901234").toString("base64")}`

  it("accepts a freshly-signed payload", () => {
    const id = "msg_abc"
    const ts = FIXED_NOW
    const body = '{"type":"email.opened","data":{"to":"x@y.z"}}'
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: buildEntry({ id, ts, body, secret: SECRET }),
      rawBody: body,
      secret: SECRET,
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.id).toBe(id)
  })

  it("rejects when headers are missing", () => {
    expect(
      verifyResendWebhook({
        id: undefined,
        timestamp: "1",
        signatureHeader: "v1,xxx",
        rawBody: "",
        secret: SECRET,
        now: FIXED_NOW,
      }).ok
    ).toBe(false)
    expect(
      verifyResendWebhook({
        id: "msg",
        timestamp: undefined,
        signatureHeader: "v1,xxx",
        rawBody: "",
        secret: SECRET,
        now: FIXED_NOW,
      }).ok
    ).toBe(false)
    expect(
      verifyResendWebhook({
        id: "msg",
        timestamp: "1",
        signatureHeader: undefined,
        rawBody: "",
        secret: SECRET,
        now: FIXED_NOW,
      }).ok
    ).toBe(false)
  })

  it("rejects when secret is unset", () => {
    const id = "msg"
    const ts = FIXED_NOW
    const body = "{}"
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: buildEntry({ id, ts, body, secret: SECRET }),
      rawBody: body,
      secret: "",
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("no_secret_configured")
  })

  it("rejects stale timestamps outside tolerance", () => {
    const id = "msg"
    const ts = FIXED_NOW - 10 * 60 // 10 minutes ago
    const body = "{}"
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: buildEntry({ id, ts, body, secret: SECRET }),
      rawBody: body,
      secret: SECRET,
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("stale")
  })

  it("rejects a tampered signature", () => {
    const id = "msg"
    const ts = FIXED_NOW
    const body = "{}"
    const real = buildEntry({ id, ts, body, secret: SECRET })
    const tampered = real.slice(0, -2) + "AA"
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: tampered,
      rawBody: body,
      secret: SECRET,
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(false)
  })

  it("rejects a signature computed for a different body", () => {
    const id = "msg"
    const ts = FIXED_NOW
    const sigForA = buildEntry({ id, ts, body: "{}", secret: SECRET })
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: sigForA,
      rawBody: '{"x":1}', // different body
      secret: SECRET,
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(false)
  })

  it("accepts when ANY space-separated v1 signature matches (rotation)", () => {
    const id = "msg"
    const ts = FIXED_NOW
    const body = "{}"
    const real = buildEntry({ id, ts, body, secret: SECRET })
    const header = `v1,wrongsigwithsame_length== ${real}`
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: header,
      rawBody: body,
      secret: SECRET,
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(true)
  })

  it("ignores non-v1 signature versions", () => {
    const id = "msg"
    const ts = FIXED_NOW
    const body = "{}"
    const real = buildEntry({ id, ts, body, secret: SECRET })
    const result = verifyResendWebhook({
      id,
      timestamp: String(ts),
      signatureHeader: real.replace("v1,", "v2,"),
      rawBody: body,
      secret: SECRET,
      now: FIXED_NOW,
    })
    expect(result.ok).toBe(false)
  })
})
