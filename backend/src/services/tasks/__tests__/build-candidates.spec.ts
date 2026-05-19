import {
  ACTIVE_STATUSES,
  isDueToday,
  isOverdue,
  isReadyForOverdueNotification,
  selectOverdueForNotification,
} from "../build-candidates"

const now = new Date("2026-05-19T14:00:00Z")

const mk = (overrides: Partial<{
  id: string
  assignee_user_id: string
  status: string
  due_at: Date | string | null
  last_overdue_notified_at: Date | string | null
}> = {}) => ({
  id: "tsk_1",
  assignee_user_id: "user_alice",
  status: "open",
  due_at: null as Date | string | null,
  last_overdue_notified_at: null as Date | string | null,
  ...overrides,
})

describe("ACTIVE_STATUSES contract", () => {
  it("includes open and in_progress", () => {
    expect(ACTIVE_STATUSES.has("open")).toBe(true)
    expect(ACTIVE_STATUSES.has("in_progress")).toBe(true)
  })
  it("excludes done and cancelled", () => {
    expect(ACTIVE_STATUSES.has("done")).toBe(false)
    expect(ACTIVE_STATUSES.has("cancelled")).toBe(false)
  })
})

describe("isOverdue", () => {
  it("true when status is open and due_at is past", () => {
    expect(
      isOverdue(mk({ due_at: "2026-05-18T12:00:00Z" }), now)
    ).toBe(true)
  })
  it("false when status is done even if due_at is past", () => {
    expect(
      isOverdue(mk({ status: "done", due_at: "2026-05-18T12:00:00Z" }), now)
    ).toBe(false)
  })
  it("false when due_at is null", () => {
    expect(isOverdue(mk({ due_at: null }), now)).toBe(false)
  })
  it("false when due_at is in the future", () => {
    expect(
      isOverdue(mk({ due_at: "2026-05-20T12:00:00Z" }), now)
    ).toBe(false)
  })
  it("treats due_at == now as not-overdue", () => {
    expect(isOverdue(mk({ due_at: now.toISOString() }), now)).toBe(false)
  })
})

describe("isDueToday", () => {
  it("true when due_at falls on the current UTC day", () => {
    expect(
      isDueToday(mk({ due_at: "2026-05-19T08:00:00Z" }), now)
    ).toBe(true)
    expect(
      isDueToday(mk({ due_at: "2026-05-19T23:59:00Z" }), now)
    ).toBe(true)
  })
  it("false when due_at is yesterday", () => {
    expect(
      isDueToday(mk({ due_at: "2026-05-18T12:00:00Z" }), now)
    ).toBe(false)
  })
  it("false when due_at is tomorrow", () => {
    expect(
      isDueToday(mk({ due_at: "2026-05-20T01:00:00Z" }), now)
    ).toBe(false)
  })
})

describe("isReadyForOverdueNotification", () => {
  it("true when overdue and never-notified", () => {
    expect(
      isReadyForOverdueNotification(
        mk({ due_at: "2026-05-18T12:00:00Z", last_overdue_notified_at: null }),
        now
      )
    ).toBe(true)
  })
  it("false when overdue but recently notified (default 23h cooldown)", () => {
    expect(
      isReadyForOverdueNotification(
        mk({
          due_at: "2026-05-18T12:00:00Z",
          last_overdue_notified_at: "2026-05-19T05:00:00Z", // 9h ago
        }),
        now
      )
    ).toBe(false)
  })
  it("true when overdue and notified > 23h ago", () => {
    expect(
      isReadyForOverdueNotification(
        mk({
          due_at: "2026-05-18T12:00:00Z",
          last_overdue_notified_at: "2026-05-18T12:00:00Z", // 26h ago
        }),
        now
      )
    ).toBe(true)
  })
  it("false when not overdue at all", () => {
    expect(
      isReadyForOverdueNotification(
        mk({ due_at: "2026-05-20T12:00:00Z" }),
        now
      )
    ).toBe(false)
  })
})

describe("selectOverdueForNotification", () => {
  it("returns IDs of all ready-to-notify rows", () => {
    const rows = [
      mk({ id: "a", due_at: "2026-05-18T12:00:00Z" }),
      mk({ id: "b", due_at: "2026-05-18T12:00:00Z", last_overdue_notified_at: "2026-05-19T13:00:00Z" }), // 1h ago — skip
      mk({ id: "c", due_at: "2026-05-20T12:00:00Z" }), // future
      mk({ id: "d", status: "done", due_at: "2026-05-18T12:00:00Z" }), // closed
    ]
    expect(selectOverdueForNotification(rows, now)).toEqual(["a"])
  })
})
