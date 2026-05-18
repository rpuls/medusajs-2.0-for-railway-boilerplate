import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import {
  TIERS,
  TIER_GROUP_NAME_PREFIX,
  type Tier,
  type CustomerGroupLike,
} from "../../lib/customer-tiers"

type CustomerData = {
  id: string
}

type GroupSummary = { id: string; name: string; metadata?: Record<string, unknown> | null }

const NO_TIER = "__no_tier__"

function tierFromGroups(groups: GroupSummary[]): { tier: Tier | null; tierGroup: GroupSummary | null; extraTierGroups: GroupSummary[] } {
  const matched: Array<{ tier: Tier; group: GroupSummary }> = []
  for (const g of groups) {
    const slug =
      typeof g.metadata?.tier_slug === "string" ? (g.metadata.tier_slug as string) : null
    const tier =
      (slug && TIERS.find((t) => t.slug === slug)) ||
      TIERS.find((t) => t.name === g.name) ||
      null
    if (tier) matched.push({ tier, group: g })
  }
  if (!matched.length) return { tier: null, tierGroup: null, extraTierGroups: [] }
  // Highest-margin wins (lowest rank). Extras = duplicates to clean up.
  matched.sort((a, b) => a.tier.rank - b.tier.rank)
  return {
    tier: matched[0].tier,
    tierGroup: matched[0].group,
    extraTierGroups: matched.slice(1).map((m) => m.group),
  }
}

const CustomerTierWidget = ({ data: customer }: { data: CustomerData }) => {
  const customerId = customer?.id
  const [groups, setGroups] = useState<GroupSummary[] | null>(null)
  const [allTierGroups, setAllTierGroups] = useState<GroupSummary[]>([])
  const [saving, setSaving] = useState(false)
  const [pending, setPending] = useState<string | null>(null) // selected slug not yet saved

  const loadAll = useCallback(async () => {
    if (!customerId) return
    try {
      const [custRes, groupsRes] = await Promise.all([
        fetch(
          `/admin/customers/${customerId}?fields=%2Bgroups.id,%2Bgroups.name,%2Bgroups.metadata`,
          { credentials: "include" }
        ),
        fetch(`/admin/customer-groups?fields=id,name,metadata&limit=200`, {
          credentials: "include",
        }),
      ])
      if (custRes.ok) {
        const json = await custRes.json()
        setGroups((json.customer?.groups ?? []) as GroupSummary[])
      }
      if (groupsRes.ok) {
        const json = await groupsRes.json()
        const all = (json.customer_groups ?? []) as GroupSummary[]
        // Only the 8 tier groups, in rank order.
        const tierGroups = TIERS.map((t) => all.find((g) => g.name === t.name))
          .filter((g): g is GroupSummary => !!g)
        setAllTierGroups(tierGroups)
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to load tier data")
    }
  }, [customerId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (!customerId) return null

  const { tier, tierGroup, extraTierGroups } = tierFromGroups(groups ?? [])
  const currentSlug = tier?.slug ?? NO_TIER
  const displaySlug = pending ?? currentSlug

  const isReady = groups !== null && allTierGroups.length === TIERS.length

  const handleSave = async () => {
    if (!pending || pending === currentSlug) return
    setSaving(true)
    try {
      // Determine target group (or null for "no tier")
      const targetTier = pending === NO_TIER ? null : TIERS.find((t) => t.slug === pending) ?? null
      const targetGroup =
        targetTier ? allTierGroups.find((g) => g.name === targetTier.name) ?? null : null

      // Build the list of memberships to clear (current tier + any duplicates,
      // minus the target so we don't add-then-remove).
      const toRemove = [tierGroup, ...extraTierGroups]
        .filter((g): g is GroupSummary => !!g)
        .filter((g) => g.id !== targetGroup?.id)

      // Remove from old tier(s), then add to new — sequenced to keep at most
      // one active tier membership at any time.
      for (const g of toRemove) {
        const res = await fetch(`/admin/customer-groups/${g.id}/customers`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remove: [customerId] }),
        })
        if (!res.ok) throw new Error(await res.text())
      }
      if (targetGroup) {
        const res = await fetch(`/admin/customer-groups/${targetGroup.id}/customers`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ add: [customerId] }),
        })
        if (!res.ok) throw new Error(await res.text())
      }

      toast.success(
        targetTier
          ? `Tier set to ${targetTier.name.slice(TIER_GROUP_NAME_PREFIX.length)}`
          : "Tier cleared"
      )
      setPending(null)
      await loadAll()
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Customer pricing tier
          <HelpTooltip
            text={{
              title: "Customer pricing tier",
              body: "Assigns this customer to a tier-priced PriceList. Tier customers see a single flat price (cost × tier_multiplier) on every product — the public quantity ladder is hidden for them. Unassigned customers and anonymous visitors see today's standard 5-band ladder.",
              bullets: [
                "Platinum (1.10×) is the best price we offer; Member (1.45×) is the entry tier.",
                "Tier prices are regenerated nightly at 06:00 UTC from canonical variant cost.",
                "Assignment shows up in the customer's cart instantly. Existing in-flight carts may need a refresh.",
                "Only the highest-margin (lowest-rank) tier is honoured if a customer is somehow in multiple tier groups — staff can use 'Clear all tier memberships' to fix.",
              ],
            }}
          />
        </Heading>
        {tier ? (
          <Badge color="green">{tier.name.slice(TIER_GROUP_NAME_PREFIX.length)}</Badge>
        ) : (
          <Badge color="grey">No tier</Badge>
        )}
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-3">
        {!isReady ? (
          <Text size="small" className="text-ui-fg-muted">
            Loading tier data…
          </Text>
        ) : (
          <>
            <div className="flex items-end gap-x-2">
              <div className="flex-1">
                <Select
                  value={displaySlug}
                  onValueChange={(v) => setPending(v)}
                  disabled={saving}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value={NO_TIER}>
                      No tier (standard retail pricing)
                    </Select.Item>
                    {TIERS.map((t) => (
                      <Select.Item key={t.slug} value={t.slug}>
                        {t.name.slice(TIER_GROUP_NAME_PREFIX.length)} ({t.multiplier.toFixed(2)}×)
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              <Button
                variant="primary"
                size="small"
                onClick={handleSave}
                disabled={saving || !pending || pending === currentSlug}
              >
                Save
              </Button>
            </div>

            {extraTierGroups.length > 0 ? (
              <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-3 text-sm">
                <Text className="text-ui-fg-base font-medium">
                  Multiple tier memberships detected
                </Text>
                <Text className="text-ui-fg-subtle mt-1">
                  This customer is in {extraTierGroups.length + 1} tier groups. The highest-margin
                  one wins, but you should clean this up.
                </Text>
                <Button
                  variant="secondary"
                  size="small"
                  className="mt-2"
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true)
                    try {
                      for (const g of [tierGroup, ...extraTierGroups].filter(
                        (g): g is GroupSummary => !!g
                      )) {
                        const res = await fetch(
                          `/admin/customer-groups/${g.id}/customers`,
                          {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ remove: [customerId] }),
                          }
                        )
                        if (!res.ok) throw new Error(await res.text())
                      }
                      toast.success("Cleared all tier memberships")
                      setPending(null)
                      await loadAll()
                    } catch (err: any) {
                      toast.error(err?.message ?? "Failed to clear")
                    } finally {
                      setSaving(false)
                    }
                  }}
                >
                  Clear all tier memberships
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
})

export default withWidgetBoundary(CustomerTierWidget, "customer-tier")
