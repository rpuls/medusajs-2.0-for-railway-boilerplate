import { computeCustomerLtv } from "../compute-ltv"

describe("computeCustomerLtv", () => {
  const now = new Date("2026-05-15T00:00:00Z")

  test("returns zeros when there are no orders", () => {
    const result = computeCustomerLtv([], { now })
    expect(result.lifetime_value).toBe(0)
    expect(result.order_count).toBe(0)
    expect(result.average_order_value).toBe(0)
    expect(result.last_order_at).toBeNull()
    expect(result.first_order_at).toBeNull()
    expect(result.days_since_last).toBeNull()
    expect(result.currency_code).toBeNull()
  })

  test("returns zeros when the only orders are cancelled", () => {
    const result = computeCustomerLtv(
      [
        {
          total: 200,
          currency_code: "aud",
          status: "canceled",
          created_at: "2026-04-01T00:00:00Z",
        },
      ],
      { now }
    )
    expect(result.order_count).toBe(0)
    expect(result.lifetime_value).toBe(0)
  })

  test("aggregates a single non-cancelled order", () => {
    const result = computeCustomerLtv(
      [
        {
          total: 250,
          currency_code: "aud",
          status: "completed",
          created_at: "2026-05-01T00:00:00Z",
        },
      ],
      { now }
    )
    expect(result.lifetime_value).toBe(250)
    expect(result.order_count).toBe(1)
    expect(result.average_order_value).toBe(250)
    expect(result.currency_code).toBe("aud")
    expect(result.days_since_last).toBe(14)
    expect(result.first_order_at).toBe(result.last_order_at)
  })

  test("excludes cancelled orders from the sum", () => {
    const result = computeCustomerLtv(
      [
        {
          total: 100,
          currency_code: "aud",
          status: "completed",
          created_at: "2026-01-01T00:00:00Z",
        },
        {
          total: 9999,
          currency_code: "aud",
          status: "canceled",
          created_at: "2026-02-01T00:00:00Z",
        },
        {
          total: 200,
          currency_code: "aud",
          status: "completed",
          created_at: "2026-03-01T00:00:00Z",
        },
      ],
      { now }
    )
    expect(result.lifetime_value).toBe(300)
    expect(result.order_count).toBe(2)
    expect(result.average_order_value).toBe(150)
  })

  test("picks newest and oldest timestamps correctly", () => {
    const result = computeCustomerLtv(
      [
        { total: 100, currency_code: "aud", created_at: "2025-12-15T00:00:00Z" },
        { total: 100, currency_code: "aud", created_at: "2026-02-15T00:00:00Z" },
        { total: 100, currency_code: "aud", created_at: "2026-01-15T00:00:00Z" },
      ],
      { now }
    )
    expect(result.first_order_at).toBe("2025-12-15T00:00:00.000Z")
    expect(result.last_order_at).toBe("2026-02-15T00:00:00.000Z")
    expect(result.days_since_last).toBe(89)
  })

  test("trusts the dominant currency and flags the truncation", () => {
    const result = computeCustomerLtv(
      [
        { total: 100, currency_code: "aud", created_at: "2026-01-01T00:00:00Z" },
        { total: 100, currency_code: "aud", created_at: "2026-02-01T00:00:00Z" },
        { total: 9999, currency_code: "usd", created_at: "2026-03-01T00:00:00Z" },
      ],
      { now }
    )
    expect(result.currency_code).toBe("aud")
    expect(result.lifetime_value).toBe(200)
    expect(result.order_count).toBe(2)
    expect(result.mixed_currency_truncated).toBe(true)
  })

  test("tolerates string totals (Medusa serialises money this way)", () => {
    const result = computeCustomerLtv(
      [
        { total: "150.50", currency_code: "aud", created_at: "2026-05-01T00:00:00Z" },
        { total: "49.50", currency_code: "aud", created_at: "2026-05-02T00:00:00Z" },
      ],
      { now }
    )
    expect(result.lifetime_value).toBe(200)
    expect(result.order_count).toBe(2)
  })

  test("unwraps Medusa BigNumber totals (`{ numeric, raw: { value } }`)", () => {
    const result = computeCustomerLtv(
      [
        {
          total: { numeric: 267.85, raw: { value: "267.85" } } as any,
          currency_code: "aud",
          created_at: "2026-05-01T00:00:00Z",
        },
        {
          total: { numeric: 478.28, raw: { value: "478.28" } } as any,
          currency_code: "aud",
          created_at: "2026-05-02T00:00:00Z",
        },
      ],
      { now }
    )
    expect(result.lifetime_value).toBeCloseTo(746.13, 2)
    expect(result.order_count).toBe(2)
    expect(result.currency_code).toBe("aud")
  })

  test("unwraps the simpler `{ value: string }` BigNumber shape", () => {
    const result = computeCustomerLtv(
      [
        {
          total: { value: "100.00" } as any,
          currency_code: "aud",
          created_at: "2026-05-01T00:00:00Z",
        },
        {
          total: { value: "200.00" } as any,
          currency_code: "aud",
          created_at: "2026-05-02T00:00:00Z",
        },
      ],
      { now }
    )
    expect(result.lifetime_value).toBe(300)
    expect(result.order_count).toBe(2)
  })

  test("days_since_last is clamped to >= 0 even if last_order_at is in the future", () => {
    const result = computeCustomerLtv(
      [
        {
          total: 100,
          currency_code: "aud",
          created_at: "2027-01-01T00:00:00Z",
        },
      ],
      { now }
    )
    expect(result.days_since_last).toBe(0)
  })
})
