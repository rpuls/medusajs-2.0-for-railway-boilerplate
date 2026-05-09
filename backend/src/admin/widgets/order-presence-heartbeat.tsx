import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

/**
 * Hidden widget that fires a presence heartbeat every 20s while the
 * operator has this order's detail page open. Pairs with the
 * /admin/admin-workspace/presence read endpoint that other tabs / list
 * views poll to render "X is also looking" avatar pills.
 *
 * Renders no UI of its own.
 */
const HEARTBEAT_INTERVAL_MS = 20_000

const OrderPresenceHeartbeat = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id

  useEffect(() => {
    if (!orderId || typeof window === "undefined") return
    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      // Skip when tab is hidden — we want presence to mean "actively
      // viewing", not "left a tab open while at lunch".
      if (document.hidden) return
      try {
        await fetch(`/admin/admin-workspace/presence`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ entity: "order", entity_id: orderId }),
        })
      } catch {
        /* network blip — try again next tick */
      }
    }

    tick()
    const interval = setInterval(tick, HEARTBEAT_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [orderId])

  return null
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderPresenceHeartbeat
