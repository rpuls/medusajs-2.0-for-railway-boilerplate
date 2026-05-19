import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Force PostHog config OFF for these tests by mocking the constants
// module — verifies the null-PostHog fallback path doesn't throw.
jest.mock("../../../lib/constants", () => ({
  POSTHOG_HOST: undefined,
  POSTHOG_PERSONAL_API_KEY: undefined,
  POSTHOG_PROJECT_ID: undefined,
}))

import { buildCustomerJourney } from "../build"

type Row = Record<string, unknown>

const buildContainer = (rows: {
  customer?: Row | null
  orders?: Row[]
  designs?: Row[]
  tags?: Row[]
}) => {
  const query = {
    graph: jest.fn(async ({ entity }: { entity: string }) => {
      if (entity === "customer") return { data: rows.customer ? [rows.customer] : [] }
      if (entity === "order") return { data: rows.orders ?? [] }
      if (entity === "design") return { data: rows.designs ?? [] }
      if (entity === "customer_tag") return { data: rows.tags ?? [] }
      return { data: [] }
    }),
  }
  return {
    resolve: jest.fn((key: string) => {
      if (key === ContainerRegistrationKeys.QUERY) return query
      throw new Error(`unexpected resolve(${key})`)
    }),
  } as any
}

describe("buildCustomerJourney", () => {
  it("returns posthog_configured = false when env is unset (no throw)", async () => {
    const container = buildContainer({
      customer: { id: "c1", email: "x@y.z" },
      orders: [],
    })
    const result = await buildCustomerJourney(container, "c1")
    expect(result.posthog_configured).toBe(false)
    expect(result.events).toEqual([])
  })

  it("emits order events", async () => {
    const container = buildContainer({
      customer: { id: "c1", email: "x@y.z" },
      orders: [
        {
          id: "ord_1",
          display_id: 1001,
          created_at: "2026-05-01T10:00:00Z",
          total: 250,
          currency_code: "aud",
          metadata: {},
        },
      ],
    })
    const result = await buildCustomerJourney(container, "c1")
    expect(result.events.some((e) => e.source === "order")).toBe(true)
    expect(result.events[0].title).toContain("1001")
  })

  it("emits NPS event when order metadata has nps_recorded_at", async () => {
    const container = buildContainer({
      customer: { id: "c1", email: "x@y.z" },
      orders: [
        {
          id: "ord_1",
          display_id: 1001,
          created_at: "2026-05-01T10:00:00Z",
          total: 250,
          currency_code: "aud",
          metadata: {
            nps_recorded_at: "2026-05-03T12:00:00Z",
            nps_score: 5,
            nps_comment: "Great service",
          },
        },
      ],
    })
    const result = await buildCustomerJourney(container, "c1")
    const nps = result.events.find((e) => e.source === "nps")
    expect(nps).toBeDefined()
    expect(nps?.title).toContain("5")
    expect(nps?.detail).toContain("Great service")
  })

  it("returns empty events when customer doesn't exist", async () => {
    const container = buildContainer({ customer: null })
    const result = await buildCustomerJourney(container, "missing")
    expect(result.events).toEqual([])
  })

  it("sorts events newest-first", async () => {
    const container = buildContainer({
      customer: { id: "c1", email: "x@y.z" },
      orders: [
        {
          id: "ord_old",
          display_id: 100,
          created_at: "2026-01-01T10:00:00Z",
          total: 50,
          currency_code: "aud",
          metadata: {},
        },
        {
          id: "ord_new",
          display_id: 200,
          created_at: "2026-05-01T10:00:00Z",
          total: 75,
          currency_code: "aud",
          metadata: {},
        },
      ],
    })
    const result = await buildCustomerJourney(container, "c1")
    const dates = result.events.map((e) => e.at)
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : -1))
    expect(dates).toEqual(sorted)
  })

  it("respects the limit option (clamps to N events)", async () => {
    const orders = Array.from({ length: 50 }, (_, i) => ({
      id: `ord_${i}`,
      display_id: 1000 + i,
      created_at: `2026-05-${(i % 28) + 1}T10:00:00Z`,
      total: 10 + i,
      currency_code: "aud",
      metadata: {},
    }))
    const container = buildContainer({
      customer: { id: "c1", email: "x@y.z" },
      orders,
    })
    const result = await buildCustomerJourney(container, "c1", { limit: 5 })
    expect(result.events.length).toBeLessThanOrEqual(5)
  })
})
