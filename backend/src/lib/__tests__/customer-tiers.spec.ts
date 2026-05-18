import {
  TIERS,
  TIER_SLUGS,
  TIER_GROUP_NAME_PREFIX,
  applyTierMultiplier,
  getTierBySlug,
  getTierByName,
  isTierSlug,
  tierForCustomer,
  tierForGroup,
} from "../customer-tiers"

describe("customer-tiers constants", () => {
  it("has exactly 8 tiers", () => {
    expect(TIERS).toHaveLength(8)
    expect(TIER_SLUGS).toHaveLength(8)
  })

  it("has ascending multipliers from 1.10 to 1.45 in 0.05 steps", () => {
    expect(TIERS.map((t) => t.multiplier)).toEqual([
      1.10, 1.15, 1.20, 1.25, 1.30, 1.35, 1.40, 1.45,
    ])
  })

  it("has monotonically increasing ranks 1..8", () => {
    expect(TIERS.map((t) => t.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it("has unique slugs", () => {
    const slugs = TIERS.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("aligns TIER_SLUGS with TIERS", () => {
    expect(TIER_SLUGS).toEqual(TIERS.map((t) => t.slug))
  })

  it("prefixes every tier name with the tier-group prefix", () => {
    for (const t of TIERS) {
      expect(t.name.startsWith(TIER_GROUP_NAME_PREFIX)).toBe(true)
    }
  })
})

describe("getTierBySlug / getTierByName", () => {
  it("resolves by slug", () => {
    expect(getTierBySlug("gold")?.multiplier).toBe(1.20)
    expect(getTierBySlug("member")?.multiplier).toBe(1.45)
    expect(getTierBySlug("platinum")?.multiplier).toBe(1.10)
  })

  it("returns null for unknown slug", () => {
    expect(getTierBySlug("diamond")).toBeNull()
    expect(getTierBySlug(null)).toBeNull()
    expect(getTierBySlug(undefined)).toBeNull()
  })

  it("resolves by name", () => {
    expect(getTierByName("Tier: Gold")?.slug).toBe("gold")
  })
})

describe("isTierSlug", () => {
  it("accepts valid slugs", () => {
    expect(isTierSlug("gold")).toBe(true)
    expect(isTierSlug("bronze_plus")).toBe(true)
  })
  it("rejects everything else", () => {
    expect(isTierSlug("diamond")).toBe(false)
    expect(isTierSlug(42)).toBe(false)
    expect(isTierSlug(null)).toBe(false)
  })
})

describe("tierForGroup", () => {
  it("reads metadata.tier_slug first", () => {
    const t = tierForGroup({
      name: "Some random name",
      metadata: { tier_slug: "silver" },
    })
    expect(t?.slug).toBe("silver")
  })

  it("falls back to matching by name", () => {
    const t = tierForGroup({ name: "Tier: Bronze" })
    expect(t?.slug).toBe("bronze")
  })

  it("returns null for non-tier groups", () => {
    expect(tierForGroup({ name: "VIP" })).toBeNull()
    expect(tierForGroup(null)).toBeNull()
  })
})

describe("tierForCustomer", () => {
  it("returns null for guests", () => {
    expect(tierForCustomer(null)).toBeNull()
    expect(tierForCustomer({ groups: [] })).toBeNull()
  })

  it("returns the tier for a single-membership customer", () => {
    const t = tierForCustomer({
      groups: [{ name: "Tier: Gold", metadata: { tier_slug: "gold" } }],
    })
    expect(t?.slug).toBe("gold")
  })

  it("picks the highest-margin tier when in multiple tier groups", () => {
    // platinum (rank 1, 1.10x) wins over bronze (rank 7, 1.40x).
    const t = tierForCustomer({
      groups: [
        { name: "Tier: Bronze", metadata: { tier_slug: "bronze" } },
        { name: "Tier: Platinum", metadata: { tier_slug: "platinum" } },
      ],
    })
    expect(t?.slug).toBe("platinum")
  })

  it("ignores non-tier groups", () => {
    const t = tierForCustomer({
      groups: [
        { name: "VIP" },
        { name: "Tier: Silver", metadata: { tier_slug: "silver" } },
      ],
    })
    expect(t?.slug).toBe("silver")
  })
})

describe("applyTierMultiplier", () => {
  it("multiplies cost in minor units and rounds to integer cents", () => {
    // $5.40 cost ex-GST = 540 minor units. Gold tier (1.20x) → 648 minor units.
    const gold = getTierBySlug("gold")!
    expect(applyTierMultiplier(540, gold)).toBe(648)
  })

  it("handles fractional results via banker's rounding", () => {
    // 633 × 1.15 = 727.95 → rounds to 728.
    const goldPlus = getTierBySlug("gold_plus")!
    expect(applyTierMultiplier(633, goldPlus)).toBe(728)
  })

  it("returns expected values for every tier on a known cost", () => {
    // 1000 minor unit cost, multipliers 1.10 → 1100, 1.45 → 1450, etc.
    expect(applyTierMultiplier(1000, getTierBySlug("platinum")!)).toBe(1100)
    expect(applyTierMultiplier(1000, getTierBySlug("gold")!)).toBe(1200)
    expect(applyTierMultiplier(1000, getTierBySlug("member")!)).toBe(1450)
  })
})
