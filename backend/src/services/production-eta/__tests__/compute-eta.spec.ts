import {
  computeProductionEta,
  DEFAULT_PRODUCTION_ETA_CONFIG,
} from "../compute-eta"

describe("computeProductionEta", () => {
  test("empty queue returns the floor (baseline) ETA", () => {
    const result = computeProductionEta({})
    expect(result.low_days).toBe(
      Math.max(
        DEFAULT_PRODUCTION_ETA_CONFIG.minimum_eta_days,
        Object.values(DEFAULT_PRODUCTION_ETA_CONFIG.baseline_days_per_stage).reduce(
          (a, b) => a + b,
          0
        )
      )
    )
    expect(result.high_days).toBeGreaterThanOrEqual(
      result.low_days + DEFAULT_PRODUCTION_ETA_CONFIG.minimum_range_days
    )
    expect(result.congested_stages).toEqual([])
  })

  test("queue depth increases the high_days", () => {
    const calm = computeProductionEta({ in_production: 0 })
    const busy = computeProductionEta({ in_production: 30 })
    expect(busy.high_days).toBeGreaterThan(calm.high_days)
    expect(busy.congested_stages).toContain("in_production")
  })

  test("respects minimum_eta_days even with zero queue + tiny baseline", () => {
    const result = computeProductionEta(
      {},
      {
        ...DEFAULT_PRODUCTION_ETA_CONFIG,
        baseline_days_per_stage: {
          received: 0,
          art_review: 0,
          awaiting_approval: 0,
          approved: 0,
          blanks_ordered: 0,
          blanks_arrived: 0,
          in_production: 0,
          quality_check: 0,
        },
      }
    )
    expect(result.low_days).toBe(DEFAULT_PRODUCTION_ETA_CONFIG.minimum_eta_days)
  })

  test("congestion multiplier kicks in above 5 queue-days", () => {
    const config = { ...DEFAULT_PRODUCTION_ETA_CONFIG }
    const moderate = computeProductionEta({ in_production: 24 }, config) // ~3 queue days
    const heavy = computeProductionEta({ in_production: 48 }, config) // ~6 queue days, congested
    expect(heavy.high_days).toBeGreaterThan(moderate.high_days * 1.2)
  })

  test("flags every stage that exceeds 1.5x daily throughput", () => {
    const result = computeProductionEta({
      art_review: 20, // throughput 10 -> 2x
      in_production: 50, // throughput 8 -> 6.25x
    })
    expect(result.congested_stages).toEqual(
      expect.arrayContaining(["art_review", "in_production"])
    )
  })

  test("minimum_range_days enforced even when queue is empty", () => {
    const result = computeProductionEta({})
    expect(result.high_days - result.low_days).toBeGreaterThanOrEqual(
      DEFAULT_PRODUCTION_ETA_CONFIG.minimum_range_days
    )
  })
})
