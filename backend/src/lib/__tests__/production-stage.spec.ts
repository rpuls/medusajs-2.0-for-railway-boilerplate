import {
  CUSTOMER_MILESTONES,
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_LABEL,
  STAGES_THAT_EMAIL,
  customerMilestoneForStage,
  isProductionStage,
  shouldEmailForStageTransition,
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

describe("shouldEmailForStageTransition", () => {
  it("emails on the agreed milestones for forward transitions", () => {
    expect(shouldEmailForStageTransition("art_review", "awaiting_approval")).toBe(true)
    expect(shouldEmailForStageTransition("approved", "in_production")).toBe(true)
    expect(shouldEmailForStageTransition(null, "awaiting_approval")).toBe(true)
    expect(shouldEmailForStageTransition(undefined, "in_production")).toBe(true)
  })

  it("never emails for stages outside STAGES_THAT_EMAIL", () => {
    expect(shouldEmailForStageTransition("received", "art_review")).toBe(false)
    expect(shouldEmailForStageTransition("approved", "blanks_ordered")).toBe(false)
    expect(shouldEmailForStageTransition("in_production", "shipped")).toBe(false)
    expect(shouldEmailForStageTransition("shipped", "delivered")).toBe(false)
  })

  it("does not email on same-stage transitions", () => {
    expect(shouldEmailForStageTransition("awaiting_approval", "awaiting_approval")).toBe(false)
    expect(shouldEmailForStageTransition("in_production", "in_production")).toBe(false)
  })

  it("suppresses emails on rollback (the bug this function exists for)", () => {
    // in_production → awaiting_approval: customer already approved once.
    expect(shouldEmailForStageTransition("in_production", "awaiting_approval")).toBe(false)
    // approved → awaiting_approval: rollback, customer already saw this email.
    expect(shouldEmailForStageTransition("approved", "awaiting_approval")).toBe(false)
    // shipped (somehow) → in_production: still a rollback, no second "on the press" email.
    expect(shouldEmailForStageTransition("shipped", "in_production")).toBe(false)
  })

  it("DOES email on forward re-entry after a rollback", () => {
    // After rollback to awaiting_approval, moving forward to in_production again
    // is a real new milestone — the previous in_production was undone.
    expect(shouldEmailForStageTransition("awaiting_approval", "in_production")).toBe(true)
  })

  it("ignores garbage from_stage values gracefully", () => {
    // Stale events with malformed from_stage should still email if to_stage qualifies.
    expect(shouldEmailForStageTransition("not_a_real_stage" as any, "in_production")).toBe(true)
  })
})
