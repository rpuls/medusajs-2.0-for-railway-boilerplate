import { recomputeScpCartPricingPure } from "../recompute-scp-cart-pricing"

// Standard SC Prints 5-tier ladder, varied by supplier cost.
// Variant A: lower-cost shirt
const VARIANT_A_TIERS = {
  bulk_pricing: {
    tiers: [
      { min_quantity: 1, max_quantity: 9, amount: 25 },
      { min_quantity: 10, max_quantity: 19, amount: 22.5 },
      { min_quantity: 20, max_quantity: 49, amount: 21.25 },
      { min_quantity: 50, max_quantity: 99, amount: 20 },
      { min_quantity: 100, amount: 18.75 },
    ],
  },
}

// Variant B: pricier garment with the same tier ranges, different amounts
const VARIANT_B_TIERS = {
  bulk_pricing: {
    tiers: [
      { min_quantity: 1, max_quantity: 9, amount: 40 },
      { min_quantity: 10, max_quantity: 19, amount: 36 },
      { min_quantity: 20, max_quantity: 49, amount: 34 },
      { min_quantity: 50, max_quantity: 99, amount: 32 },
      { min_quantity: 100, amount: 30 },
    ],
  },
}

// DTF gang sheet — opted out of aggregation
const DTF_VARIANT_META = {
  bulk_pricing: VARIANT_A_TIERS.bulk_pricing,
  exclude_from_bulk_aggregation: true,
}

// Customizer line metadata with SCP print pricing block
const customizerLineMeta = (sideKey: string, printSizeId = "up_to_a6") => ({
  customizerDesign: {
    artifacts: [{ side: sideKey, print_size_id: printSizeId }],
    pricing: {
      server: {
        mode: "scp_dtf",
        version: 1,
        print_size_id: printSizeId,
        tier_index: 0,
        decorated_sides: 1,
        decorated_side_keys: [sideKey],
      },
    },
  },
})

describe("recomputeScpCartPricingPure", () => {
  it("aggregates two same-product lines into the higher tier", () => {
    const lines = [
      {
        id: "line_A1",
        quantity: 20,
        unit_price: 25,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {},
      },
      {
        id: "line_A2",
        quantity: 30,
        unit_price: 25,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {},
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    expect(result.aggregated_quantity).toBe(50)
    // Both lines should now get the 50-99 tier price: $20 each
    expect(result.prices.get("line_A1")).toBe(20)
    expect(result.prices.get("line_A2")).toBe(20)
    expect(result.excluded_line_ids).toEqual([])
  })

  it("aggregates cross-supplier lines (different per-tier amounts, same ranges)", () => {
    const lines = [
      {
        id: "line_A",
        quantity: 20,
        unit_price: 25,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {},
      },
      {
        id: "line_B",
        quantity: 30,
        unit_price: 40,
        variant: { id: "var_B", metadata: VARIANT_B_TIERS },
        metadata: {},
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    expect(result.aggregated_quantity).toBe(50)
    // Each variant gets its OWN 50-99 amount
    expect(result.prices.get("line_A")).toBe(20)
    expect(result.prices.get("line_B")).toBe(32)
  })

  it("excludes opted-out variants from aggregation total", () => {
    const lines = [
      {
        id: "line_shirts",
        quantity: 45,
        unit_price: 22.5,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {},
      },
      {
        id: "line_dtf",
        quantity: 5,
        unit_price: 50,
        variant: { id: "var_dtf", metadata: DTF_VARIANT_META },
        metadata: {},
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    // Shirts aggregate to 45 (DTF excluded), so 20-49 tier = $21.25
    expect(result.aggregated_quantity).toBe(45)
    expect(result.prices.get("line_shirts")).toBe(21.25)
    expect(result.prices.has("line_dtf")).toBe(false)
    expect(result.excluded_line_ids).toEqual(["line_dtf"])
  })

  it("handles the 100+ ceiling tier", () => {
    const lines = [
      {
        id: "line_huge",
        quantity: 250,
        unit_price: 25,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {},
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    expect(result.aggregated_quantity).toBe(250)
    expect(result.prices.get("line_huge")).toBe(18.75)
  })

  it("returns no-op when no eligible lines exist", () => {
    const lines = [
      {
        id: "line_vectorization",
        quantity: 1,
        unit_price: 15,
        variant: { id: "var_vec", metadata: {} }, // no bulk_pricing tiers
        metadata: {},
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    expect(result.prices.size).toBe(0)
    expect(result.excluded_line_ids).toEqual(["line_vectorization"])
  })

  it("re-prices customizer lines with the aggregated SCP print tier", () => {
    // 20 + 30 customizer lines: aggregated qty 50 → tier index 3.
    // up_to_a6 tier 3 = 5.5 per print. Each line has 1 print.
    // Variant A 50-99 tier = $20 garment.
    // Expected unit_price = 20 + 5.5 = 25.5
    const lines = [
      {
        id: "line_cust_A",
        quantity: 20,
        unit_price: 999, // stale
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: customizerLineMeta("front"),
      },
      {
        id: "line_cust_B",
        quantity: 30,
        unit_price: 999, // stale
        variant: { id: "var_B", metadata: VARIANT_B_TIERS },
        metadata: customizerLineMeta("back"),
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    expect(result.aggregated_quantity).toBe(50)
    // A: 20 (garment 50-99) + 5.5 (a6 tier3) = 25.5
    expect(result.prices.get("line_cust_A")).toBe(25.5)
    // B: 32 (garment 50-99) + 5.5 = 37.5
    expect(result.prices.get("line_cust_B")).toBe(37.5)
  })

  it("treats zero-quantity lines safely", () => {
    const lines = [
      {
        id: "line_zero",
        quantity: 0,
        unit_price: 25,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {},
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    // aggregated = 0 but the lookup clamps to qty >= 1, so still tier 1-9
    expect(result.aggregated_quantity).toBe(0)
    expect(result.prices.get("line_zero")).toBe(25)
  })

  it("blends plain and customizer lines: plain garments get garment-only aggregated tier", () => {
    const lines = [
      {
        id: "line_plain",
        quantity: 30,
        unit_price: 25,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: {}, // No customizerDesign — plain PDP add
      },
      {
        id: "line_cust",
        quantity: 20,
        unit_price: 999,
        variant: { id: "var_A", metadata: VARIANT_A_TIERS },
        metadata: customizerLineMeta("front"),
      },
    ]
    const result = recomputeScpCartPricingPure(lines)
    expect(result.aggregated_quantity).toBe(50)
    // Plain garment: just 50-99 garment tier = $20, no print
    expect(result.prices.get("line_plain")).toBe(20)
    // Customizer: 20 + 5.5 print = 25.5
    expect(result.prices.get("line_cust")).toBe(25.5)
  })
})
