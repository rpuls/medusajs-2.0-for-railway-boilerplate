import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

const OrderWatchersWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [watchers, setWatchers] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/watchers`, {
        credentials: "include",
      })
      const json = (await res.json()) as { watchers?: string[] }
      setWatchers(json.watchers ?? [])
    } catch {
      // soft fail
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const add = async () => {
    if (!draft.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/watchers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draft.trim() }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.error || "Failed to add")
      }
      const json = (await res.json()) as { watchers?: string[] }
      setWatchers(json.watchers ?? [])
      setDraft("")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (email: string) => {
    setBusy(true)
    try {
      const res = await fetch(
        `/admin/orders/${orderId}/watchers?email=${encodeURIComponent(email)}`,
        { method: "DELETE", credentials: "include" }
      )
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as { watchers?: string[] }
      setWatchers(json.watchers ?? [])
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to remove")
    } finally {
      setBusy(false)
    }
  }

  if (!orderId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Watchers
          <HelpTooltip
            text={{
              title: "Order watchers",
              body: "Extra email addresses that get CC'd on every customer-facing production-stage email for this order. Useful when one parent ordered but the whole P&C wants updates.",
              bullets: [
                "Max 5 watchers per order.",
                "Watchers receive the same email body as the primary customer — they don't see any internal admin notes.",
                "The customer can also add their own watchers from their account page.",
                "Remove a watcher and they stop getting future emails immediately.",
              ],
            }}
          />
        </Heading>
        <Badge color={watchers.length ? "blue" : "grey"}>
          {watchers.length} / 5
        </Badge>
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-3">
        <div className="flex items-center gap-x-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="email@example.com"
            type="email"
            disabled={busy || watchers.length >= 5}
            onKeyDown={(e) => {
              if (e.key === "Enter") add()
            }}
          />
          <Button
            size="small"
            onClick={add}
            disabled={busy || !draft.trim() || watchers.length >= 5}
          >
            Add
          </Button>
        </div>

        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : watchers.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No watchers yet.
          </Text>
        ) : (
          <ul className="divide-y">
            {watchers.map((email) => (
              <li key={email} className="py-2 flex items-center justify-between">
                <Text size="small">{email}</Text>
                <button
                  type="button"
                  onClick={() => remove(email)}
                  className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                  aria-label="Remove watcher"
                  disabled={busy}
                >
                  <Trash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderWatchersWidget, "order-watchers")
