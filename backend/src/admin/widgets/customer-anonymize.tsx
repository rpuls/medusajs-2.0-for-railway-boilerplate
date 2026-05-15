import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Trash } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import { useState } from "react"

import { withWidgetBoundary } from "../components/widget-error-boundary"

type CustomerData = {
  id: string
  email?: string | null
  metadata?: Record<string, unknown> | null
}

const CustomerAnonymizeWidget = ({ data: customer }: { data: CustomerData }) => {
  const customerId = customer?.id
  const email = typeof customer?.email === "string" ? customer.email : ""
  const meta = (customer?.metadata ?? {}) as Record<string, unknown>
  const alreadyAnonymized = typeof meta.anonymized_at === "string"

  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [pending, setPending] = useState(false)

  if (!customerId) return null

  if (alreadyAnonymized) {
    return (
      <Container className="p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Customer data</Heading>
          <Text size="xsmall" className="text-ui-fg-muted mt-2">
            Anonymised on{" "}
            {new Date(meta.anonymized_at as string).toLocaleDateString("en-AU")}.
            Order records retained for tax/audit; all PII has been redacted.
          </Text>
        </div>
      </Container>
    )
  }

  const submit = async () => {
    if (confirmation !== email) {
      toast.error("Type the customer email to confirm.")
      return
    }
    setPending(true)
    try {
      const res = await fetch(`/admin/customers/${customerId}/anonymize`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.detail || body?.error || "Failed to anonymise")
      }
      toast.success("Customer anonymised. Refresh to see the redacted record.")
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to anonymise")
    } finally {
      setPending(false)
    }
  }

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Customer data</Heading>
      </div>
      <div className="px-6 pb-4 flex flex-col gap-y-3">
        <Text size="xsmall" className="text-ui-fg-muted">
          Right-to-be-forgotten: redacts email, name, addresses, design library.
          Orders are preserved for tax/audit but their PII link is broken.
          Cannot be undone.
        </Text>
        {!open ? (
          <Button
            size="small"
            variant="danger"
            onClick={() => setOpen(true)}
          >
            <Trash />
            Anonymise customer
          </Button>
        ) : (
          <div className="rounded-md border border-ui-tag-red-border bg-ui-tag-red-bg p-3 flex flex-col gap-y-2">
            <Label className="text-ui-fg-base font-semibold">
              Type <span className="font-mono">{email || customerId}</span> to confirm:
            </Label>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={email}
              disabled={pending}
            />
            <div className="flex items-center gap-x-2 justify-end">
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setOpen(false)
                  setConfirmation("")
                }}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="danger"
                onClick={submit}
                disabled={pending || confirmation !== (email || customerId)}
              >
                Anonymise
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
})

export default withWidgetBoundary(
  CustomerAnonymizeWidget,
  "customer-anonymize"
)
