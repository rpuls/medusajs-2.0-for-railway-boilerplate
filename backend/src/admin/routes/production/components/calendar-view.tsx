import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Text,
  Tooltip,
} from "@medusajs/ui"
import { useCallback, useMemo, useState } from "react"

import { CapacityChart } from "../../../components/reports/capacity-chart"
import { SlaBreachChart } from "../../../components/reports/sla-breach-chart"
import { TimeInStageChart } from "../../../components/reports/time-in-stage-chart"
import {
  DECORATION_METHOD_COLORS,
  DECORATION_METHOD_LABELS,
  PALETTE,
  STAGE_SLA_DAYS,
  STAGE_HEALTH_COLORS,
  stageHealthBand,
  type DecorationMethodKey,
} from "../../../lib/reports/palette"

/* ---------- types (mirrors SnapshotOrder / SnapshotStage from page.tsx) --- */

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
  production_due_date: string | null
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

type OrderWithStage = SnapshotOrder & { stage: string }

/* ---------- pure date helpers --------------------------------------------- */

const getWeekStart = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay() // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + offset)
  return d
}

const addDays = (date: Date, n: number): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const getWeekDays = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

const startOfDay = (date: Date): Date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const formatYMD = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const columnId = (date: Date): string => `day-${formatYMD(date)}`

const formatColHeader = (date: Date): string =>
  date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" })

const formatWeekRange = (weekStart: Date): string => {
  const end = addDays(weekStart, 6)
  const startStr = weekStart.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  })
  const endStr = end.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return `${startStr} – ${endStr}`
}

const formatMonthYear = (date: Date): string =>
  date.toLocaleDateString("en-AU", { month: "long", year: "numeric" })

const getMonthGrid = (anchor: Date): Date[] => {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const start = getWeekStart(first)
  // extend to include complete final week
  const endDow = last.getDay()
  const end = endDow === 0 ? last : addDays(last, 7 - endDow)
  const days: Date[] = []
  let cur = new Date(start)
  while (cur <= end) {
    days.push(new Date(cur))
    cur = addDays(cur, 1)
  }
  return days
}

const formatCurrency = (cents: number, currency: string) => {
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

/* ---------- CalendarCard (visual only — no DnD hooks) --------------------- */

const CalendarCard = ({
  order,
  onClick,
  isDragging = false,
}: {
  order: OrderWithStage
  onClick?: () => void
  isDragging?: boolean
}) => {
  const band = stageHealthBand(order.stage, order.days_at_stage)
  const bandColor = STAGE_HEALTH_COLORS[band]
  const stageLabel = STAGE_LABELS[order.stage] ?? order.stage

  return (
    <div
      onClick={onClick}
      className="rounded-md border border-ui-border-base bg-ui-bg-base hover:border-ui-border-strong transition cursor-pointer"
      style={{
        borderLeft: `4px solid ${bandColor}`,
        opacity: isDragging ? 0.85 : 1,
        userSelect: "none",
      }}
    >
      <div className="flex flex-col gap-y-0.5 px-2 py-1.5">
        <div className="flex items-center justify-between gap-x-1">
          <Text size="small" className="font-mono font-medium">
            #{order.display_id ?? order.id.slice(-6)}
          </Text>
          <Text
            size="xsmall"
            className="tabular-nums shrink-0"
            style={{ color: bandColor }}
          >
            {order.days_at_stage}d
          </Text>
        </div>
        <Text size="xsmall" className="truncate text-ui-fg-subtle">
          {order.customer}
        </Text>
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          <span
            className="text-[9px] px-1 py-0.5 rounded"
            style={{ background: PALETTE.stone200, color: PALETTE.slate700 }}
          >
            {stageLabel}
          </span>
          {order.methods.slice(0, 2).map((m) => (
            <span
              key={m}
              className="text-[9px] px-1 py-0.5 rounded"
              style={{
                background: DECORATION_METHOD_COLORS[m],
                color: "white",
              }}
            >
              {DECORATION_METHOD_LABELS[m]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
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

/* ---------- DraggableCard ------------------------------------------------- */

const DraggableCard = ({
  order,
  onClick,
}: {
  order: OrderWithStage
  onClick: () => void
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      <CalendarCard order={order} onClick={onClick} />
    </div>
  )
}

/* ---------- DroppableColumn ----------------------------------------------- */

const DroppableColumn = ({
  id,
  header,
  subheader,
  orders,
  isToday,
  isOverdue,
  onCardClick,
}: {
  id: string
  header: string
  subheader?: string
  orders: OrderWithStage[]
  isToday?: boolean
  isOverdue?: boolean
  onCardClick: (order: OrderWithStage) => void
}) => {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col rounded-lg border min-h-[120px] transition"
      style={{
        borderColor: isOver
          ? PALETTE.teal500
          : isOverdue
            ? PALETTE.rose600
            : isToday
              ? PALETTE.teal500
              : undefined,
        background: isOver
          ? `${PALETTE.teal500}0d`
          : isOverdue
            ? `${PALETTE.rose600}08`
            : isToday
              ? `${PALETTE.teal500}08`
              : undefined,
      }}
    >
      {/* Column header */}
      <div
        className="px-2 py-1.5 border-b border-ui-border-base"
        style={{
          background: isToday ? `${PALETTE.teal500}18` : undefined,
        }}
      >
        <Text
          size="xsmall"
          className="font-semibold"
          style={{
            color: isOverdue
              ? PALETTE.rose600
              : isToday
                ? PALETTE.teal700
                : undefined,
          }}
        >
          {header}
        </Text>
        {subheader ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            {subheader}
          </Text>
        ) : null}
        {orders.length > 0 ? (
          <Badge size="2xsmall" className="mt-0.5">
            {orders.length}
          </Badge>
        ) : null}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-y-1.5 p-1.5 flex-1">
        {orders.map((o) => (
          <DraggableCard key={o.id} order={o} onClick={() => onCardClick(o)} />
        ))}
        {orders.length === 0 ? (
          <Text
            size="xsmall"
            className="text-ui-fg-muted px-1 pt-1 text-center opacity-50"
          >
            —
          </Text>
        ) : null}
      </div>
    </div>
  )
}

/* ---------- OrderDetailDrawer --------------------------------------------- */

const OrderDetailDrawer = ({
  order,
  onClose,
}: {
  order: OrderWithStage | null
  onClose: () => void
}) => {
  if (!order) return null
  const band = stageHealthBand(order.stage, order.days_at_stage)
  const bandColor = STAGE_HEALTH_COLORS[band]

  return (
    <Drawer open={!!order} onOpenChange={(o) => { if (!o) onClose() }}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            Order #{order.display_id ?? order.id.slice(-6)}
          </Drawer.Title>
          <Drawer.Description>{order.customer}</Drawer.Description>
        </Drawer.Header>
        <Drawer.Body className="overflow-auto">
          <div className="flex flex-col gap-y-4 p-1">
            {/* Stage */}
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle font-medium uppercase tracking-wider">
                Stage
              </Text>
              <div className="flex items-center gap-x-2">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: bandColor }}
                />
                <Text size="small">
                  {STAGE_LABELS[order.stage] ?? order.stage}
                </Text>
                <Text size="xsmall" style={{ color: bandColor }}>
                  {order.days_at_stage}d at stage
                  {order.is_stuck ? " · stuck" : ""}
                </Text>
              </div>
            </div>

            {/* Due date */}
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle font-medium uppercase tracking-wider">
                Due date
              </Text>
              <Text size="small">
                {order.production_due_date
                  ? new Date(order.production_due_date).toLocaleDateString(
                      "en-AU",
                      { weekday: "short", day: "numeric", month: "short", year: "numeric" }
                    )
                  : (() => {
                      const sla = (STAGE_SLA_DAYS as Record<string, number | null>)[order.stage]
                      if (sla != null && order.stage_changed_at) {
                        const est = new Date(
                          new Date(order.stage_changed_at).getTime() + sla * 86400000
                        )
                        return `${est.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })} (estimated)`
                      }
                      return "Not set"
                    })()}
              </Text>
            </div>

            {/* Customer */}
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle font-medium uppercase tracking-wider">
                Customer
              </Text>
              <Text size="small">{order.customer}</Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                {order.customer_email}
              </Text>
            </div>

            {/* Garments */}
            {order.garments.length > 0 ? (
              <div className="flex flex-col gap-y-1">
                <Text size="xsmall" className="text-ui-fg-subtle font-medium uppercase tracking-wider">
                  Garments
                </Text>
                <div className="flex flex-col gap-y-0.5">
                  {order.garments.map((g, i) => (
                    <Text key={i} size="small">{g}</Text>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Methods */}
            {order.methods.length > 0 ? (
              <div className="flex flex-col gap-y-1">
                <Text size="xsmall" className="text-ui-fg-subtle font-medium uppercase tracking-wider">
                  Decoration
                </Text>
                <div className="flex flex-wrap gap-1">
                  {order.methods.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: DECORATION_METHOD_COLORS[m], color: "white" }}
                    >
                      {DECORATION_METHOD_LABELS[m]}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Value */}
            <div className="flex flex-col gap-y-1">
              <Text size="xsmall" className="text-ui-fg-subtle font-medium uppercase tracking-wider">
                Order value
              </Text>
              <Text size="small" className="font-medium">
                {formatCurrency(order.total, order.currency_code)}
              </Text>
            </div>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Button
            size="small"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            size="small"
            onClick={() => {
              window.open(`/app/orders/${order.id}`, "_blank", "noopener,noreferrer")
            }}
          >
            Open order →
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

/* ---------- SummaryStrip -------------------------------------------------- */

const SummaryStrip = ({
  open,
  onToggle,
  fromIso,
  toIso,
}: {
  open: boolean
  onToggle: () => void
  fromIso: string
  toIso: string
}) => (
  <Container className="p-0 overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-x-2 w-full px-4 py-2.5 hover:bg-ui-bg-subtle text-left border-b border-ui-border-base"
    >
      <Text size="xsmall" className="font-medium text-ui-fg-subtle">
        {open ? "▼" : "▶"} Production summary
      </Text>
      <Text size="xsmall" className="text-ui-fg-muted">
        Capacity · SLA breach · Time in stage
      </Text>
    </button>
    {open ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <CapacityChart fromIso={fromIso} toIso={toIso} regionId={null} />
        <SlaBreachChart fromIso={fromIso} toIso={toIso} regionId={null} />
        <TimeInStageChart fromIso={fromIso} toIso={toIso} methodCsv={null} regionId={null} />
      </div>
    ) : null}
  </Container>
)

/* ---------- MonthGrid ----------------------------------------------------- */

const MonthGrid = ({
  anchor,
  allOrders,
  getEffectiveDueDate,
  onDayClick,
}: {
  anchor: Date
  allOrders: OrderWithStage[]
  getEffectiveDueDate: (o: OrderWithStage) => Date
  onDayClick: (date: Date) => void
}) => {
  const days = useMemo(() => getMonthGrid(anchor), [anchor])
  const today = startOfDay(new Date())
  const thisMonth = anchor.getMonth()

  const ordersByDate = useMemo(() => {
    const map = new Map<string, OrderWithStage[]>()
    for (const order of allOrders) {
      const d = formatYMD(startOfDay(getEffectiveDueDate(order)))
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(order)
    }
    return map
  }, [allOrders, getEffectiveDueDate])

  return (
    <Container className="p-0 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-ui-border-base">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-2 py-1.5 text-center border-r border-ui-border-base last:border-r-0">
            <Text size="xsmall" className="text-ui-fg-subtle font-medium">
              {d}
            </Text>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = formatYMD(day)
          const dayOrders = ordersByDate.get(key) ?? []
          const isToday = isSameDay(day, today)
          const isCurrentMonth = day.getMonth() === thisMonth
          const isPast = startOfDay(day) < today

          return (
            <div
              key={key}
              onClick={() => onDayClick(day)}
              className="border-r border-b border-ui-border-base last-in-row:border-r-0 cursor-pointer hover:bg-ui-bg-subtle transition min-h-[80px]"
              style={{
                background: isToday ? `${PALETTE.teal500}08` : undefined,
                opacity: isCurrentMonth ? 1 : 0.45,
              }}
            >
              <div className="flex items-center justify-between px-1.5 pt-1 pb-0.5">
                <Text
                  size="xsmall"
                  style={{
                    color: isToday
                      ? PALETTE.teal700
                      : isPast && isCurrentMonth
                        ? PALETTE.rose600
                        : undefined,
                    fontWeight: isToday ? 700 : undefined,
                  }}
                >
                  {day.getDate()}
                </Text>
                {dayOrders.length > 0 ? (
                  <Badge size="2xsmall">{dayOrders.length}</Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-0.5 px-1 pb-1">
                {dayOrders.slice(0, 4).map((o) => {
                  const band = stageHealthBand(o.stage, o.days_at_stage)
                  return (
                    <span
                      key={o.id}
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: STAGE_HEALTH_COLORS[band] }}
                      title={`#${o.display_id ?? o.id.slice(-6)} · ${o.customer}`}
                    />
                  )
                })}
                {dayOrders.length > 4 ? (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    +{dayOrders.length - 4}
                  </Text>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

/* ---------- CalendarView (main export) ------------------------------------ */

export const CalendarView = ({ stages }: { stages: SnapshotStage[] }) => {
  const [viewDate, setViewDate] = useState(new Date())
  const [monthView, setMonthView] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(() => {
    try {
      return localStorage.getItem("prod_cal_summary_open") !== "false"
    } catch {
      return true
    }
  })
  const [localDueDates, setLocalDueDates] = useState<Record<string, string | null>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drawerOrder, setDrawerOrder] = useState<OrderWithStage | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  /* flatten stages → orders with stage attached */
  const allOrders = useMemo<OrderWithStage[]>(
    () => stages.flatMap((s) => s.orders.map((o) => ({ ...o, stage: s.stage }))),
    [stages]
  )

  const activeOrder = useMemo(
    () => (activeId ? allOrders.find((o) => o.id === activeId) ?? null : null),
    [activeId, allOrders]
  )

  /* effective due date: local override → stored → derived */
  const getEffectiveDueDate = useCallback(
    (order: OrderWithStage): Date => {
      const override = localDueDates[order.id]
      const stored = override !== undefined ? override : order.production_due_date
      if (stored) return new Date(stored)
      const sla = (STAGE_SLA_DAYS as Record<string, number | null>)[order.stage]
      if (sla != null && order.stage_changed_at) {
        return new Date(
          new Date(order.stage_changed_at).getTime() + sla * 86400000
        )
      }
      return new Date(Date.now() - 86400000) // no SLA → treat as overdue
    },
    [localDueDates]
  )

  const weekStart = useMemo(() => getWeekStart(viewDate), [viewDate])
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])
  const today = useMemo(() => startOfDay(new Date()), [])

  /* group orders into calendar columns */
  const ordersByColumn = useMemo(() => {
    const map = new Map<string, OrderWithStage[]>()
    map.set("overdue", [])
    for (const d of weekDays) {
      map.set(columnId(d), [])
    }
    const weekEnd = startOfDay(addDays(weekStart, 7))

    for (const order of allOrders) {
      const due = startOfDay(getEffectiveDueDate(order))
      if (due < today) {
        map.get("overdue")!.push(order)
      } else if (due < weekEnd) {
        const key = columnId(due)
        if (map.has(key)) map.get(key)!.push(order)
        // future beyond this week → not shown; navigate to see them
      }
    }
    return map
  }, [allOrders, weekDays, weekStart, today, getEffectiveDueDate])

  /* report chart date range: last 30 days */
  const { fromIso, toIso } = useMemo(() => ({
    fromIso: new Date(Date.now() - 30 * 86400000).toISOString(),
    toIso: new Date().toISOString(),
  }), [])

  /* navigation */
  const prevPeriod = () => {
    setViewDate((d) => addDays(d, monthView ? -30 : -7))
  }
  const nextPeriod = () => {
    setViewDate((d) => addDays(d, monthView ? 30 : 7))
  }
  const goToday = () => setViewDate(new Date())

  const toggleSummary = () => {
    setSummaryOpen((v) => {
      const next = !v
      try { localStorage.setItem("prod_cal_summary_open", String(next)) } catch {}
      return next
    })
  }

  /* DnD handlers */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const orderId = active.id as string
    const targetId = over.id as string

    let newDueDate: string | null = null
    if (targetId !== "overdue") {
      // "day-YYYY-MM-DD" → extract "YYYY-MM-DD"
      const ymd = targetId.replace("day-", "")
      newDueDate = `${ymd}T00:00:00.000Z`
    }

    // Optimistic update
    setLocalDueDates((prev) => ({ ...prev, [orderId]: newDueDate }))

    try {
      const res = await fetch(`/admin/orders/${orderId}/production-due-date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ due_date: newDueDate }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch {
      // Rollback on error
      setLocalDueDates((prev) => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      {/* Summary strip */}
      <SummaryStrip
        open={summaryOpen}
        onToggle={toggleSummary}
        fromIso={fromIso}
        toIso={toIso}
      />

      {/* Nav bar */}
      <Container className="flex items-center justify-between gap-x-3 py-2.5">
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="secondary" onClick={prevPeriod}>
            ◀
          </Button>
          <Button size="small" variant="secondary" onClick={goToday}>
            Today
          </Button>
          <Button size="small" variant="secondary" onClick={nextPeriod}>
            ▶
          </Button>
          <Heading level="h3" className="ml-2">
            {monthView
              ? formatMonthYear(viewDate)
              : formatWeekRange(weekStart)}
          </Heading>
        </div>
        <div className="flex items-center gap-x-2">
          <Tooltip content="Week view — drag orders to reschedule">
            <Button
              size="small"
              variant={monthView ? "secondary" : "primary"}
              onClick={() => setMonthView(false)}
            >
              Week
            </Button>
          </Tooltip>
          <Tooltip content="Month overview — click a day to zoom in">
            <Button
              size="small"
              variant={monthView ? "primary" : "secondary"}
              onClick={() => setMonthView(true)}
            >
              Month
            </Button>
          </Tooltip>
        </div>
      </Container>

      {monthView ? (
        /* Month grid — no DnD in month view */
        <MonthGrid
          anchor={viewDate}
          allOrders={allOrders}
          getEffectiveDueDate={getEffectiveDueDate}
          onDayClick={(d) => {
            setViewDate(d)
            setMonthView(false)
          }}
        />
      ) : (
        /* Week grid with DnD */
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
            {/* Overdue column */}
            <DroppableColumn
              id="overdue"
              header="Overdue"
              subheader="Past due date"
              orders={ordersByColumn.get("overdue") ?? []}
              isOverdue
              onCardClick={setDrawerOrder}
            />

            {/* Mon–Sun columns */}
            {weekDays.map((day) => {
              const key = columnId(day)
              const isToday = isSameDay(day, today)
              return (
                <DroppableColumn
                  key={key}
                  id={key}
                  header={formatColHeader(day)}
                  subheader={isToday ? "Today" : undefined}
                  orders={ordersByColumn.get(key) ?? []}
                  isToday={isToday}
                  onCardClick={setDrawerOrder}
                />
              )
            })}
          </div>

          <DragOverlay dropAnimation={null}>
            {activeOrder ? (
              <CalendarCard order={activeOrder} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Legend */}
      <div className="flex items-center gap-x-4 px-1">
        {(["ok", "warning", "critical"] as const).map((band) => (
          <div key={band} className="flex items-center gap-x-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: STAGE_HEALTH_COLORS[band] }}
            />
            <Text size="xsmall" className="text-ui-fg-muted">
              {band === "ok" ? "On time" : band === "warning" ? "At risk" : "Overdue SLA"}
            </Text>
          </div>
        ))}
        <Text size="xsmall" className="text-ui-fg-muted ml-auto">
          Drag cards to reschedule · Click to view details
        </Text>
      </div>

      {/* Order detail drawer */}
      <OrderDetailDrawer
        order={drawerOrder}
        onClose={() => setDrawerOrder(null)}
      />
    </div>
  )
}
