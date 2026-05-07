import {
  CUSTOMER_MILESTONES,
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_LABEL,
  STAGES_THAT_EMAIL,
  customerMilestoneForStage,
  isProductionStage,
  type ProductionStage,
} from "../production-stage"

describe("production-stage constants", () => {
  it("labels every stage in the canonical list", () => {
    for (const stage of PRODUCTION_STAGES) {
      expect(PRODUCTION_STAGE_LABEL[stage]).toBeTruthy()
    }
  })

  it("maps every stage to a customer-facing milestone", () => {
    for (const stage of PRODUCTION_STAGES) {
      const milestone = customerMilestoneForStage(stage)
      expect(CUSTOMER_MILESTONES).toContain(milestone)
    }
  })

  it("flags the agreed milestones as email-triggering", () => {
    expect(STAGES_THAT_EMAIL.has("awaiting_approval")).toBe(true)
    expect(STAGES_THAT_EMAIL.has("in_production")).toBe(true)
  })

  it("does not double-email shipped (Medusa core handles that)", () => {
    expect(STAGES_THAT_EMAIL.has("shipped")).toBe(false)
  })

  it("only emails milestones inside the canonical stage list", () => {
    for (const stage of STAGES_THAT_EMAIL) {
      expect(PRODUCTION_STAGES).toContain(stage)
    }
  })
})

describe("customerMilestoneForStage", () => {
  it("collapses internal artwork stages into the 'artwork' milestone", () => {
    const artworkStages: ProductionStage[] = ["art_review", "awaiting_approval", "approved"]
    for (const stage of artworkStages) {
      expect(customerMilestoneForStage(stage)).toBe("artwork")
    }
  })

  it("collapses internal production stages into the 'production' milestone", () => {
    const productionStages: ProductionStage[] = [
      "blanks_ordered",
      "blanks_arrived",
      "in_production",
      "quality_check",
    ]
    for (const stage of productionStages) {
      expect(customerMilestoneForStage(stage)).toBe("production")
    }
  })

  it("preserves shipped + delivered as their own milestones", () => {
    expect(customerMilestoneForStage("shipped")).toBe("shipped")
    expect(customerMilestoneForStage("delivered")).toBe("delivered")
  })
})

describe("isProductionStage", () => {
  it("accepts every canonical stage", () => {
    for (const stage of PRODUCTION_STAGES) {
      expect(isProductionStage(stage)).toBe(true)
    }
  })

  it("rejects invalid strings, junk, and non-strings", () => {
    expect(isProductionStage("not_a_stage")).toBe(false)
    expect(isProductionStage("")).toBe(false)
    expect(isProductionStage(undefined)).toBe(false)
    expect(isProductionStage(null)).toBe(false)
    expect(isProductionStage(42)).toBe(false)
    expect(isProductionStage({})).toBe(false)
  })
})
