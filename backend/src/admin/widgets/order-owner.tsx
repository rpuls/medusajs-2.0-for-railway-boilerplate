import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { OwnerPicker } from "../components/owner-picker"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Order = { id: string }
type Owner = {
  assignment_id: string
  user_id: string
  assigned_at: string
  assigned_by: string | null
  reason: string | null
} | null

const OrderOwnerWidget = ({ data: order }: { data: Order }) => {
  const orderId = order?.id
  const [owner, setOwner] = useState<Owner>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    if (!orderId) return
    try {
      const res = await fetch(`/admin/orders/${orderId}/owner`, {
        credentials: "include",
      })
      const json = (await res.json()) as { owner: Owner }
      setOwner(json.owner ?? null)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const onChange = async (userId: string | null) => {
    if (!orderId) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/owner`, {
        method: userId ? "PUT" : "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: userId ? JSON.stringify({ user_id: userId }) : undefined,
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success(userId ? "Owner updated" : "Owner cleared")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (!orderId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Order owner
          <HelpTooltip
            text={{
              title: "Order owner (assignee)",
              body: "The staff member responsible for moving this specific order through production. New orders auto-stamp from the customer's owner (or rotation pick) when OWNER_AUTOSTAMP_ENABLED is true.",
              bullets: [
                "Stale-order alerts (Phase 11) escalate to the order owner first, then to watchers.",
                "Owner is independent from the customer's owner — useful when a different teammate handles a specific job.",
              ],
            }}
          />
        </Heading>
        {owner ? (
          <Badge color="green">Owned</Badge>
        ) : (
          <Badge color="grey">Unowned</Badge>
        )}
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-2">
        {loading ? (
          <Text className="text-ui-fg-muted text-sm">Loading…</Text>
        ) : (
          <OwnerPicker
            value={owner?.user_id ?? null}
            onChange={onChange}
            disabled={saving}
          />
        )}
        {owner ? (
          <Text className="text-ui-fg-muted text-xs">
            Since {new Date(owner.assigned_at).toLocaleString()}
            {owner.reason ? ` · ${owner.reason}` : ""}
          </Text>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderOwnerWidget, "order-owner")
