import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EnvelopeSolid } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type Suppression = {
  id: string
  email: string
  reason: "user_unsubscribe" | "bounce" | "spam_complaint" | "manual_admin"
  template_kind: string | null
  source: string | null
  notes: string | null
  created_at: string
}

const REASON_COLOR: Record<
  Suppression["reason"],
  "grey" | "orange" | "red" | "blue"
> = {
  user_unsubscribe: "grey",
  bounce: "orange",
  spam_complaint: "red",
  manual_admin: "blue",
}

const REASON_LABEL: Record<Suppression["reason"], string> = {
  user_unsubscribe: "Unsubscribed",
  bounce: "Bounced",
  spam_complaint: "Spam complaint",
  manual_admin: "Manually added",
}

const STREAM_OPTIONS = [
  { value: "", label: "All marketing (global)" },
  { value: "cart_reminder", label: "Cart reminders" },
  { value: "reorder_reminder", label: "Reorder reminders" },
  { value: "winback", label: "Win-back" },
  { value: "nps_request", label: "NPS requests" },
  { value: "monthly_digest", label: "Monthly digest" },
]

const EmailSuppressionsPage = () => {
  const [rows, setRows] = useState<Suppression[]>([])
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // quick-add form
  const [addEmail, setAddEmail] = useState("")
  const [addStream, setAddStream] = useState("")
  const [addReason, setAddReason] = useState<Suppression["reason"]>("manual_admin")
  const [addNotes, setAddNotes] = useState("")

  const refresh = async () => {
    setLoading(true)
    try {
      const url = filter.trim().length
        ? `/admin/email-suppressions?email=${encodeURIComponent(filter.trim())}`
        : "/admin/email-suppressions"
      const res = await fetch(url, { credentials: "include" })
      const json = (await res.json()) as { suppressions: Suppression[] }
      setRows(json.suppressions ?? [])
    } catch (err: any) {
      toast.error(err?.message ?? "Load failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const add = async () => {
    if (!addEmail.trim()) {
      toast.error("Email required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/admin/email-suppressions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail.trim(),
          template_kind: addStream || null,
          reason: addReason,
          notes: addNotes.trim() || null,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as { duplicate?: boolean }
      toast.success(json.duplicate ? "Already suppressed" : "Suppressed")
      setAddEmail("")
      setAddStream("")
      setAddNotes("")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Add failed")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string, email: string) => {
    if (
      !confirm(
        `Remove the suppression for "${email}"? This re-enables marketing emails to that address.`
      )
    )
      return
    try {
      const res = await fetch(`/admin/email-suppressions/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Removed")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Remove failed")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Email suppressions
          <HelpTooltip
            text={{
              title: "Marketing email suppression list",
              body: "Every email address on this list is blocked from receiving marketing email — cart reminders, reorder reminders, win-back, NPS, monthly digest. Suppression is keyed by email (works for guests too) and can be global (template_kind null) or per-stream.",
              bullets: [
                "User unsubscribe: customer clicked the link in an email footer.",
                "Bounce: hard bounce from Resend webhook (auto, Phase 9b).",
                "Spam complaint: customer marked as spam in Gmail/Outlook (auto).",
                "Manually added: support added on a phone request — pick this when the customer asks you to.",
                "Removing a row re-enables sends. Use sparingly: re-emailing an unsubscribed customer is a compliance risk.",
              ],
            }}
          />
        </Heading>
        <Badge color="grey">{rows.length} shown</Badge>
      </div>

      <div className="px-6 py-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px]">
          <Label size="xsmall">Filter by email</Label>
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void refresh()
            }}
            placeholder="alice@example.com"
          />
        </div>
        <Button variant="secondary" onClick={() => void refresh()}>
          Apply filter
        </Button>
        <Button
          variant="transparent"
          onClick={() => {
            setFilter("")
            // refresh after clearing
            setTimeout(() => void refresh(), 0)
          }}
        >
          Clear
        </Button>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text className="text-ui-fg-muted text-sm">Loading…</Text>
        ) : rows.length === 0 ? (
          <Text className="text-ui-fg-muted text-sm">
            No suppressions yet. Customers landing here means the
            unsubscribe / bounce / spam flow is working.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Stream</Table.HeaderCell>
                <Table.HeaderCell>Reason</Table.HeaderCell>
                <Table.HeaderCell>Source</Table.HeaderCell>
                <Table.HeaderCell>Added</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((r) => (
                <Table.Row key={r.id}>
                  <Table.Cell>
                    <Text className="font-medium">{r.email}</Text>
                    {r.notes ? (
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {r.notes}
                      </Text>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell>
                    {r.template_kind ? (
                      <Badge color="grey">{r.template_kind}</Badge>
                    ) : (
                      <Badge color="orange">All marketing</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={REASON_COLOR[r.reason]}>
                      {REASON_LABEL[r.reason]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {r.source ?? "—"}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {new Date(r.created_at).toLocaleString()}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => remove(r.id, r.email)}
                    >
                      Remove
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      <div className="px-6 py-4">
        <Heading level="h2" className="mb-2">
          Add manually
        </Heading>
        <Text size="xsmall" className="text-ui-fg-muted mb-3">
          Use this when a customer asks you in person / by phone to stop
          marketing email. For unsubscribes from email footers, bounces,
          and spam complaints, rows land here automatically.
        </Text>
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <Label size="xsmall">Email</Label>
              <Input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="customer@example.com"
                disabled={saving}
              />
            </div>
            <div className="w-56">
              <Label size="xsmall">Stream</Label>
              <Select
                value={addStream}
                onValueChange={(v) => setAddStream(v)}
                disabled={saving}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {STREAM_OPTIONS.map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div className="w-44">
              <Label size="xsmall">Reason</Label>
              <Select
                value={addReason}
                onValueChange={(v) => setAddReason(v as Suppression["reason"])}
                disabled={saving}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="manual_admin">Manually added</Select.Item>
                  <Select.Item value="user_unsubscribe">Unsubscribed</Select.Item>
                  <Select.Item value="bounce">Bounced</Select.Item>
                  <Select.Item value="spam_complaint">Spam complaint</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
          <div>
            <Label size="xsmall">Notes (optional)</Label>
            <Textarea
              value={addNotes}
              onChange={(e) => setAddNotes(e.target.value)}
              placeholder="Phone call from Alice on Tuesday — doesn't want win-back emails."
              disabled={saving}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={add}
              disabled={saving || !addEmail.trim()}
            >
              Suppress
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Email suppressions",
  icon: EnvelopeSolid,
})

export default EmailSuppressionsPage
