import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Skeleton,
  StatusBadge,
  Switch,
  Text,
  Tooltip,
} from "@medusajs/ui"
import { ArrowPath, Clock } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  DECORATION_METHOD_COLORS,
  DECORATION_METHOD_LABELS,
  PALETTE,
  STAGE_HEALTH_COLORS,
  stageHealthBand,
  type DecorationMethodKey,
} from "../../lib/reports/palette"

/* ---------- types mirrored from /admin/reports/production-snapshot ------- */

type DecorationMethod = DecorationMethodKey

type SnapshotOrder = {
  id: string
  display_id: number | string | null
  customer: string
  customer_email: string
  items_count: number
  methods: DecorationMethod[]
  garments: string[]
  total: number
  currency_code: string
  days_at_stage: number
  days_since_received: number
  is_stuck: boolean
  stage_changed_at: string | null
  sent_to_ascolour: boolean
}

type SnapshotStage = {
  stage: string
  sla_days: number | null
  count: number
  stuck_count: number
  truncated: boolean
  total_revenue: number
  average_days_at_stage: number
  orders: SnapshotOrder[]
}

type Snapshot = {
  as_of: string
  filters: {
    method: string | null
    supplier: string | null
    stuck_only: boolean
    include_done: boolean
  }
  stages: SnapshotStage[]
}

const STAGE_LABELS: Record<string, string> = {
  received: "Order received",
  art_review: "Artwork review",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
}

/** Customer-milestone collapse for the Kanban view (matches storefront stepper). */
const KANBAN_LANES: Array<{ id: string; label: string; stages: string[] }> = [
  { id: "received", label: "Received", stages: ["received"] },
  {
    id: "artwork",
    label: "Artwork",
    stages: ["art_review", "awaiting_approval"],
  },
  {
    id: "production",
    label: "In production",
    stages: [
      "approved",
      "blanks_ordered",
      "blanks_arrived",
      "in_production",
      "quality_check",
    ],
  },
  { id: "shipped", label: "Shipped", stages: ["shipped"] },
  { id: "delivered", label: "Delivered", stages: ["delivered"] },
]

const ALL_METHODS: DecorationMethod[] = [
  "screen",
  "dtf",
  "uv",
  "uvdtf_sheet",
  "uvdtf_applied",
  "embroidery",
  "blank",
]

/* ---------- formatting helpers ----------------------------------------- */

const formatCurrency = (cents: number, currency: string) => {
  // Medusa stores as decimal in major units (per the storefront's
  // normalizeOrderUnits no-op — see lib/data/orders.ts comment), so the
  // value is already in dollars-with-cents.
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase() || "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents)
  } catch {
    return `$${cents.toFixed(0)}`
  }
}

const formatRelative = (iso: string) => {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return iso
  const diff = Math.max(0, Date.now() - t)
  if (diff < 60_000) return "just now"
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return new Date(t).toLocaleString()
}

/* ---------- component -------------------------------------------------- */

/**
 * Read the initial filter state from the URL on first mount so report
 * deep links — e.g. /app/production?method=screen&stuck=1 from a chart
 * drill-through — actually filter the page on landing.
 */
const readInitialFilters = () => {
  if (typeof window === "undefined") {
    return {
      methods: new Set<DecorationMethod>(ALL_METHODS),
      supplier: "all" as const,
      stuckOnly: false,
      drillStage: null as string | null,
    }
  }
  const params = new URLSearchParams(window.location.search)
  const rawMethod = params.get("method")
  let methods = new Set<DecorationMethod>(ALL_METHODS)
  if (rawMethod) {
    const parts = rawMethod
      .split(",")
      .map((m) => m.trim())
      .filter((m): m is DecorationMethod =>
        (ALL_METHODS as readonly string[]).includes(m)
      )
    if (parts.length > 0) methods = new Set(parts)
  }
  const rawSupplier = params.get("supplier")
  const supplier: "all" | "ascolour" | "other" =
    rawSupplier === "ascolour" || rawSupplier === "other"
      ? rawSupplier
      : "all"
  const stuckOnly = params.get("stuck") === "1"
  const drillStage = params.get("stage")
  return { methods, supplier, stuckOnly, drillStage }
}

const ProductionPage = () => {
  const initial = useMemo(() => readInitialFilters(), [])
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Filter state
  const [view, setView] = useState<"list" | "kanban">("list")
  const [methods, setMethods] = useState<Set<DecorationMethod>>(initial.methods)
  const [supplier, setSupplier] = useState<"all" | "ascolour" | "other">(
    initial.supplier
  )
  const [stuckOnly, setStuckOnly] = useState(initial.stuckOnly)
  const [search, setSearch] = useState("")

  // Drill-down drawer
  const [drillStage, setDrillStage] = useState<string | null>(
    initial.drillStage
  )

  /* fetch snapshot */
  const fetchSnapshot = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      const isAllMethods =
        methods.size === ALL_METHODS.length &&
        ALL_METHODS.every((m) => methods.has(m))
      if (!isAllMethods) {
        params.set("method", Array.from(methods).join(","))
      }
      if (supplier !== "all") params.set("supplier", supplier)
      if (stuckOnly) params.set("stuck", "1")
      const qs = params.toString()
      const res = await fetch(
        `/admin/reports/production-snapshot${qs ? `?${qs}` : ""}`,
        { credentials: "include" }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Snapshot
      setSnapshot(data)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }, [methods, supplier, stuckOnly])

  useEffect(() => {
    void fetchSnapshot()
  }, [fetchSnapshot, refreshNonce])

  useEffect(() => {
    if (!autoRefresh) return
    const t = window.setInterval(() => {
      setRefreshNonce((n) => n + 1)
    }, 30_000)
    return () => window.clearInterval(t)
  }, [autoRefresh])

  /* search filter (client-side, since backend already returns ≤ 100/stage) */
  const filteredStages: SnapshotStage[] = useMemo(() => {
    if (!snapshot) return []
    const q = search.trim().toLowerCase()
    if (!q) return snapshot.stages
    return snapshot.stages.map((s) => ({
      ...s,
      orders: s.orders.filter((o) => {
        return (
          String(o.display_id ?? "").toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q)
        )
      }),
    }))
  }, [snapshot, search])

  const toggleMethod = (m: DecorationMethod) => {
    setMethods((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      // Don't allow zero — UX-wise interpret "all unchecked" as "all checked"
      // so the page never goes blank.
      if (next.size === 0) {
        return new Set(ALL_METHODS)
      }
      return next
    })
  }

  const drillStageData = useMemo(
    () => filteredStages.find((s) => s.stage === drillStage) ?? null,
    [filteredStages, drillStage]
  )

  /* ------------------------------------------------------------------- */
  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="flex flex-col gap-y-3">
        <div className="flex items-start justify-between flex-wrap gap-y-2">
          <div className="flex flex-col gap-y-1">
            <Heading level="h1">Production</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Live snapshot of orders by production stage. Built for the
              morning standup — sorted by stuck-longest first, click any
              stage header to drill in.
            </Text>
          </div>
          <div className="flex items-center gap-x-3">
            {snapshot ? (
              <Text size="small" className="text-ui-fg-muted">
                As of {formatRelative(snapshot.as_of)}
              </Text>
            ) : null}
            <div className="flex items-center gap-x-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-xs">
                Auto-refresh (30s)
              </Label>
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                window.open(
                  "/admin/reports/print-tomorrow?format=html&days=2",
                  "_blank",
                  "noopener,noreferrer"
                )
              }}
              title="Open a printable cheat sheet of orders shipping in the next 48h"
            >
              Print tomorrow
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setRefreshNonce((n) => n + 1)}
              disabled={loading}
            >
              <ArrowPath className="mr-1" /> Refresh
            </Button>
          </div>
        </div>
      </Container>

      {/* Filter bar */}
      <Container className="flex flex-col gap-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* View toggle */}
          <div className="lg:col-span-2 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">View</Label>
            <Select
              value={view}
              onValueChange={(v) => setView(v as typeof view)}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="list">Stage list</Select.Item>
                <Select.Item value="kanban">Kanban</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Supplier */}
          <div className="lg:col-span-2 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Garment supplier</Label>
            <Select
              value={supplier}
              onValueChange={(v) => setSupplier(v as typeof supplier)}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All</Select.Item>
                <Select.Item value="ascolour">AS Colour</Select.Item>
                <Select.Item value="other">Other</Select.Item>
              </Select.Content>
            </Select>
          </div>

          {/* Search */}
          <div className="lg:col-span-3 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">
              Search (order #, customer)
            </Label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              placeholder="e.g. 25, jane@example.com"
            />
          </div>

          {/* Stuck */}
          <div className="lg:col-span-2 flex items-center gap-x-2 pb-2">
            <Switch
              checked={stuckOnly}
              onCheckedChange={setStuckOnly}
              id="stuck-only"
            />
            <Label htmlFor="stuck-only">Stuck only</Label>
          </div>
        </div>

        {/* Decoration method chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <Text size="xsmall" className="text-ui-fg-subtle pr-1">
            Method
          </Text>
          {ALL_METHODS.map((m) => {
            const on = methods.has(m)
            return (
              <button
                key={m}
                onClick={() => toggleMethod(m)}
                type="button"
                className="inline-flex items-center gap-x-1 rounded-full border px-2 py-0.5 text-xs transition"
                style={{
                  background: on ? DECORATION_METHOD_COLORS[m] : "transparent",
                  color: on ? "white" : DECORATION_METHOD_COLORS[m],
                  borderColor: DECORATION_METHOD_COLORS[m],
                  opacity: on ? 1 : 0.55,
                }}
              >
                {DECORATION_METHOD_LABELS[m]}
              </button>
            )
          })}
        </div>
      </Container>

      {/* Body — error / loading / content */}
      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">
            Couldn't load production snapshot: {error}
          </Text>
        </Container>
      ) : null}

      {loading && !snapshot ? (
        <Container className="flex flex-col gap-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </Container>
      ) : null}

      {snapshot && view === "list" ? (
        <StageListView
          stages={filteredStages}
          onStageClick={(stage) => setDrillStage(stage)}
        />
      ) : null}

      {snapshot && view === "kanban" ? (
        <KanbanView stages={filteredStages} />
      ) : null}

      {/* Drill-down drawer */}
      <Drawer
        open={!!drillStage}
        onOpenChange={(open) => {
          if (!open) setDrillStage(null)
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {drillStage ? STAGE_LABELS[drillStage] ?? drillStage : ""}
            </Drawer.Title>
            <Drawer.Description>
              {drillStageData
                ? `${drillStageData.count} orders · ${drillStageData.stuck_count} stuck · avg ${drillStageData.average_days_at_stage}d at stage`
                : ""}
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body className="overflow-auto">
            {drillStageData ? (
              <div className="flex flex-col gap-y-2">
                {drillStageData.orders.map((o) => (
                  <OrderRow key={o.id} order={o} stage={drillStageData.stage} />
                ))}
                {drillStageData.truncated ? (
                  <Text size="xsmall" className="text-ui-fg-muted pt-2">
                    Showing first 100 of {drillStageData.count}. Filter to
                    narrow further.
                  </Text>
                ) : null}
              </div>
            ) : null}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}

/* ---------- views ----------------------------------------------------- */

const StageListView = ({
  stages,
  onStageClick,
}: {
  stages: SnapshotStage[]
  onStageClick: (stage: string) => void
}) => {
  return (
    <div className="flex flex-col gap-y-3">
      {stages.map((s) => (
        <StageSection key={s.stage} stage={s} onHeaderClick={onStageClick} />
      ))}
    </div>
  )
}

const StageSection = ({
  stage,
  onHeaderClick,
}: {
  stage: SnapshotStage
  onHeaderClick: (stage: string) => void
}) => {
  const [expanded, setExpanded] = useState<boolean>(stage.stuck_count > 0)
  const empty = stage.count === 0
  const headerColor =
    stage.stuck_count > 0
      ? PALETTE.amber600
      : empty
        ? PALETTE.stone400
        : PALETTE.slate700

  return (
    <Container className="flex flex-col gap-y-2 p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setExpanded((e) => !e)
        }}
        className="flex items-center justify-between gap-x-3 px-4 py-3 hover:bg-ui-bg-subtle text-left"
      >
        <div className="flex items-center gap-x-3">
          <span
            className="inline-block w-2 h-8 rounded-sm"
            style={{ background: headerColor }}
          />
          <div className="flex flex-col">
            <Text className="font-semibold">
              {STAGE_LABELS[stage.stage] ?? stage.stage}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {stage.count} {stage.count === 1 ? "order" : "orders"}
              {stage.stuck_count > 0 ? ` · ${stage.stuck_count} stuck` : ""}
              {stage.sla_days != null
                ? ` · SLA ${stage.sla_days}d, avg ${stage.average_days_at_stage}d`
                : null}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          {stage.count > 0 ? (
            <Button
              size="small"
              variant="transparent"
              onClick={(e) => {
                e.stopPropagation()
                onHeaderClick(stage.stage)
              }}
            >
              View all
            </Button>
          ) : null}
          <Text size="xsmall" className="text-ui-fg-muted">
            {expanded ? "Hide" : "Show"}
          </Text>
        </div>
      </button>
      {expanded && stage.count > 0 ? (
        <div className="flex flex-col gap-y-1 px-4 pb-4">
          {stage.orders.slice(0, 5).map((o) => (
            <OrderRow key={o.id} order={o} stage={stage.stage} />
          ))}
          {stage.count > 5 ? (
            <Button
              size="small"
              variant="transparent"
              onClick={() => onHeaderClick(stage.stage)}
              className="self-start"
            >
              View remaining {stage.count - 5} →
            </Button>
          ) : null}
        </div>
      ) : null}
    </Container>
  )
}

const KanbanView = ({ stages }: { stages: SnapshotStage[] }) => {
  // Map 10 stages → 5 lanes
  const stageMap = new Map(stages.map((s) => [s.stage, s]))
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 px-4">
      {KANBAN_LANES.map((lane) => {
        const laneStages = lane.stages
          .map((s) => stageMap.get(s))
          .filter((s): s is SnapshotStage => Boolean(s))
        const orders = laneStages.flatMap((s) =>
          s.orders.map((o) => ({ ...o, _stage: s.stage }))
        )
        const count = laneStages.reduce((acc, s) => acc + s.count, 0)
        const stuck = laneStages.reduce((acc, s) => acc + s.stuck_count, 0)

        return (
          <div
            key={lane.id}
            className="flex flex-col rounded-lg border border-ui-border-base bg-ui-bg-subtle/30 min-h-[200px]"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-ui-border-base">
              <Text className="font-semibold">{lane.label}</Text>
              <div className="flex items-center gap-x-1">
                <Badge size="2xsmall">{count}</Badge>
                {stuck > 0 ? (
                  <Tooltip content={`${stuck} stuck`}>
                    <Badge
                      size="2xsmall"
                      color="orange"
                    >
                      ⚠ {stuck}
                    </Badge>
                  </Tooltip>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-y-2 p-2 overflow-auto max-h-[600px]">
              {orders.slice(0, 30).map((o) => (
                <KanbanCard key={o.id} order={o} stage={o._stage} />
              ))}
              {orders.length === 0 ? (
                <Text size="xsmall" className="text-ui-fg-muted px-1">
                  Nothing in this lane.
                </Text>
              ) : null}
              {orders.length > 30 ? (
                <Text size="xsmall" className="text-ui-fg-muted px-1">
                  +{orders.length - 30} more not shown — switch to Stage list
                  to see all.
                </Text>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- order display widgets ------------------------------------- */

const OrderRow = ({
  order,
  stage,
}: {
  order: SnapshotOrder
  stage: string
}) => {
  const band = stageHealthBand(stage, order.days_at_stage)
  const bandColor = STAGE_HEALTH_COLORS[band]

  return (
    <a
      href={`/app/orders/${order.id}`}
      className="flex items-center gap-x-3 px-3 py-2 rounded-md border border-ui-border-base hover:bg-ui-bg-subtle transition"
    >
      <div className="flex flex-col w-24 shrink-0">
        <Text size="small" className="font-mono">
          #{order.display_id ?? order.id.slice(-6)}
        </Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          {order.items_count} items
        </Text>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <Text size="small" className="font-medium truncate">
          {order.customer}
        </Text>
        <Text size="xsmall" className="text-ui-fg-muted truncate">
          {order.garments.slice(0, 2).join(", ")}
          {order.garments.length > 2
            ? ` +${order.garments.length - 2} more`
            : ""}
        </Text>
      </div>
      <div className="flex flex-wrap gap-1 max-w-[140px]">
        {order.methods.slice(0, 3).map((m) => (
          <span
            key={m}
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: DECORATION_METHOD_COLORS[m],
              color: "white",
            }}
          >
            {DECORATION_METHOD_LABELS[m]}
          </span>
        ))}
      </div>
      <div className="flex flex-col items-end shrink-0 w-24">
        <Tooltip content={`SLA band: ${band}`}>
          <Text
            size="small"
            className="font-medium tabular-nums"
            style={{ color: bandColor }}
          >
            <Clock className="inline-block mr-1" />
            {order.days_at_stage}d
          </Text>
        </Tooltip>
        <Text size="xsmall" className="text-ui-fg-muted tabular-nums">
          {formatCurrency(order.total, order.currency_code)}
        </Text>
      </div>
      {order.sent_to_ascolour ? (
        <Tooltip content="Sent to AS Colour">
          <StatusBadge color="blue">AC</StatusBadge>
        </Tooltip>
      ) : null}
    </a>
  )
}

const KanbanCard = ({
  order,
  stage,
}: {
  order: SnapshotOrder
  stage: string
}) => {
  const band = stageHealthBand(stage, order.days_at_stage)
  const bandColor = STAGE_HEALTH_COLORS[band]
  return (
    <a
      href={`/app/orders/${order.id}`}
      className="flex flex-col gap-y-1 p-2 rounded-md bg-ui-bg-base border border-ui-border-base hover:border-ui-border-strong"
    >
      <div className="flex items-center justify-between">
        <Text size="small" className="font-mono">
          #{order.display_id ?? order.id.slice(-6)}
        </Text>
        <Text
          size="xsmall"
          className="tabular-nums"
          style={{ color: bandColor }}
        >
          {order.days_at_stage}d
        </Text>
      </div>
      <Text size="xsmall" className="truncate">
        {order.customer}
      </Text>
      <div className="flex flex-wrap gap-1">
        {order.methods.slice(0, 2).map((m) => (
          <span
            key={m}
            className="text-[10px] px-1 rounded"
            style={{
              background: DECORATION_METHOD_COLORS[m],
              color: "white",
            }}
          >
            {DECORATION_METHOD_LABELS[m]}
          </span>
        ))}
      </div>
    </a>
  )
}

export const config = defineRouteConfig({
  label: "Production",
  icon: Clock,
})

export default ProductionPage
