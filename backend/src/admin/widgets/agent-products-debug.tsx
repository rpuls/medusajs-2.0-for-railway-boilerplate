import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { useEffect } from "react"

import { sdk } from "../lib/sdk"

const DASHBOARD_LIST_FIELDS =
  "id,title,handle,status,*collection,*sales_channels,variants.id,thumbnail"

// #region agent log
async function agentLog(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>
) {
  try {
    await sdk.client.fetch("/admin/agent-products-debug", {
      method: "POST",
      body: { hypothesisId, message, data },
    })
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[agent-products-debug] POST failed", e)
    }
  }
}
// #endregion

const AgentProductsDebugWidget = () => {
  useEffect(() => {
    void agentLog("HA", "product.list.before widget mounted", {})

    const onWindowError = (ev: ErrorEvent) => {
      void agentLog("HD", "window error", {
        message: String(ev.message ?? "").slice(0, 400),
        filename: ev.filename ? String(ev.filename).slice(-120) : "",
        lineno: ev.lineno ?? 0,
      })
    }
    window.addEventListener("error", onWindowError)

    let cancelled = false
    void (async () => {
      try {
        const res = await sdk.admin.product.list({
          limit: 20,
          offset: 0,
          is_giftcard: false,
          fields: DASHBOARD_LIST_FIELDS,
          order: "-created_at",
        })
        if (cancelled) {
          return
        }
        const rows = res.products ?? []
        const summary = rows.slice(0, 15).map((p) => {
          const rec = p as Record<string, unknown>
          const sc = rec.sales_channels
          const vari = rec.variants
          return {
            statusType: typeof rec.status,
            statusVal:
              rec.status === undefined
                ? "__undefined__"
                : String(rec.status).slice(0, 64),
            scShape: Array.isArray(sc)
              ? `array(len=${sc.length})`
              : `non-array(${typeof sc})`,
            variantsShape: Array.isArray(vari)
              ? `array(len=${vari.length})`
              : `non-array(${typeof vari})`,
            collectionShape:
              rec.collection === null
                ? "null"
                : rec.collection === undefined
                  ? "undefined"
                  : `object`,
            thumbType: typeof rec.thumbnail,
          }
        })
        void agentLog("HB", "admin product.list dashboard-fields ok", {
          count: res.count ?? rows.length,
          returned: rows.length,
          summary,
        })
      } catch (e: unknown) {
        if (!cancelled) {
          void agentLog("HB", "admin product.list dashboard-fields threw", {
            err: e instanceof Error ? e.message : String(e),
          })
        }
      }
    })()

    return () => {
      cancelled = true
      window.removeEventListener("error", onWindowError)
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default withWidgetBoundary(AgentProductsDebugWidget, "agent-products-debug")
