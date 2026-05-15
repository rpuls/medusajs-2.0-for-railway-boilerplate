import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type CustomerData = {
  id: string
  metadata?: Record<string, unknown> | null
}

const CustomerTaxExemptWidget = ({ data: customer }: { data: CustomerData }) => {
  const customerId = customer?.id
  const meta = (customer?.metadata ?? {}) as Record<string, unknown>
  const [enabled, setEnabled] = useState<boolean>(meta.tax_exempt === true)
  const [reason, setReason] = useState<string>(
    typeof meta.tax_exempt_reason === "string" ? meta.tax_exempt_reason : ""
  )
  const [abn, setAbn] = useState<string>(
    typeof meta.tax_exempt_abn === "string" ? meta.tax_exempt_abn : ""
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEnabled(meta.tax_exempt === true)
    setReason(typeof meta.tax_exempt_reason === "string" ? meta.tax_exempt_reason : "")
    setAbn(typeof meta.tax_exempt_abn === "string" ? meta.tax_exempt_abn : "")
  }, [meta.tax_exempt, meta.tax_exempt_reason, meta.tax_exempt_abn])

  const save = async (next: {
    tax_exempt?: boolean
    tax_exempt_reason?: string | null
    tax_exempt_abn?: string | null
  }) => {
    if (!customerId) return
    setSaving(true)
    try {
      const res = await fetch(`/admin/customers/${customerId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...meta,
            tax_exempt:
              next.tax_exempt !== undefined ? next.tax_exempt : enabled,
            tax_exempt_reason:
              next.tax_exempt_reason !== undefined
                ? next.tax_exempt_reason
                : reason || null,
            tax_exempt_abn:
              next.tax_exempt_abn !== undefined
                ? next.tax_exempt_abn
                : abn || null,
            tax_exempt_updated_at: new Date().toISOString(),
          },
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Saved")
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
      // revert local state on failure
      if (next.tax_exempt !== undefined) setEnabled(!next.tax_exempt)
    } finally {
      setSaving(false)
    }
  }

  if (!customerId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Tax status
          <HelpTooltip
            text={{
              title: "Tax-exempt customer",
              body: "Mark a customer as tax-exempt (e.g. council, non-profit, school) so their orders generate a no-GST tax invoice. The flag is read by the customer-side invoice download and by the order-placement subscriber that stamps `order.metadata.tax_exempt = true`.",
              bullets: [
                "Reason and ABN are optional but rendered on the invoice.",
                "Tax calc at checkout still uses Medusa's default rules — actual GST removal happens via Order Edit. The flag drives the *invoice document*, not the price.",
                "Existing orders aren't retroactively re-flagged when you toggle this on.",
                "Reverse-charge for overseas customers can use the same flag with a different reason string.",
              ],
            }}
          />
        </Heading>
        {enabled ? <Badge color="orange">Tax-exempt</Badge> : <Badge color="grey">Standard</Badge>}
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-3">
        <div className="flex items-center gap-x-3">
          <Switch
            id="tax-exempt-toggle"
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v)
              save({ tax_exempt: v })
            }}
            disabled={saving}
          />
          <Label htmlFor="tax-exempt-toggle">
            This customer is tax-exempt (no GST on invoices)
          </Label>
        </div>

        {enabled ? (
          <>
            <div>
              <Label size="xsmall">Reason / certificate</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() =>
                  save({ tax_exempt_reason: reason.trim() || null })
                }
                placeholder="e.g. NSW government department, NFP cert no. 12345"
                disabled={saving}
              />
            </div>
            <div>
              <Label size="xsmall">ABN (optional)</Label>
              <Input
                value={abn}
                onChange={(e) => setAbn(e.target.value)}
                onBlur={() => save({ tax_exempt_abn: abn.trim() || null })}
                placeholder="51 824 753 556"
                disabled={saving}
              />
            </div>
          </>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
})

export default withWidgetBoundary(
  CustomerTaxExemptWidget,
  "customer-tax-exempt"
)
