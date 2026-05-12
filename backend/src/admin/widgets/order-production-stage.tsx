import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Button, Container, Heading, Input, Text, Textarea } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ARTWORK_STAGES,
  ARTWORK_STAGE_LABEL,
  ARTWORK_STAGES_THAT_EMAIL,
  BLANKS_STAGES,
  BLANKS_STAGE_LABEL,
  BLANKS_STAGES_THAT_EMAIL,
  DOWNSTREAM_STAGES,
  DOWNSTREAM_STAGE_LABEL,
  DOWNSTREAM_STAGES_THAT_EMAIL,
  PRODUCTION_STAGE_LABEL,
  deriveTracksFromLegacyStage,
  isArtworkStage,
  isBlanksStage,
  isDownstreamStage,
  isProductionStage,
  type ArtworkStage,
  type BlanksStage,
  type DownstreamStage,
  type ProductionStage,
  type ProductionStageHistoryEntry,
  type ProductionTrack,
} from "../../lib/production-stage"

const adminPath = (orderId: string) => `/admin/orders/${orderId}/production-stage`
const dueDatePath = (orderId: string) => `/admin/orders/${orderId}/production-due-date`

type StatusPayload = {
  production_stage: ProductionStage | null
  production_stage_changed_at: string | null
  production_stage_history: ProductionStageHistoryEntry[]
  artwork_stage: ArtworkStage
  artwork_stage_changed_at: string | null
  blanks_stage: BlanksStage
  blanks_stage_changed_at: string | null
  production_due_date?: string | null
}

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return "—"
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return "—"
  return new Date(ts).toLocaleString()
}

const artworkBadgeColor = (s: ArtworkStage): "grey" | "blue" | "orange" | "green" => {
  if (s === "approved") return "green"
  if (s === "awaiting_approval") return "orange"
  if (s === "in_review") return "blue"
  return "grey"
}
const blanksBadgeColor = (s: BlanksStage): "grey" | "blue" | "green" => {
  if (s === "arrived") return "green"
  if (s === "ordered") return "blue"
  return "grey"
}
const downstreamBadgeColor = (s: DownstreamStage): "grey" | "blue" | "green" => {
  if (s === "delivered") return "green"
  if (s === "shipped" || s === "in_production" || s === "quality_check") return "blue"
  return "grey"
}

type HistoryFilter = "all" | ProductionTrack

const trackOfEntry = (entry: ProductionStageHistoryEntry): ProductionTrack => {
  if (entry.track) return entry.track
  if (isArtworkStage(entry.stage) || entry.stage === "art_review") return "artwork"
  if (
    isBlanksStage(entry.stage) ||
    entry.stage === "blanks_ordered" ||
    entry.stage === "blanks_arrived"
  ) {
    return "blanks"
  }
  return "production"
}

const OrderProductionStageWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id

  const initialTracks = useMemo(() => {
    const meta = (data?.metadata ?? {}) as Record<string, unknown>
    const stageRaw = meta.production_stage
    const stage = isProductionStage(stageRaw) ? stageRaw : null
    const derived = deriveTracksFromLegacyStage(stage)
    return {
      artwork: isArtworkStage(meta.artwork_stage) ? (meta.artwork_stage as ArtworkStage) : derived.artwork_stage,
      blanks: isBlanksStage(meta.blanks_stage) ? (meta.blanks_stage as BlanksStage) : derived.blanks_stage,
      downstream: isDownstreamStage(stage) ? (stage as DownstreamStage) : derived.production_stage,
    }
  }, [data?.metadata])

  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [pendingArtwork, setPendingArtwork] = useState<ArtworkStage>(initialTracks.artwork)
  const [pendingBlanks, setPendingBlanks] = useState<BlanksStage>(initialTracks.blanks)
  const [pendingDownstream, setPendingDownstream] = useState<DownstreamStage>(initialTracks.downstream)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all")

  const [dueDate, setDueDate] = useState<string>("")
  const [savingDue, setSavingDue] = useState(false)
  const [dueError, setDueError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(adminPath(orderId), {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      const body = (await res.json().catch(() => ({}))) as StatusPayload & { message?: string }
      if (!res.ok) {
        throw new Error((body as any)?.message || `HTTP ${res.status}`)
      }
      setStatus(body)
      if (body.artwork_stage) setPendingArtwork(body.artwork_stage)
      if (body.blanks_stage) setPendingBlanks(body.blanks_stage)
      const downstream = isDownstreamStage(body.production_stage)
        ? (body.production_stage as DownstreamStage)
        : deriveTracksFromLegacyStage(body.production_stage).production_stage
      setPendingDownstream(downstream)
      if (body.production_due_date) {
        setDueDate(body.production_due_date.slice(0, 10))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load production stage")
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const currentArtwork = status?.artwork_stage ?? initialTracks.artwork
  const currentBlanks = status?.blanks_stage ?? initialTracks.blanks
  const currentDownstream: DownstreamStage = (() => {
    if (status?.production_stage && isDownstreamStage(status.production_stage)) {
      return status.production_stage as DownstreamStage
    }
    return initialTracks.downstream
  })()

  const artworkChanged = pendingArtwork !== currentArtwork
  const blanksChanged = pendingBlanks !== currentBlanks
  const downstreamChanged = pendingDownstream !== currentDownstream
  const anyChange = artworkChanged || blanksChanged || downstreamChanged

  const willEmailArtwork = artworkChanged && ARTWORK_STAGES_THAT_EMAIL.has(pendingArtwork)
  const willEmailBlanks = blanksChanged && BLANKS_STAGES_THAT_EMAIL.has(pendingBlanks)
  const willEmailDownstream = downstreamChanged && DOWNSTREAM_STAGES_THAT_EMAIL.has(pendingDownstream)
  const willEmail = willEmailArtwork || willEmailBlanks || willEmailDownstream

  const save = useCallback(async () => {
    if (!orderId) return
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = { note: note.trim() || undefined }
      if (artworkChanged) payload.artwork_stage = pendingArtwork
      if (blanksChanged) payload.blanks_stage = pendingBlanks
      if (downstreamChanged) payload.production_stage = pendingDownstream

      const res = await fetch(adminPath(orderId), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
      const body = (await res.json().catch(() => ({}))) as StatusPayload & {
        message?: string
        ok?: boolean
        changed?: boolean
      }
      if (!res.ok) {
        throw new Error((body as any)?.message || `HTTP ${res.status}`)
      }
      setStatus((prev) => ({
        production_stage: body.production_stage,
        production_stage_changed_at: body.production_stage_changed_at,
        production_stage_history: body.production_stage_history ?? prev?.production_stage_history ?? [],
        artwork_stage: body.artwork_stage ?? pendingArtwork,
        artwork_stage_changed_at: prev?.artwork_stage_changed_at ?? null,
        blanks_stage: body.blanks_stage ?? pendingBlanks,
        blanks_stage_changed_at: prev?.blanks_stage_changed_at ?? null,
        production_due_date: prev?.production_due_date ?? null,
      }))
      setNote("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update production stage")
    } finally {
      setSaving(false)
    }
  }, [orderId, note, artworkChanged, blanksChanged, downstreamChanged, pendingArtwork, pendingBlanks, pendingDownstream])

  const saveDueDate = useCallback(async () => {
    if (!orderId) return
    setSavingDue(true)
    setDueError(null)
    try {
      const res = await fetch(dueDatePath(orderId), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ due_date: dueDate || null }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (e) {
      setDueError(e instanceof Error ? e.message : "Failed to save due date")
    } finally {
      setSavingDue(false)
    }
  }, [orderId, dueDate])

  const filteredHistory = useMemo(() => {
    const all = status?.production_stage_history ?? []
    if (historyFilter === "all") return all
    return all.filter((e) => trackOfEntry(e) === historyFilter)
  }, [status?.production_stage_history, historyFilter])

  if (!orderId) return null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">Production stage</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Artwork approval and blanks ordering run in parallel. Customer emails fire on
            milestones flagged below.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Badge color={artworkBadgeColor(currentArtwork)}>
            Artwork: {ARTWORK_STAGE_LABEL[currentArtwork]}
          </Badge>
          <Badge color={blanksBadgeColor(currentBlanks)}>
            Blanks: {BLANKS_STAGE_LABEL[currentBlanks]}
          </Badge>
          <Badge color={downstreamBadgeColor(currentDownstream)}>
            {DOWNSTREAM_STAGE_LABEL[currentDownstream]}
          </Badge>
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-4">
        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <label className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">Artwork track</Text>
            <select
              value={pendingArtwork}
              onChange={(e) => setPendingArtwork(e.target.value as ArtworkStage)}
              disabled={saving || loading}
              className="bg-ui-bg-base border border-ui-border-base rounded-md px-3 py-2 text-ui-fg-base text-small focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive disabled:opacity-60"
            >
              {ARTWORK_STAGES.map((s) => (
                <option key={s} value={s}>
                  {ARTWORK_STAGE_LABEL[s]}
                  {ARTWORK_STAGES_THAT_EMAIL.has(s) ? " — emails customer" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">Blanks track</Text>
            <select
              value={pendingBlanks}
              onChange={(e) => setPendingBlanks(e.target.value as BlanksStage)}
              disabled={saving || loading}
              className="bg-ui-bg-base border border-ui-border-base rounded-md px-3 py-2 text-ui-fg-base text-small focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive disabled:opacity-60"
            >
              {BLANKS_STAGES.map((s) => (
                <option key={s} value={s}>
                  {BLANKS_STAGE_LABEL[s]}
                  {BLANKS_STAGES_THAT_EMAIL.has(s) ? " — emails customer" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-y-1">
            <Text size="small" weight="plus">Production</Text>
            <select
              value={pendingDownstream}
              onChange={(e) => setPendingDownstream(e.target.value as DownstreamStage)}
              disabled={saving || loading}
              className="bg-ui-bg-base border border-ui-border-base rounded-md px-3 py-2 text-ui-fg-base text-small focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive disabled:opacity-60"
            >
              {DOWNSTREAM_STAGES.map((s) => (
                <option key={s} value={s}>
                  {DOWNSTREAM_STAGE_LABEL[s]}
                  {DOWNSTREAM_STAGES_THAT_EMAIL.has(s) ? " — emails customer" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            Note (optional, internal)
          </Text>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Recorded on every track that changes. Not sent to customer."
            rows={2}
            disabled={saving}
          />
        </label>

        <div className="flex items-center justify-between">
          <Text size="xsmall" className="text-ui-fg-subtle">
            {willEmail ? (
              <span className="text-ui-fg-interactive">An email will be sent on save.</span>
            ) : !anyChange ? (
              "No change to apply."
            ) : (
              "No customer email for these transitions."
            )}
          </Text>
          <Button onClick={save} disabled={saving || !anyChange}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="px-6 py-4 flex flex-col gap-y-2">
        <Text size="small" weight="plus">
          Production due date
        </Text>
        <div className="flex items-center gap-x-2">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={savingDue}
            className="w-44"
          />
          <Button size="small" variant="secondary" onClick={saveDueDate} disabled={savingDue}>
            {savingDue ? "Saving…" : "Save"}
          </Button>
          {dueDate ? (
            <Button
              size="small"
              variant="transparent"
              onClick={async () => {
                if (!orderId) return
                setDueDate("")
                setSavingDue(true)
                setDueError(null)
                try {
                  const res = await fetch(dueDatePath(orderId), {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ due_date: null }),
                  })
                  if (!res.ok) throw new Error(`HTTP ${res.status}`)
                } catch (e) {
                  setDueError(e instanceof Error ? e.message : "Failed to clear due date")
                } finally {
                  setSavingDue(false)
                }
              }}
              disabled={savingDue}
            >
              Clear
            </Button>
          ) : null}
        </div>
        {dueError ? <Text size="xsmall" className="text-ui-fg-error">{dueError}</Text> : null}
        <Text size="xsmall" className="text-ui-fg-subtle">
          Sets the target completion date. Also draggable on the Production calendar view.
        </Text>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <Text size="small" weight="plus">History</Text>
          <div className="flex items-center gap-x-1">
            {(["all", "artwork", "blanks", "production"] as HistoryFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHistoryFilter(f)}
                className={`text-xsmall px-2 py-1 rounded-md border ${
                  historyFilter === f
                    ? "bg-ui-bg-interactive text-ui-fg-on-color border-ui-border-interactive"
                    : "bg-ui-bg-base text-ui-fg-subtle border-ui-border-base"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {filteredHistory.length ? (
          <ul className="list-none p-0 m-0 flex flex-col gap-y-2">
            {[...filteredHistory].reverse().map((entry, idx) => (
              <li
                key={`${entry.changed_at}-${idx}`}
                className="rounded-md bg-ui-bg-subtle px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-x-3">
                  <div className="flex items-center gap-x-2">
                    <Badge size="xsmall" color="grey">
                      {trackOfEntry(entry)}
                    </Badge>
                    <Text size="small" weight="plus">
                      {PRODUCTION_STAGE_LABEL[entry.stage]}
                    </Text>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {formatDate(entry.changed_at)}
                  </Text>
                </div>
                {entry.changed_by ? (
                  <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
                    by {entry.changed_by}
                  </Text>
                ) : null}
                {entry.note ? (
                  <Text size="xsmall" className="text-ui-fg-subtle mt-1">
                    {entry.note}
                  </Text>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <Text size="small" className="text-ui-fg-subtle">
            No stage changes recorded yet.
          </Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderProductionStageWidget
