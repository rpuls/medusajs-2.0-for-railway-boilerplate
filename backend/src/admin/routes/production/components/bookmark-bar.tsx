import { Button, Input, Text, Tooltip } from "@medusajs/ui"
import { useCallback, useEffect, useRef, useState } from "react"
import { Bookmarks, Plus } from "@medusajs/icons"

import { PALETTE } from "../../../lib/reports/palette"

type SavedBookmarks = {
  id: string
  label: string
  query: string
  sort_order: number
}

type ValidTarget = "orders" | "production" | "reports" | "customers"

export const BookmarkBar = ({
  target,
  currentQuery,
  onApply,
}: {
  target: ValidTarget
  currentQuery: string
  onApply: (query: string) => void
}) => {
  const [bookmarks, setBookmarkss] = useState<SavedBookmarks[]>([])
  const [showSave, setShowSave] = useState(false)
  const [label, setLabel] = useState("")
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/admin/admin-workspace/bookmarks?target=${target}`,
        { credentials: "include" }
      )
      if (!res.ok) return
      const data = await res.json()
      setBookmarkss(
        [...(data.bookmarks ?? [])].sort(
          (a: SavedBookmarks, b: SavedBookmarks) => a.sort_order - b.sort_order
        )
      )
    } catch {
      // non-fatal — bar just stays empty
    }
  }, [target])

  useEffect(() => { void load() }, [load])

  // Focus input when save panel opens
  useEffect(() => {
    if (showSave) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [showSave])

  const save = async () => {
    if (!label.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/admin/admin-workspace/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          target,
          label: label.trim(),
          query: currentQuery,
          sort_order: (bookmarks.length + 1) * 10,
        }),
      })
      if (res.ok) {
        setLabel("")
        setShowSave(false)
        await load()
      }
    } catch {
      // non-fatal
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/admin/admin-workspace/bookmarks/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      setBookmarkss((prev) => prev.filter((b) => b.id !== id))
    } catch {
      // non-fatal
    }
  }

  const hasFilters = currentQuery.length > 0

  // Don't render anything if there are no bookmarks and save panel is closed
  if (bookmarks.length === 0 && !showSave) {
    return (
      <div className="flex items-center gap-x-2 px-1">
        <Tooltip content={hasFilters ? "Save current filters as a bookmark" : "Set some filters first, then save"}>
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => { setLabel(""); setShowSave(true) }}
            className="inline-flex items-center gap-x-1 text-xs text-ui-fg-muted hover:text-ui-fg-base transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Bookmarks className="w-3 h-3" />
            Save view
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-1">
      <Tooltip content="Saved filter views — click to apply">
        <span className="inline-flex items-center gap-x-1 text-xs text-ui-fg-muted shrink-0">
          <Bookmarks className="w-3 h-3" />
        </span>
      </Tooltip>

      {/* Existing bookmarks */}
      {bookmarks.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onApply(b.query)}
          className="group inline-flex items-center gap-x-1 rounded-full border px-2.5 py-0.5 text-xs transition hover:border-ui-border-strong"
          style={{
            borderColor: PALETTE.slate300,
            background:
              b.query === currentQuery ? PALETTE.slate100 : "transparent",
            fontWeight: b.query === currentQuery ? 600 : 400,
          }}
          title={b.query || "All orders (no filters)"}
        >
          {b.label}
          <span
            onClick={(e) => remove(b.id, e)}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition ml-0.5"
            title="Delete bookmark"
          >
            ×
          </span>
        </button>
      ))}

      {/* Save panel */}
      {showSave ? (
        <div className="inline-flex items-center gap-x-1.5">
          <Input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save()
              if (e.key === "Escape") setShowSave(false)
            }}
            placeholder="Bookmarks name…"
            size="small"
            className="w-40"
          />
          <Button size="small" onClick={save} isLoading={saving} disabled={!label.trim()}>
            Save
          </Button>
          <Button size="small" variant="transparent" onClick={() => setShowSave(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Tooltip content={hasFilters ? "Save current filters" : "Set filters first"}>
          <button
            type="button"
            disabled={!hasFilters}
            onClick={() => { setLabel(""); setShowSave(true) }}
            className="inline-flex items-center gap-x-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-ui-fg-muted hover:text-ui-fg-base hover:border-ui-border-strong transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" /> Save view
          </button>
        </Tooltip>
      )}
    </div>
  )
}
