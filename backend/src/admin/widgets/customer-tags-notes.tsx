import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Select, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { Trash, Plus, PinTackSolid } from "@medusajs/icons"
import { useEffect, useState } from "react"

import { PALETTE } from "../lib/reports/palette"

type Tag = {
  id: string
  label: string
  color: string
  created_by: string | null
  created_at: string
}

type Note = {
  id: string
  body: string
  pinned: boolean
  created_by: string | null
  created_at: string
}

const COLOR_OPTIONS = [
  { value: "slate", label: "Slate", hex: PALETTE.slate700 },
  { value: "teal", label: "Teal", hex: PALETTE.teal700 },
  { value: "amber", label: "Amber", hex: PALETTE.amber600 },
  { value: "rose", label: "Rose", hex: PALETTE.rose600 },
  { value: "emerald", label: "Emerald", hex: PALETTE.emerald600 },
] as const

const COLOR_HEX: Record<string, string> = {
  slate: PALETTE.slate700,
  teal: PALETTE.teal700,
  amber: PALETTE.amber600,
  rose: PALETTE.rose600,
  emerald: PALETTE.emerald600,
}

const formatRelative = (iso: string): string => {
  const ms = Date.parse(iso ?? "")
  if (!Number.isFinite(ms)) return ""
  const diff = Date.now() - ms
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 30 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`
  return new Date(ms).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const CustomerTagsNotesWidget = ({ data: customer }: { data: { id: string } }) => {
  const customerId = customer?.id
  const [tags, setTags] = useState<Tag[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)

  // Tag form
  const [newTagLabel, setNewTagLabel] = useState("")
  const [newTagColor, setNewTagColor] = useState("slate")
  const [savingTag, setSavingTag] = useState(false)

  // Note form
  const [newNoteBody, setNewNoteBody] = useState("")
  const [newNotePinned, setNewNotePinned] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)

  useEffect(() => {
    if (!customerId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/admin/customers/${customerId}/tags`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : { tags: [] }))
        .catch(() => ({ tags: [] })),
      fetch(`/admin/customers/${customerId}/notes`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : { notes: [] }))
        .catch(() => ({ notes: [] })),
    ])
      .then(([t, n]) => {
        if (cancelled) return
        setTags((t.tags as Tag[]) ?? [])
        setNotes((n.notes as Note[]) ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customerId, refresh])

  const addTag = async () => {
    if (!newTagLabel.trim()) return
    setSavingTag(true)
    try {
      const r = await fetch(`/admin/customers/${customerId}/tags`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: newTagLabel.trim(), color: newTagColor }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setNewTagLabel("")
      setNewTagColor("slate")
      toast.success(`Tag "${newTagLabel}" added`)
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Add tag failed: ${e?.message ?? e}`)
    } finally {
      setSavingTag(false)
    }
  }

  const removeTag = async (id: string) => {
    try {
      const r = await fetch(`/admin/customers/${customerId}/tags/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast.success("Tag removed")
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Delete failed: ${e?.message ?? e}`)
    }
  }

  const addNote = async () => {
    if (!newNoteBody.trim()) return
    setSavingNote(true)
    try {
      const r = await fetch(`/admin/customers/${customerId}/notes`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: newNoteBody.trim(),
          pinned: newNotePinned,
        }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setNewNoteBody("")
      setNewNotePinned(false)
      setShowNoteForm(false)
      toast.success("Note saved")
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Add note failed: ${e?.message ?? e}`)
    } finally {
      setSavingNote(false)
    }
  }

  const togglePin = async (note: Note) => {
    try {
      const r = await fetch(
        `/admin/customers/${customerId}/notes/${note.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ pinned: !note.pinned }),
        }
      )
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Pin toggle failed: ${e?.message ?? e}`)
    }
  }

  const removeNote = async (id: string) => {
    if (!window.confirm("Delete this note?")) return
    try {
      const r = await fetch(`/admin/customers/${customerId}/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast.success("Note deleted")
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Delete failed: ${e?.message ?? e}`)
    }
  }

  if (!customerId) return null

  return (
    <Container className="flex flex-col gap-y-4 p-6">
      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Heading level="h2" className="text-base font-semibold">
            Tags
          </Heading>
          <Text size="xsmall" className="text-ui-fg-muted">
            {tags.length} tag{tags.length === 1 ? "" : "s"}
          </Text>
        </div>
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-x-1.5 px-2 py-1 rounded-md text-white text-xs"
                style={{ background: COLOR_HEX[t.color] ?? PALETTE.slate700 }}
              >
                {t.label}
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  className="opacity-70 hover:opacity-100"
                  aria-label={`Remove tag ${t.label}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-end gap-x-2">
          <div className="flex-1 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Label</Label>
            <Input
              value={newTagLabel}
              onChange={(e) => setNewTagLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTag()
              }}
              placeholder="VIP, Tricky, Wholesale, …"
              maxLength={30}
            />
          </div>
          <div className="flex flex-col gap-y-1 w-32">
            <Label className="text-xs text-ui-fg-subtle">Color</Label>
            <Select value={newTagColor} onValueChange={setNewTagColor}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {COLOR_OPTIONS.map((c) => (
                  <Select.Item key={c.value} value={c.value}>
                    {c.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={addTag}
            disabled={savingTag || !newTagLabel.trim()}
          >
            <Plus /> Add
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Heading level="h2" className="text-base font-semibold">
            Internal notes
          </Heading>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setShowNoteForm((v) => !v)}
          >
            {showNoteForm ? "Cancel" : "Add note"}
          </Button>
        </div>
        {showNoteForm ? (
          <div className="flex flex-col gap-y-2 mb-3 p-3 rounded bg-ui-bg-subtle/50">
            <Textarea
              rows={3}
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              placeholder="Prefers chunky satin stitch on embroidery. Always provides AI files. Wholesale account — give priority."
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <Switch
                  id="note-pinned"
                  checked={newNotePinned}
                  onCheckedChange={setNewNotePinned}
                />
                <Label htmlFor="note-pinned" className="text-xs">
                  Pin to top
                </Label>
              </div>
              <Button
                size="small"
                variant="primary"
                onClick={addNote}
                disabled={savingNote || !newNoteBody.trim()}
              >
                Save note
              </Button>
            </div>
          </div>
        ) : null}
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : notes.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No notes yet. Pin context the next person who picks up this customer should know.
          </Text>
        ) : (
          <div className="flex flex-col gap-y-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="rounded border border-ui-border-base p-3 relative"
                style={
                  n.pinned ? { background: "rgba(217,119,6,0.05)" } : undefined
                }
              >
                <Text size="small" className="whitespace-pre-wrap">
                  {n.body}
                </Text>
                <div className="flex items-center justify-between mt-2">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {n.created_by ? `${n.created_by} · ` : ""}
                    {formatRelative(n.created_at)}
                  </Text>
                  <div className="flex items-center gap-x-2">
                    <button
                      type="button"
                      onClick={() => togglePin(n)}
                      className="text-ui-fg-muted hover:text-ui-fg-base"
                      aria-label={n.pinned ? "Unpin note" : "Pin note"}
                      title={n.pinned ? "Unpin" : "Pin to top"}
                      style={
                        n.pinned ? { color: PALETTE.amber600 } : undefined
                      }
                    >
                      <PinTackSolid />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNote(n.id)}
                      className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                      aria-label="Delete note"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
})

export default CustomerTagsNotesWidget
