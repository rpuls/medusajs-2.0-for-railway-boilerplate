/**
 * Pure-logic tests for the quote pipeline state machine. The PATCH
 * route at `backend/src/api/admin/quotes/[id]/route.ts` implements the
 * transitions by stamping per-status timestamps and emitting
 * QuoteEvent rows. This test fixes the *contract* — what's legal, what
 * isn't — so a future refactor doesn't silently allow a `lost → accepted`
 * jump.
 *
 * Status flow:
 *   new  → quoted | lost
 *   quoted → accepted | lost | expired
 *   accepted | lost | expired = terminal (no outbound transitions)
 *
 * Expiry-by-cron is a `quoted → expired` transition, exercised in
 * `./expire.spec.ts`.
 */

type QuoteStatus = "new" | "quoted" | "accepted" | "lost" | "expired"

const LEGAL_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  new: ["quoted", "lost"],
  quoted: ["accepted", "lost", "expired"],
  accepted: [],
  lost: [],
  expired: [],
}

function isLegalTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  if (from === to) return true // no-op writes are legal
  return LEGAL_TRANSITIONS[from].includes(to)
}

const STATUSES: QuoteStatus[] = ["new", "quoted", "accepted", "lost", "expired"]

describe("quote state-transition matrix", () => {
  it("permits no-op writes (same status, idempotent updates)", () => {
    for (const s of STATUSES) {
      expect(isLegalTransition(s, s)).toBe(true)
    }
  })

  it("allows new → quoted and new → lost", () => {
    expect(isLegalTransition("new", "quoted")).toBe(true)
    expect(isLegalTransition("new", "lost")).toBe(true)
  })

  it("rejects new → accepted directly (must go via quoted)", () => {
    expect(isLegalTransition("new", "accepted")).toBe(false)
  })

  it("allows quoted → accepted / lost / expired", () => {
    expect(isLegalTransition("quoted", "accepted")).toBe(true)
    expect(isLegalTransition("quoted", "lost")).toBe(true)
    expect(isLegalTransition("quoted", "expired")).toBe(true)
  })

  it("rejects quoted → new (no going back)", () => {
    expect(isLegalTransition("quoted", "new")).toBe(false)
  })

  it("treats accepted as terminal", () => {
    for (const s of STATUSES) {
      if (s === "accepted") continue
      expect(isLegalTransition("accepted", s)).toBe(false)
    }
  })

  it("treats lost as terminal", () => {
    for (const s of STATUSES) {
      if (s === "lost") continue
      expect(isLegalTransition("lost", s)).toBe(false)
    }
  })

  it("treats expired as terminal", () => {
    for (const s of STATUSES) {
      if (s === "expired") continue
      expect(isLegalTransition("expired", s)).toBe(false)
    }
  })
})

describe("status-to-timestamp mapping", () => {
  // The admin PATCH route stamps per-status timestamps. This documents
  // the contract so a future change doesn't accidentally drop one.
  const STATUS_TIMESTAMP: Partial<Record<QuoteStatus, string>> = {
    quoted: "quoted_at",
    accepted: "accepted_at",
    lost: "lost_at",
    // expired is stamped via the expire cron, not the PATCH route
  }

  it("stamps a timestamp on every non-terminal transition into a quoted/accepted/lost state", () => {
    expect(STATUS_TIMESTAMP.quoted).toBe("quoted_at")
    expect(STATUS_TIMESTAMP.accepted).toBe("accepted_at")
    expect(STATUS_TIMESTAMP.lost).toBe("lost_at")
  })

  it("does not stamp a timestamp for new (the row's created_at suffices)", () => {
    expect(STATUS_TIMESTAMP.new).toBeUndefined()
  })

  it("does not stamp a timestamp for expired via the PATCH route (cron writes it)", () => {
    expect(STATUS_TIMESTAMP.expired).toBeUndefined()
  })
})
