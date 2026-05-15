import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

type Quote = {
  id: string
  public_id: string
  status: "new" | "quoted" | "accepted" | "lost" | "expired"
  source: "byo" | "contact" | "admin"
  email: string
  contact_name: string | null
  company: string | null
  subject: string | null
  message: string | null
  assigned_to: string | null
  currency_code: string
  total_estimate: number | string | null
  line_items: {
    items?: Array<{
      title: string
      description?: string | null
      quantity?: number | null
      unit_price?: number | null
      total?: number | null
    }>
  }
  created_at: string
}

type QuoteEvent = {
  id: string
  quote_id: string
  type: string
  actor: string | null
  body: Record<string, unknown>
  created_at: string
}

const STATUS_LABELS: Record<Quote["status"], string> = {
  new: "New",
  quoted: "Quoted",
  accepted: "Accepted",
  lost: "Lost",
  expired: "Expired",
}

const STATUS_COLORS: Record<Quote["status"], "blue" | "orange" | "green" | "red" | "grey"> = {
  new: "blue",
  quoted: "orange",
  accepted: "green",
  lost: "red",
  expired: "grey",
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-AU")

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [events, setEvents] = useState<QuoteEvent[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter === "active") {
      params.set("status", "new,quoted")
    } else if (statusFilter !== "all") {
      params.set("status", statusFilter)
    }
    if (search) params.set("q", search)
    try {
      const res = await fetch(`/admin/quotes?${params.toString()}`, {
        credentials: "include",
      })
      const json = (await res.json()) as { quotes?: Quote[] }
      setQuotes(json.quotes ?? [])
    } catch {
      toast.error("Failed to load quotes")
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    load()
  }, [load])

  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/admin/quotes/${id}`, { credentials: "include" })
      const json = (await res.json()) as { quote: Quote; events: QuoteEvent[] }
      setSelectedQuote(json.quote)
      setEvents(json.events ?? [])
    } catch {
      toast.error("Failed to load quote")
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSelectedQuote(null)
      setEvents([])
      return
    }
    loadDetail(selectedId)
  }, [selectedId, loadDetail])

  const patchQuote = async (id: string, patch: Record<string, unknown>) => {
    try {
      const res = await fetch(`/admin/quotes/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Saved")
      await load()
      if (selectedId === id) await loadDetail(id)
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Quotes</Heading>
        <Badge color="blue">{quotes.length} shown</Badge>
      </div>

      <div className="flex flex-wrap items-end gap-3 px-6 py-4">
        <div>
          <Label size="xsmall">Status</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <Select.Trigger className="w-44">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="active">Active (new + quoted)</Select.Item>
              <Select.Item value="new">New</Select.Item>
              <Select.Item value="quoted">Quoted</Select.Item>
              <Select.Item value="accepted">Accepted</Select.Item>
              <Select.Item value="lost">Lost</Select.Item>
              <Select.Item value="expired">Expired</Select.Item>
              <Select.Item value="all">All</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label size="xsmall">Search</Label>
          <Input
            placeholder="email, company, subject, public id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0">
        <div className="border-r border-ui-border-base">
          {loading ? (
            <Text className="p-6 text-ui-fg-muted text-sm">Loading…</Text>
          ) : quotes.length === 0 ? (
            <Text className="p-6 text-ui-fg-muted text-sm">No quotes.</Text>
          ) : (
            <ul className="divide-y">
              {quotes.map((q) => (
                <li
                  key={q.id}
                  className={`px-6 py-3 cursor-pointer hover:bg-ui-bg-subtle ${selectedId === q.id ? "bg-ui-bg-subtle" : ""}`}
                  onClick={() => setSelectedId(q.id)}
                >
                  <div className="flex items-center justify-between">
                    <Text weight="plus">{q.public_id}</Text>
                    <Badge color={STATUS_COLORS[q.status]}>
                      {STATUS_LABELS[q.status]}
                    </Badge>
                  </div>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {q.email} · {fmtDate(q.created_at)}
                  </Text>
                  {q.subject ? (
                    <Text size="small" className="mt-1">
                      {q.subject}
                    </Text>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6">
          {!selectedQuote ? (
            <Text className="text-ui-fg-muted text-sm">
              Pick a quote on the left to view and edit.
            </Text>
          ) : (
            <QuoteDetail
              quote={selectedQuote}
              events={events}
              onUpdate={(patch) => patchQuote(selectedQuote.id, patch)}
            />
          )}
        </div>
      </div>
    </Container>
  )
}

function QuoteDetail({
  quote,
  events,
  onUpdate,
}: {
  quote: Quote
  events: QuoteEvent[]
  onUpdate: (patch: Record<string, unknown>) => Promise<void> | void
}) {
  const [draftMessage, setDraftMessage] = useState(quote.message ?? "")
  const [draftAssigned, setDraftAssigned] = useState(quote.assigned_to ?? "")
  const [draftEstimate, setDraftEstimate] = useState(
    quote.total_estimate ? String(quote.total_estimate) : ""
  )

  useEffect(() => {
    setDraftMessage(quote.message ?? "")
    setDraftAssigned(quote.assigned_to ?? "")
    setDraftEstimate(quote.total_estimate ? String(quote.total_estimate) : "")
  }, [quote.id])

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h2">{quote.public_id}</Heading>
          <Text size="xsmall" className="text-ui-fg-muted">
            {quote.email} · created {fmtDate(quote.created_at)} · source {quote.source}
          </Text>
        </div>
        <Badge color={STATUS_COLORS[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-3">
        <div>
          <Label size="xsmall">Status</Label>
          <Select
            value={quote.status}
            onValueChange={(v) => onUpdate({ status: v })}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {(Object.keys(STATUS_LABELS) as Quote["status"][]).map((s) => (
                <Select.Item key={s} value={s}>
                  {STATUS_LABELS[s]}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div>
          <Label size="xsmall">Assigned to</Label>
          <Input
            value={draftAssigned}
            onChange={(e) => setDraftAssigned(e.target.value)}
            onBlur={() =>
              draftAssigned !== (quote.assigned_to ?? "") &&
              onUpdate({ assigned_to: draftAssigned || null })
            }
            placeholder="staff email"
          />
        </div>
      </div>

      <div>
        <Label size="xsmall">Total estimate ({quote.currency_code.toUpperCase()})</Label>
        <div className="flex gap-x-2">
          <Input
            value={draftEstimate}
            onChange={(e) => setDraftEstimate(e.target.value)}
            placeholder="0.00"
          />
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              const num = Number.parseFloat(draftEstimate)
              onUpdate({ total_estimate: Number.isFinite(num) ? num : null })
            }}
          >
            Update
          </Button>
        </div>
      </div>

      <div>
        <Label size="xsmall">Customer message</Label>
        <Textarea
          rows={6}
          value={draftMessage}
          onChange={(e) => setDraftMessage(e.target.value)}
          onBlur={() =>
            draftMessage !== (quote.message ?? "") &&
            onUpdate({ message: draftMessage })
          }
        />
      </div>

      <div>
        <Heading level="h3" className="text-base">Line items</Heading>
        {(quote.line_items?.items ?? []).length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted mt-2">
            No line items yet. Add them via the API when you're ready to formalise the quote.
          </Text>
        ) : (
          <ul className="mt-2 divide-y">
            {(quote.line_items?.items ?? []).map((li, idx) => (
              <li key={idx} className="py-2">
                <div className="flex items-center justify-between">
                  <Text weight="plus">{li.title}</Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {li.quantity != null ? `qty ${li.quantity}` : ""}
                    {li.unit_price != null
                      ? ` · ${li.unit_price.toFixed(2)} ea`
                      : ""}
                  </Text>
                </div>
                {li.description ? (
                  <Text size="xsmall" className="text-ui-fg-muted whitespace-pre-wrap">
                    {li.description}
                  </Text>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <Heading level="h3" className="text-base">Timeline</Heading>
        {events.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted mt-2">
            No activity yet.
          </Text>
        ) : (
          <ul className="mt-2 divide-y">
            {events.map((e) => (
              <li key={e.id} className="py-2">
                <div className="flex items-center justify-between">
                  <Text weight="plus">{e.type}</Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {new Date(e.created_at).toLocaleString("en-AU")}
                  </Text>
                </div>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {e.actor ? `by ${e.actor}` : "system"}
                </Text>
                {Object.keys(e.body || {}).length > 0 ? (
                  <pre className="mt-1 text-xs bg-ui-bg-subtle p-2 rounded overflow-x-auto">
                    {JSON.stringify(e.body, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Quotes",
  icon: ChatBubbleLeftRight,
})

export default QuotesPage
