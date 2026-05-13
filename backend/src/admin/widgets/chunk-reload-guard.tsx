import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { useEffect } from "react"

const INSTALL_FLAG = "__sc_chunk_reload_guard_installed"
const LAST_RELOAD_KEY = "sc_chunk_reload_guard_last"
const MIN_INTERVAL_MS = 15_000

const isChunkLoadFailure = (reason: unknown): boolean => {
  if (!reason) return false
  const msg =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? `${reason.name}: ${reason.message}`
        : String((reason as { message?: string })?.message ?? "")
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Expected a JavaScript-or-Wasm module script/i.test(msg)
  )
}

const isStaleScriptElementError = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false
  if (target.tagName !== "SCRIPT" && target.tagName !== "LINK") return false
  const src =
    (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || ""
  return /\/assets\/.+\.(m?js|css)/i.test(src)
}

const triggerReload = (cause: string) => {
  try {
    const last = Number(sessionStorage.getItem(LAST_RELOAD_KEY) || "0")
    if (Date.now() - last < MIN_INTERVAL_MS) {
      console.warn(
        `[chunk-reload-guard] suppressed reload (recent reload <${MIN_INTERVAL_MS}ms ago):`,
        cause,
      )
      return
    }
    sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage unavailable — proceed without debounce
  }
  console.warn(`[chunk-reload-guard] reloading admin (${cause})`)
  window.location.reload()
}

const ChunkReloadGuard = () => {
  useEffect(() => {
    if (typeof window === "undefined") return
    const w = window as unknown as Record<string, unknown>
    if (w[INSTALL_FLAG]) return
    w[INSTALL_FLAG] = true

    const onRejection = (e: PromiseRejectionEvent) => {
      if (isChunkLoadFailure(e.reason)) {
        triggerReload(`unhandledrejection: ${(e.reason as Error)?.message ?? e.reason}`)
      }
    }

    const onError = (e: ErrorEvent | Event) => {
      const errEvent = e as ErrorEvent
      if (isChunkLoadFailure(errEvent.message) || isChunkLoadFailure(errEvent.error)) {
        triggerReload(`error: ${errEvent.message}`)
        return
      }
      if (isStaleScriptElementError((e as Event).target)) {
        triggerReload(`script load failure: ${(e.target as HTMLScriptElement)?.src}`)
      }
    }

    window.addEventListener("unhandledrejection", onRejection)
    window.addEventListener("error", onError, true)
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: [
    "login.after",
    "order.list.before",
    "product.list.before",
    "customer.list.before",
  ],
})

export default withWidgetBoundary(ChunkReloadGuard, "chunk-reload-guard")
