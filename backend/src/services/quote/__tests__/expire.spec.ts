import { selectExpiredQuotes } from "../expire"

const now = new Date("2026-05-19T12:00:00Z")

describe("selectExpiredQuotes", () => {
  it("returns IDs of quoted-status rows with expires_at in the past", () => {
    const rows = [
      { id: "qt_1", status: "quoted", expires_at: new Date("2026-05-18T12:00:00Z") },
      { id: "qt_2", status: "quoted", expires_at: new Date("2026-05-20T12:00:00Z") },
    ]
    expect(selectExpiredQuotes(rows, now)).toEqual(["qt_1"])
  })

  it("ignores quotes in non-quoted statuses (new, accepted, lost, expired stay put)", () => {
    const past = new Date("2026-05-18T12:00:00Z")
    const rows = [
      { id: "qt_new", status: "new", expires_at: past },
      { id: "qt_accepted", status: "accepted", expires_at: past },
      { id: "qt_lost", status: "lost", expires_at: past },
      { id: "qt_expired", status: "expired", expires_at: past },
      { id: "qt_quoted", status: "quoted", expires_at: past },
    ]
    expect(selectExpiredQuotes(rows, now)).toEqual(["qt_quoted"])
  })

  it("skips rows without expires_at", () => {
    const rows = [
      { id: "qt_1", status: "quoted", expires_at: null },
      { id: "qt_2", status: "quoted", expires_at: new Date("2026-05-18T12:00:00Z") },
    ]
    expect(selectExpiredQuotes(rows, now)).toEqual(["qt_2"])
  })

  it("treats expires_at exactly equal to now as not-yet-expired (>=, not >)", () => {
    const rows = [
      { id: "qt_eq", status: "quoted", expires_at: now },
    ]
    expect(selectExpiredQuotes(rows, now)).toEqual([])
  })

  it("accepts ISO string expires_at as well as Date", () => {
    const rows = [
      { id: "qt_iso", status: "quoted", expires_at: "2026-05-18T12:00:00Z" },
    ]
    expect(selectExpiredQuotes(rows, now)).toEqual(["qt_iso"])
  })

  it("ignores malformed expires_at strings", () => {
    const rows = [
      { id: "qt_bad", status: "quoted", expires_at: "not-a-date" },
      { id: "qt_good", status: "quoted", expires_at: "2026-05-18T12:00:00Z" },
    ]
    expect(selectExpiredQuotes(rows, now)).toEqual(["qt_good"])
  })

  it("handles empty input", () => {
    expect(selectExpiredQuotes([], now)).toEqual([])
  })

  it("uses Date.now() when no `now` is supplied", () => {
    const yesterday = new Date(Date.now() - 86400000)
    const tomorrow = new Date(Date.now() + 86400000)
    const result = selectExpiredQuotes([
      { id: "past", status: "quoted", expires_at: yesterday },
      { id: "future", status: "quoted", expires_at: tomorrow },
    ])
    expect(result).toEqual(["past"])
  })
})
