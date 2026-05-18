/**
 * SYNC TARGET: storefront/src/lib/customer-tiers.ts
 *
 * Backend = canonical source. Mirror any change to the storefront file and run
 * `scripts/check-customer-tiers-sync.mjs` to enforce parity.
 *
 * Customer pricing tiers. Eight ranks, top to bottom by margin:
 *
 *   1  platinum     1.10   (top — thinnest margin we offer)
 *   2  gold_plus    1.15
 *   3  gold         1.20
 *   4  silver_plus  1.25
 *   5  silver       1.30
 *   6  bronze_plus  1.35
 *   7  bronze       1.40
 *   8  member       1.45   (entry — closest to the public ladder floor)
 *
 * The multiplier is applied to ex-GST cost and produces a GST-inclusive
 * selling price. The same convention as `bulk-price-ladder.ts`'s 1.65 floor
 * (cost × 1.1 GST × 1.5 markup = cost × 1.65 inc-GST).
 *
 * Anonymous visitors and customers not in a tier group see the standard 5-band
 * quantity ladder (cost × 1.65 at qty 100+ up to cost × 2.2 at qty 1-9).
 *
 * Tier customers see a single flat price (multiplier × cost). Their
 * calculated_price flows from a Medusa PriceList (one per tier, type=OVERRIDE)
 * scoped to the matching CustomerGroup via price_list_rules.
 */

export const TIER_GROUP_NAME_PREFIX = "Tier: "

export const TIER_SLUGS = [
  "platinum",
  "gold_plus",
  "gold",
  "silver_plus",
  "silver",
  "bronze_plus",
  "bronze",
  "member",
] as const

export type TierSlug = (typeof TIER_SLUGS)[number]

export type Tier = {
  slug: TierSlug
  name: string
  multiplier: number
  rank: number
}

export const TIERS: readonly Tier[] = [
  { slug: "platinum",    name: "Tier: Platinum",    multiplier: 1.10, rank: 1 },
  { slug: "gold_plus",   name: "Tier: Gold Plus",   multiplier: 1.15, rank: 2 },
  { slug: "gold",        name: "Tier: Gold",        multiplier: 1.20, rank: 3 },
  { slug: "silver_plus", name: "Tier: Silver Plus", multiplier: 1.25, rank: 4 },
  { slug: "silver",      name: "Tier: Silver",      multiplier: 1.30, rank: 5 },
  { slug: "bronze_plus", name: "Tier: Bronze Plus", multiplier: 1.35, rank: 6 },
  { slug: "bronze",      name: "Tier: Bronze",      multiplier: 1.40, rank: 7 },
  { slug: "member",      name: "Tier: Member",      multiplier: 1.45, rank: 8 },
] as const

export function getTierBySlug(slug: string | null | undefined): Tier | null {
  if (!slug) return null
  return TIERS.find((t) => t.slug === slug) ?? null
}

export function getTierByName(name: string | null | undefined): Tier | null {
  if (!name) return null
  return TIERS.find((t) => t.name === name) ?? null
}

export function isTierSlug(value: unknown): value is TierSlug {
  return typeof value === "string" && (TIER_SLUGS as readonly string[]).includes(value)
}

export type CustomerGroupLike = {
  id?: string | null
  name?: string | null
  metadata?: Record<string, unknown> | null
}

/**
 * Resolve a tier from a single customer group. Reads `metadata.tier_slug`
 * (canonical), falls back to matching `name` against `TIERS`.
 */
export function tierForGroup(group: CustomerGroupLike | null | undefined): Tier | null {
  if (!group) return null
  const meta = (group.metadata ?? {}) as Record<string, unknown>
  const slug = typeof meta.tier_slug === "string" ? meta.tier_slug : null
  if (slug) {
    const t = getTierBySlug(slug)
    if (t) return t
  }
  return getTierByName(group.name ?? null)
}

export type CustomerLike = {
  groups?: ReadonlyArray<CustomerGroupLike> | null
}

/**
 * Resolve the active tier for a customer. If the customer is somehow in
 * multiple tier groups (data anomaly) the highest-margin tier wins (lowest
 * `rank`) — that's the one giving them the best price, which is the safer
 * default until staff resolve the duplicate via the admin widget.
 */
export function tierForCustomer(customer: CustomerLike | null | undefined): Tier | null {
  const groups = customer?.groups ?? []
  let best: Tier | null = null
  for (const g of groups) {
    const t = tierForGroup(g)
    if (t && (!best || t.rank < best.rank)) {
      best = t
    }
  }
  return best
}

/** Apply a tier's multiplier to an ex-GST cost in minor units (cents). */
export function applyTierMultiplier(costMinor: number, tier: Tier): number {
  return Math.round(costMinor * tier.multiplier)
}
