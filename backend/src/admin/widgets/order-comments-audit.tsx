import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { Button, Container, Heading, Tabs, Text, Textarea, toast } from "@medusajs/ui"
import { Trash } from "@medusajs/icons"
import { useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"

import { PALETTE } from "../lib/reports/palette"

type Comment = {
  id: string
  body: string
  created_by: string | null
  created_at: string
}

type AuditEntry = {
  id: string
  action: string
  actor_id: string | null
  actor_email: string | null
  details: any
  created_at: string
}

const STAGE_LABELS: Record<string, string> = {
  received: "Received",
  art_review: "Art review",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
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

const renderAuditDetails = (e: AuditEntry): string => {
  if (e.action === "stage_changed") {
    const from = e.details?.from_stage
      ? STAGE_LABELS[e.details.from_stage] ?? e.details.from_stage
      : null
    const to = e.details?.to_stage
      ? STAGE_LABELS[e.details.to_stage] ?? e.details.to_stage
      : "?"
    return from ? `${from} → ${to}` : `Set to ${to}`
  }
  return JSON.stringify(e.details ?? {})
}

const OrderCommentsAuditWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [comments, setComments] = useState<Comment[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [newBody, setNewBody] = useState("")
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/admin/orders/${orderId}/comments`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : { comments: [] }))
        .catch(() => ({ comments: [] })),
      fetch(`/admin/orders/${orderId}/audit-log`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : { entries: [] }))
        .catch(() => ({ entries: [] })),
    ])
      .then(([c, a]) => {
        if (cancelled) return
        setComments((c.comments as Comment[]) ?? [])
        setAudit((a.entries as AuditEntry[]) ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [orderId, refresh])

  const post = async () => {
    if (!newBody.trim()) return
    setPosting(true)
    try {
      const r = await fetch(`/admin/orders/${orderId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: newBody.trim() }),
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      setNewBody("")
      toast.success("Comment posted")
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Post failed: ${e?.message ?? e}`)
    } finally {
      setPosting(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("Delete this comment?")) return
    try {
      const r = await fetch(`/admin/orders/${orderId}/comments/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      toast.success("Comment deleted")
      setRefresh((n) => n + 1)
    } catch (e: any) {
      toast.error(`Delete failed: ${e?.message ?? e}`)
    }
  }

  if (!orderId) return null

  return (
    <Container className="flex flex-col gap-y-3 p-6">
      <Heading level="h2" className="text-base font-semibold flex items-center">
        Comments &amp; activity
        <HelpTooltip
          text={{
            title: "Comments & activity",
            body: "Internal comments and an audit trail of every event on this order. Not visible to the customer.",
            bullets: [
              "@mention a staff member's email to notify them directly.",
              "The Activity tab shows system events: stage changes, emails sent, and Medusa order events.",
            ],
          }}
        />
      </Heading>

      <Tabs defaultValue="comments">
        <Tabs.List>
          <Tabs.Trigger value="comments">
            Comments {comments.length > 0 ? `(${comments.length})` : ""}
          </Tabs.Trigger>
          <Tabs.Trigger value="activity">
            Activity {audit.length > 0 ? `(${audit.length})` : ""}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="comments">
          <div className="flex flex-col gap-y-2 mt-3">
            {loading ? (
              <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
            ) : comments.length === 0 ? (
              <Text size="xsmall" className="text-ui-fg-muted">
                No comments yet. Drop notes for the next person who picks this up.
              </Text>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded border border-ui-border-base p-3 group"
                >
                  <Text size="small" className="whitespace-pre-wrap">
                    {c.body.split(/(@\S+)/g).map((part, i) =>
                      part.startsWith("@") ? (
                        <span
                          key={i}
                          style={{ color: PALETTE.teal700, fontWeight: 600 }}
                        >
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </Text>
                  <div className="flex items-center justify-between mt-2">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {c.created_by ? `${c.created_by} · ` : ""}
                      {formatRelative(c.created_at)}
                    </Text>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="text-ui-fg-muted hover:text-ui-tag-red-icon opacity-0 group-hover:opacity-100"
                      aria-label="Delete comment"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="flex flex-col gap-y-2 mt-2">
              <Textarea
                rows={3}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Art ready for QC, @sean please review."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    post()
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <Text size="xsmall" className="text-ui-fg-muted">
                  ⌘↵ to send · @email to mention
                </Text>
                <Button
                  size="small"
                  variant="primary"
                  onClick={post}
                  disabled={posting || !newBody.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="activity">
          <div className="flex flex-col gap-y-1 mt-3">
            {loading ? (
              <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
            ) : audit.length === 0 ? (
              <Text size="xsmall" className="text-ui-fg-muted">
                No tracked activity yet. Stage changes will appear here once
                they happen.
              </Text>
            ) : (
              audit.map((e) => (
                <div
                  key={e.id}
                  className="flex items-baseline gap-x-2 py-1.5 border-b border-ui-border-base"
                >
                  <Text size="xsmall" className="text-ui-fg-muted w-20 shrink-0">
                    {formatRelative(e.created_at)}
                  </Text>
                  <Text size="small" className="flex-1">
                    <strong>{e.action.replace(/_/g, " ")}</strong>
                    {e.action === "stage_changed" ? (
                      <span className="text-ui-fg-muted ml-1">
                        {renderAuditDetails(e)}
                      </span>
                    ) : null}
                  </Text>
                  {e.actor_email || e.actor_id ? (
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {e.actor_email ?? e.actor_id}
                    </Text>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderCommentsAuditWidget, "order-comments-audit")
