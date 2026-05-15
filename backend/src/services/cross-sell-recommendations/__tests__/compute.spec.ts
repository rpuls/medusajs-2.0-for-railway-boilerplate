import { computeCrossSellRecommendations } from "../compute"

describe("computeCrossSellRecommendations", () => {
  test("returns empty when there are no facts", () => {
    expect(computeCrossSellRecommendations([])).toEqual([])
    expect(computeCrossSellRecommendations(null)).toEqual([])
  })

  test("ignores singleton orders (no co-purchase signal)", () => {
    const result = computeCrossSellRecommendations([
      { order_id: "o1", product_id: "A" },
      { order_id: "o2", product_id: "B" },
      { order_id: "o3", product_id: "C" },
    ])
    expect(result).toEqual([])
  })

  test("requires at least minCoOccurrence (default 2) before recommending", () => {
    // A and B together in one order — below default threshold.
    const result = computeCrossSellRecommendations([
      { order_id: "o1", product_id: "A" },
      { order_id: "o1", product_id: "B" },
    ])
    expect(result).toEqual([])
  })

  test("recommends mutually when pair appears in ≥ 2 orders", () => {
    const result = computeCrossSellRecommendations([
      { order_id: "o1", product_id: "A" },
      { order_id: "o1", product_id: "B" },
      { order_id: "o2", product_id: "A" },
      { order_id: "o2", product_id: "B" },
    ])
    expect(result).toHaveLength(2)
    const a = result.find((r) => r.product_id === "A")
    const b = result.find((r) => r.product_id === "B")
    expect(a?.recommended_product_ids).toEqual(["B"])
    expect(b?.recommended_product_ids).toEqual(["A"])
    expect(a?.co_occurrence_counts).toEqual([2])
  })

  test("orders recommendations by co-occurrence count desc", () => {
    // A appears with B 3 times, with C twice, with D once (filtered).
    const result = computeCrossSellRecommendations([
      { order_id: "o1", product_id: "A" },
      { order_id: "o1", product_id: "B" },
      { order_id: "o2", product_id: "A" },
      { order_id: "o2", product_id: "B" },
      { order_id: "o3", product_id: "A" },
      { order_id: "o3", product_id: "B" },
      { order_id: "o4", product_id: "A" },
      { order_id: "o4", product_id: "C" },
      { order_id: "o5", product_id: "A" },
      { order_id: "o5", product_id: "C" },
      { order_id: "o6", product_id: "A" },
      { order_id: "o6", product_id: "D" },
    ])
    const a = result.find((r) => r.product_id === "A")
    // D pair count = 1 (filtered). B = 3, C = 2.
    expect(a?.recommended_product_ids).toEqual(["B", "C"])
    expect(a?.co_occurrence_counts).toEqual([3, 2])
  })

  test("dedupes products within the same order so qty>1 doesn't inflate", () => {
    // o1 contains A twice and B once — should count as one A+B pair.
    const result = computeCrossSellRecommendations(
      [
        { order_id: "o1", product_id: "A" },
        { order_id: "o1", product_id: "A" },
        { order_id: "o1", product_id: "B" },
        { order_id: "o2", product_id: "A" },
        { order_id: "o2", product_id: "B" },
      ],
      { minCoOccurrence: 2 }
    )
    const a = result.find((r) => r.product_id === "A")
    expect(a?.co_occurrence_counts).toEqual([2])
  })

  test("caps recommendations to topK", () => {
    const facts: { order_id: string; product_id: string }[] = []
    // 5 products co-purchased with A in 2 orders each → all would qualify.
    const partners = ["B", "C", "D", "E", "F"]
    let orderCounter = 0
    for (const partner of partners) {
      for (let i = 0; i < 2; i++) {
        const oid = `o${++orderCounter}`
        facts.push({ order_id: oid, product_id: "A" })
        facts.push({ order_id: oid, product_id: partner })
      }
    }
    const result = computeCrossSellRecommendations(facts, { topK: 3 })
    const a = result.find((r) => r.product_id === "A")
    expect(a?.recommended_product_ids).toHaveLength(3)
  })

  test("deterministic tiebreak when counts tie", () => {
    // B, C, D each co-occur with A exactly twice. Sorted alphabetically.
    const result = computeCrossSellRecommendations(
      [
        { order_id: "o1", product_id: "A" },
        { order_id: "o1", product_id: "B" },
        { order_id: "o2", product_id: "A" },
        { order_id: "o2", product_id: "B" },
        { order_id: "o3", product_id: "A" },
        { order_id: "o3", product_id: "C" },
        { order_id: "o4", product_id: "A" },
        { order_id: "o4", product_id: "C" },
        { order_id: "o5", product_id: "A" },
        { order_id: "o5", product_id: "D" },
        { order_id: "o6", product_id: "A" },
        { order_id: "o6", product_id: "D" },
      ],
      { topK: 5 }
    )
    const a = result.find((r) => r.product_id === "A")
    expect(a?.recommended_product_ids).toEqual(["B", "C", "D"])
  })
})
