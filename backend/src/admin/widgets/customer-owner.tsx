import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { OwnerPicker } from "../components/owner-picker"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Customer = { id: string }
type Owner = {
  assignment_id: string
  user_id: string
  assigned_at: string
  assigned_by: string | null
  reason: string | null
} | null

const CustomerOwnerWidget = ({ data: customer }: { data: Customer }) => {
  const customerId = customer?.id
  const [owner, setOwner] = useState<Owner>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    if (!customerId) return
    try {
      const res = await fetch(`/admin/customers/${customerId}/owner`, {
        credentials: "include",
      })
      const json = (await res.json()) as { owner: Owner }
      setOwner(json.owner ?? null)
    } catch {
      // ignore — keep stale state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])

  const onChange = async (userId: string | null) => {
    if (!customerId) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/customers/${customerId}/owner`, {
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

  if (!customerId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Account owner
          <HelpTooltip
            text={{
              title: "Customer account owner",
              body: "The staff member responsible for this customer. Owner inheritance: when this customer places an order, the order auto-stamps to the same owner (gated by OWNER_AUTOSTAMP_ENABLED).",
              bullets: [
                "Setting an owner here populates a CrmOwnerAssignment row + customer↔owner module link.",
                "Clearing returns this customer to the rotation pool on their next order.",
                "Owner changes are audited (action: owner_changed).",
                "Quote / Order assignment is tracked separately — this is the customer-level owner.",
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
  zone: "customer.details.side.after",
})

export default withWidgetBoundary(CustomerOwnerWidget, "customer-owner")
