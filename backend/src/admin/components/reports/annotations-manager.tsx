import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"
import { Trash } from "@medusajs/icons"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"

type Annotation = {
  id: string
  date: string
  label: string
  description: string | null
  color: string
  created_at: string
}

const COLOR_OPTIONS = [
  { value: "slate", label: "Slate", hex: PALETTE.slate700 },
  { value: "teal", label: "Teal", hex: PALETTE.teal700 },
  { value: "amber", label: "Amber (warning)", hex: PALETTE.amber600 },
  { value: "rose", label: "Rose (incident)", hex: PALETTE.rose600 },
  { value: "emerald", label: "Emerald (positive)", hex: PALETTE.emerald600 },
] as const

export const COLOR_HEX_BY_KEY: Record<string, string> = {
  slate: PALETTE.slate700,
  teal: PALETTE.teal700,
  amber: PALETTE.amber600,
  rose: PALETTE.rose600,
  emerald: PALETTE.emerald600,
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export const AnnotationsManager = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)

  // Form state
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("slate")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/admin/reports/annotations`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { annotations: [] }))
      .then((j) => {
        if (cancelled) return
        setAnnotations((j?.annotations as Annotation[]) ?? [])
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshNonce])

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/admin/reports/annotations`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date,
          label: label.trim(),
          description: description.trim() || undefined,
          color,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setLabel("")
      setDescription("")
      setColor("slate")
      setShowForm(false)
      setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("Delete this annotation? It will disappear from every chart.")) return
    try {
      const res = await fetch(`/admin/reports/annotations/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }

  return (
    <Container className="flex flex-col gap-y-3 p-4">
      <div className="flex items-center justify-between gap-x-3">
        <div>
          <Heading level="h2" className="text-base font-semibold">
            Annotations
          </Heading>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Pin events to dates so future-you reads patterns instead of
            unexplained spikes. Visible on every time-series chart.
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "Add annotation"}
        </Button>
      </div>

      {error ? (
        <Text size="xsmall" className="text-ui-tag-red-icon">
          {error}
        </Text>
      ) : null}

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-ui-bg-subtle/50 rounded">
          <div className="lg:col-span-3 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">
              Label (≤ 80 chars)
            </Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Black Friday weekend"
              maxLength={80}
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Color</Label>
            <Select value={color} onValueChange={setColor}>
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
          <div className="lg:col-span-2 flex flex-col gap-y-1 lg:justify-end">
            <Button
              size="base"
              variant="primary"
              onClick={submit}
              disabled={submitting || label.trim().length === 0}
            >
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
          <div className="lg:col-span-12 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">
              Description (optional)
            </Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="20% off site-wide promo. Inventory pulled forward to cover demand."
            />
          </div>
        </div>
      ) : null}

      {loading ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Loading…
        </Text>
      ) : annotations.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No annotations yet. Add one to start building a timeline of context.
        </Text>
      ) : (
        <div className="flex flex-wrap gap-2">
          {annotations.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-x-2 px-2 py-1 rounded border border-ui-border-base bg-ui-bg-base"
              title={a.description ?? a.label}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: COLOR_HEX_BY_KEY[a.color] ?? PALETTE.slate700,
                }}
              />
              <Text size="xsmall" className="font-medium">
                {formatDate(a.date)}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle truncate max-w-[260px]">
                {a.label}
              </Text>
              <button
                type="button"
                aria-label="Delete annotation"
                onClick={() => remove(a.id)}
                className="text-ui-fg-muted hover:text-ui-tag-red-icon"
              >
                <Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
