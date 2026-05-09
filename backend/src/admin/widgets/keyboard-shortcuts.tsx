import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../lib/reports/palette"

/**
 * Press `?` (without a modifier, when not focused on an input) to open
 * a cheat-sheet of every keyboard shortcut wired into the admin.
 *
 * Mounted on the orders list zone so it loads once and stays alive
 * across SPA navigation.
 */
const SHORTCUTS = [
  { keys: "⌘K / Ctrl+K", desc: "Open global search palette" },
  { keys: "Esc", desc: "Close palette / dialog" },
  { keys: "↑ ↓", desc: "Navigate palette results" },
  { keys: "↵", desc: "Open highlighted result" },
  { keys: "?", desc: "Open this shortcuts overlay" },
  { keys: "⌘↵ in comment box", desc: "Post order comment" },
] as const

const KeyboardShortcuts = () => {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null
        // Don't fire while typing in an input / textarea / contenteditable
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return
        }
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-lg shadow-xl"
        style={{ background: "white", border: `1px solid ${PALETTE.stone200}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: PALETTE.stone200 }}
        >
          <Heading level="h2" className="text-base font-semibold">
            Keyboard shortcuts
          </Heading>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Press <kbd className="px-1 py-0.5 rounded text-[10px] bg-ui-bg-subtle/60">Esc</kbd> to close.
          </Text>
        </div>
        <ul className="divide-y" style={{ borderColor: PALETTE.stone200 }}>
          {SHORTCUTS.map((s) => (
            <li
              key={s.keys}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <Text size="small">{s.desc}</Text>
              <kbd
                className="font-mono text-[11px] px-2 py-0.5 rounded"
                style={{
                  background: PALETTE.stone100,
                  border: `1px solid ${PALETTE.stone200}`,
                  color: "#111",
                }}
              >
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default KeyboardShortcuts
