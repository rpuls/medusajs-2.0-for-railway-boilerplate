import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CheckCircle } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Table,
  Tabs,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"
import { OwnerPicker } from "../../components/owner-picker"

type Task = {
  id: string
  assignee_user_id: string
  title: string
  body: string | null
  due_at: string | null
  status: "open" | "in_progress" | "done" | "cancelled"
  priority: "low" | "normal" | "high" | "urgent"
  customer_id: string | null
  order_id: string | null
  quote_id: string | null
  organisation_id: string | null
  created_at: string
  completed_at: string | null
}

type Bucket = "today" | "overdue" | "all"

const PRIORITY_COLOR: Record<Task["priority"], "grey" | "blue" | "orange" | "red"> = {
  low: "grey",
  normal: "blue",
  high: "orange",
  urgent: "red",
}

const TasksPage = () => {
  const [bucket, setBucket] = useState<Bucket>("today")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [creating, setCreating] = useState(false)
  const [newAssignee, setNewAssignee] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [newDueAt, setNewDueAt] = useState("")
  const [newPriority, setNewPriority] = useState<Task["priority"]>("normal")

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/admin/tasks/mine?bucket=${bucket}`, {
        credentials: "include",
      })
      const json = (await res.json()) as { tasks: Task[] }
      setTasks(json.tasks ?? [])
    } catch (err: any) {
      toast.error(err?.message ?? "Load failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket])

  const create = async () => {
    if (!newAssignee || !newTitle.trim()) {
      toast.error("Assignee and title are required")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/admin/tasks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignee_user_id: newAssignee,
          title: newTitle.trim(),
          body: newBody.trim() || null,
          due_at: newDueAt ? new Date(newDueAt).toISOString() : null,
          priority: newPriority,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Task created")
      setNewTitle("")
      setNewBody("")
      setNewDueAt("")
      setNewPriority("normal")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Create failed")
    } finally {
      setCreating(false)
    }
  }

  const complete = async (id: string) => {
    try {
      const res = await fetch(`/admin/tasks/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Done")
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Update failed")
    }
  }

  const startProgress = async (id: string) => {
    try {
      const res = await fetch(`/admin/tasks/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      })
      if (!res.ok) throw new Error(await res.text())
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Update failed")
    }
  }

  const anchorLink = (t: Task): { href: string; label: string } | null => {
    if (t.order_id) return { href: `/app/orders/${t.order_id}`, label: "Order" }
    if (t.customer_id)
      return { href: `/app/customers/${t.customer_id}`, label: "Customer" }
    if (t.quote_id) return { href: `/app/quotes`, label: "Quote" }
    if (t.organisation_id) return { href: `/app/organisations`, label: "Org" }
    return null
  }

  const summary = useMemo(() => {
    const overdue = tasks.filter(
      (t) =>
        t.due_at &&
        new Date(t.due_at).getTime() < Date.now() &&
        (t.status === "open" || t.status === "in_progress")
    ).length
    return { total: tasks.length, overdue }
  }, [tasks])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          My tasks
          <HelpTooltip
            text={{
              title: "Staff tasks",
              body: "Personal task queue for the logged-in admin. Tasks can be anchored to a customer, order, quote, or organisation so the right context is one click away.",
              bullets: [
                "Today: tasks with due_at on the current UTC day.",
                "Overdue: due_at in the past, status still active.",
                "All: every active task assigned to you (open + in_progress).",
                "Completed/cancelled tasks fall off automatically — switch a row's status to bring it back.",
                "Daily 09:00 UTC cron writes audit + PostHog events for tasks that stay overdue, gated by TASKS_OVERDUE_CRON_ENABLED.",
              ],
            }}
          />
        </Heading>
        <div className="flex items-center gap-2">
          <Badge color="grey">{summary.total} shown</Badge>
          {summary.overdue > 0 ? (
            <Badge color="red">{summary.overdue} overdue</Badge>
          ) : null}
        </div>
      </div>

      <div className="px-6 py-4">
        <Tabs value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
          <Tabs.List>
            <Tabs.Trigger value="today">Today</Tabs.Trigger>
            <Tabs.Trigger value="overdue">Overdue</Tabs.Trigger>
            <Tabs.Trigger value="all">All active</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text className="text-ui-fg-muted text-sm">Loading…</Text>
        ) : tasks.length === 0 ? (
          <Text className="text-ui-fg-muted text-sm">
            Nothing in this bucket — nice work.
          </Text>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Title</Table.HeaderCell>
                <Table.HeaderCell>Anchor</Table.HeaderCell>
                <Table.HeaderCell>Due</Table.HeaderCell>
                <Table.HeaderCell>Priority</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tasks.map((t) => {
                const anchor = anchorLink(t)
                return (
                  <Table.Row key={t.id}>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <Text className="font-medium">{t.title}</Text>
                        {t.body ? (
                          <Text className="text-ui-fg-muted text-xs whitespace-pre-line">
                            {t.body}
                          </Text>
                        ) : null}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {anchor ? (
                        <a
                          href={anchor.href}
                          className="text-ui-fg-interactive underline text-xs"
                        >
                          {anchor.label}
                        </a>
                      ) : (
                        <Text className="text-ui-fg-muted text-xs">—</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {t.due_at ? (
                        <Text
                          className={
                            new Date(t.due_at).getTime() < Date.now()
                              ? "text-ui-tag-red-text"
                              : ""
                          }
                        >
                          {new Date(t.due_at).toLocaleString()}
                        </Text>
                      ) : (
                        <Text className="text-ui-fg-muted text-xs">—</Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={PRIORITY_COLOR[t.priority]}>
                        {t.priority}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={t.status === "in_progress" ? "blue" : "grey"}>
                        {t.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-x-1">
                        {t.status === "open" ? (
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => startProgress(t.id)}
                          >
                            Start
                          </Button>
                        ) : null}
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => complete(t.id)}
                        >
                          Done
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      <div className="px-6 py-4">
        <Heading level="h2" className="mb-2">
          Quick add
        </Heading>
        <div className="flex flex-col gap-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <Label size="xsmall">Assignee</Label>
              <OwnerPicker
                value={newAssignee}
                onChange={setNewAssignee}
                placeholder="Pick assignee…"
                includeUnassigned={false}
                disabled={creating}
              />
            </div>
            <div className="flex-1 min-w-[240px]">
              <Label size="xsmall">Title</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Follow up on Acme quote"
                disabled={creating}
              />
            </div>
            <div className="w-44">
              <Label size="xsmall">Due</Label>
              <Input
                type="datetime-local"
                value={newDueAt}
                onChange={(e) => setNewDueAt(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="w-32">
              <Label size="xsmall">Priority</Label>
              <Select
                value={newPriority}
                onValueChange={(v) => setNewPriority(v as Task["priority"])}
                disabled={creating}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="low">low</Select.Item>
                  <Select.Item value="normal">normal</Select.Item>
                  <Select.Item value="high">high</Select.Item>
                  <Select.Item value="urgent">urgent</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>
          <div>
            <Label size="xsmall">Notes (optional)</Label>
            <Textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Anything the assignee needs to know"
              disabled={creating}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={create}
              disabled={creating || !newAssignee || !newTitle.trim()}
            >
              Add task
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "My tasks",
  icon: CheckCircle,
})

export default TasksPage
