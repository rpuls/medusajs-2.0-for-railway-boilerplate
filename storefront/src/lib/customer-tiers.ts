/**
 * SYNC SOURCE: backend/src/lib/customer-tiers.ts
 *
 * Storefront mirror of the backend's canonical tier list. Two files exist
 * because backend and storefront are separate packages with separate
 * node_modules and tsconfigs — they can't share a single import.
 *
 * `scripts/check-customer-tiers-sync.mjs` validates parity. Run it after
 * editing either file.
 *
 * See the backend file for design notes on multipliers and how tier prices
 * flow through Medusa's pricing module.
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
 * Resolve the active tier for a customer. If a customer is in multiple tier
 * groups (data anomaly), the highest-margin tier wins (lowest `rank`).
 */
export function getCustomerTier(customer: CustomerLike | null | undefined): Tier | null {
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
