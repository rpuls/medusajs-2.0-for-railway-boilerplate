import {
  ARTWORK_STAGES,
  ARTWORK_STAGES_THAT_EMAIL,
  BLANKS_STAGES,
  BLANKS_STAGES_THAT_EMAIL,
  CUSTOMER_MILESTONES,
  DOWNSTREAM_STAGES,
  DOWNSTREAM_STAGES_THAT_EMAIL,
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_LABEL,
  STAGES_THAT_EMAIL,
  customerMilestoneForStage,
  deriveTracksFromLegacyStage,
  isArtworkStage,
  isBlanksStage,
  isDownstreamStage,
  isProductionStage,
  nextStageInTrack,
  shouldEmailForArtworkTransition,
  shouldEmailForBlanksTransition,
  shouldEmailForDownstreamTransition,
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
    expect(ARTWORK_STAGES_THAT_EMAIL.has("awaiting_approval")).toBe(true)
    expect(DOWNSTREAM_STAGES_THAT_EMAIL.has("in_production")).toBe(true)
  })

  it("does not double-email shipped (Medusa core handles that)", () => {
    expect(STAGES_THAT_EMAIL.has("shipped")).toBe(false)
    expect(DOWNSTREAM_STAGES_THAT_EMAIL.has("shipped")).toBe(false)
  })

  it("blanks track is internal-only — no customer emails", () => {
    expect(BLANKS_STAGES_THAT_EMAIL.size).toBe(0)
  })
})

describe("customerMilestoneForStage", () => {
  it("collapses every artwork-track value into 'preparing'", () => {
    for (const s of ARTWORK_STAGES) {
      expect(customerMilestoneForStage(s)).toBe("preparing")
    }
    expect(customerMilestoneForStage("art_review")).toBe("preparing")
  })

  it("collapses every blanks-track value into 'preparing'", () => {
    for (const s of BLANKS_STAGES) {
      expect(customerMilestoneForStage(s)).toBe("preparing")
    }
    expect(customerMilestoneForStage("blanks_ordered")).toBe("preparing")
    expect(customerMilestoneForStage("blanks_arrived")).toBe("preparing")
  })

  it("preserves received / production / shipped / delivered milestones", () => {
    expect(customerMilestoneForStage("received")).toBe("received")
    expect(customerMilestoneForStage("in_production")).toBe("production")
    expect(customerMilestoneForStage("quality_check")).toBe("production")
    expect(customerMilestoneForStage("shipped")).toBe("shipped")
    expect(customerMilestoneForStage("delivered")).toBe("delivered")
  })
})

describe("type guards", () => {
  it("isProductionStage accepts every canonical stage", () => {
    for (const stage of PRODUCTION_STAGES) {
      expect(isProductionStage(stage)).toBe(true)
    }
    expect(isProductionStage("not_a_stage")).toBe(false)
    expect(isProductionStage(null)).toBe(false)
  })
  it("track-specific guards are mutually exclusive within their track", () => {
    for (const s of ARTWORK_STAGES) expect(isArtworkStage(s)).toBe(true)
    for (const s of BLANKS_STAGES) expect(isBlanksStage(s)).toBe(true)
    for (const s of DOWNSTREAM_STAGES) expect(isDownstreamStage(s)).toBe(true)
  })
})

describe("deriveTracksFromLegacyStage", () => {
  it("maps each legacy stage to the documented track triple", () => {
    expect(deriveTracksFromLegacyStage("received")).toEqual({
      artwork_stage: "pending",
      blanks_stage: "not_started",
      production_stage: "received",
    })
    expect(deriveTracksFromLegacyStage("art_review")).toEqual({
      artwork_stage: "in_review",
      blanks_stage: "not_started",
      production_stage: "received",
    })
    expect(deriveTracksFromLegacyStage("awaiting_approval")).toEqual({
      artwork_stage: "awaiting_approval",
      blanks_stage: "not_started",
      production_stage: "received",
    })
    expect(deriveTracksFromLegacyStage("approved")).toEqual({
      artwork_stage: "approved",
      blanks_stage: "not_started",
      production_stage: "received",
    })
    expect(deriveTracksFromLegacyStage("blanks_ordered")).toEqual({
      artwork_stage: "approved",
      blanks_stage: "ordered",
      production_stage: "received",
    })
    expect(deriveTracksFromLegacyStage("blanks_arrived")).toEqual({
      artwork_stage: "approved",
      blanks_stage: "arrived",
      production_stage: "received",
    })
    expect(deriveTracksFromLegacyStage("in_production")).toEqual({
      artwork_stage: "approved",
      blanks_stage: "arrived",
      production_stage: "in_production",
    })
    expect(deriveTracksFromLegacyStage("delivered")).toEqual({
      artwork_stage: "approved",
      blanks_stage: "arrived",
      production_stage: "delivered",
    })
  })

  it("treats null/undefined as a brand-new order", () => {
    const expected = {
      artwork_stage: "pending",
      blanks_stage: "not_started",
      production_stage: "received",
    }
    expect(deriveTracksFromLegacyStage(null)).toEqual(expected)
    expect(deriveTracksFromLegacyStage(undefined)).toEqual(expected)
  })
})

describe("shouldEmailForArtworkTransition", () => {
  it("emails when entering awaiting_approval from earlier", () => {
    expect(shouldEmailForArtworkTransition("pending", "awaiting_approval")).toBe(true)
    expect(shouldEmailForArtworkTransition("in_review", "awaiting_approval")).toBe(true)
    expect(shouldEmailForArtworkTransition(null, "awaiting_approval")).toBe(true)
  })

  it("does not email approval/pending/review (no customer ping)", () => {
    expect(shouldEmailForArtworkTransition("awaiting_approval", "approved")).toBe(false)
    expect(shouldEmailForArtworkTransition("pending", "in_review")).toBe(false)
  })

  it("suppresses on rollback from approved → awaiting_approval", () => {
    expect(shouldEmailForArtworkTransition("approved", "awaiting_approval")).toBe(false)
  })

  it("re-emails forward re-entry after rollback", () => {
    expect(shouldEmailForArtworkTransition("in_review", "awaiting_approval")).toBe(true)
  })
})

describe("shouldEmailForBlanksTransition", () => {
  it("never emails — blanks track is internal-only", () => {
    expect(shouldEmailForBlanksTransition("not_started", "ordered")).toBe(false)
    expect(shouldEmailForBlanksTransition("ordered", "arrived")).toBe(false)
    expect(shouldEmailForBlanksTransition(null, "arrived")).toBe(false)
  })
})

describe("shouldEmailForDownstreamTransition", () => {
  it("emails on entry to in_production", () => {
    expect(shouldEmailForDownstreamTransition("received", "in_production")).toBe(true)
  })

  it("does not email shipped/delivered (handled elsewhere or terminal)", () => {
    expect(shouldEmailForDownstreamTransition("in_production", "shipped")).toBe(false)
    expect(shouldEmailForDownstreamTransition("shipped", "delivered")).toBe(false)
  })

  it("suppresses rollback", () => {
    expect(shouldEmailForDownstreamTransition("quality_check", "in_production")).toBe(false)
    expect(shouldEmailForDownstreamTransition("shipped", "in_production")).toBe(false)
  })

  it("ignores same-stage transitions", () => {
    expect(shouldEmailForDownstreamTransition("in_production", "in_production")).toBe(false)
  })
})

describe("nextStageInTrack", () => {
  it("advances within the artwork track", () => {
    expect(nextStageInTrack("pending")).toBe("in_review")
    expect(nextStageInTrack("in_review")).toBe("awaiting_approval")
    expect(nextStageInTrack("awaiting_approval")).toBe("approved")
    expect(nextStageInTrack("approved")).toBeNull()
  })
  it("advances within the blanks track", () => {
    expect(nextStageInTrack("not_started")).toBe("ordered")
    expect(nextStageInTrack("ordered")).toBe("arrived")
    expect(nextStageInTrack("arrived")).toBeNull()
  })
  it("advances within the downstream track", () => {
    expect(nextStageInTrack("received")).toBe("in_production")
    expect(nextStageInTrack("in_production")).toBe("quality_check")
    expect(nextStageInTrack("quality_check")).toBe("shipped")
    expect(nextStageInTrack("shipped")).toBe("delivered")
    expect(nextStageInTrack("delivered")).toBeNull()
  })
  it("routes legacy values to the correct successor", () => {
    expect(nextStageInTrack("art_review")).toBe("awaiting_approval")
    expect(nextStageInTrack("blanks_ordered")).toBe("blanks_arrived")
    expect(nextStageInTrack("blanks_arrived")).toBeNull()
  })
})
