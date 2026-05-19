// Mock constants so importing unsubscribe-token doesn't fail on the
// constants module's assertValue(DATABASE_URL) check.
jest.mock("../constants", () => ({
  UNSUBSCRIBE_LINK_SECRET: "test-unsubscribe-secret",
  MARKETING_PREFERENCE_CENTER_URL: undefined,
}))

import {
  buildUnsubscribeQuery,
  signUnsubscribe,
  verifyUnsubscribe,
} from "../unsubscribe-token"

describe("unsubscribe-token", () => {
  it("verifies a freshly-signed token", () => {
    const sig = signUnsubscribe("alice@scprints.com.au", "winback")
    const result = verifyUnsubscribe({
      email: "alice@scprints.com.au",
      kind: "winback",
      sig,
    })
    expect(result.ok).toBe(true)
  })

  it("normalises email case before signing AND verifying", () => {
    const sig = signUnsubscribe("Alice@ScPrints.COM.AU", "winback")
    const result = verifyUnsubscribe({
      email: "alice@scprints.com.au",
      kind: "winback",
      sig,
    })
    expect(result.ok).toBe(true)
  })

  it("rejects a token with the wrong kind", () => {
    const sig = signUnsubscribe("a@b.c", "winback")
    const result = verifyUnsubscribe({
      email: "a@b.c",
      kind: "cart_reminder",
      sig,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("bad_sig")
  })

  it("rejects a token with the wrong email", () => {
    const sig = signUnsubscribe("a@b.c", "winback")
    const result = verifyUnsubscribe({
      email: "x@y.z",
      kind: "winback",
      sig,
    })
    expect(result.ok).toBe(false)
  })

  it("rejects a tampered signature", () => {
    const sig = signUnsubscribe("a@b.c", "winback")
    const tampered = sig.slice(0, -1) + (sig.slice(-1) === "0" ? "1" : "0")
    const result = verifyUnsubscribe({
      email: "a@b.c",
      kind: "winback",
      sig: tampered,
    })
    expect(result.ok).toBe(false)
  })

  it("rejects missing fields", () => {
    expect(verifyUnsubscribe({ email: "", kind: "winback", sig: "abc" }).ok).toBe(
      false
    )
    expect(verifyUnsubscribe({ email: "a@b.c", kind: "", sig: "abc" }).ok).toBe(
      false
    )
    expect(verifyUnsubscribe({ email: "a@b.c", kind: "winback", sig: "" }).ok).toBe(
      false
    )
  })

  it("builds a URL-safe query string", () => {
    const q = buildUnsubscribeQuery("a+test@b.c", "winback")
    expect(q).toMatch(/^email=a%2Btest%40b\.c&kind=winback&sig=[0-9a-f]{16}$/)
  })

  it("uses the literal 'all' as the kind for global unsubscribe", () => {
    const sig = signUnsubscribe("a@b.c", "all")
    const result = verifyUnsubscribe({ email: "a@b.c", kind: "all", sig })
    expect(result.ok).toBe(true)
  })
})
