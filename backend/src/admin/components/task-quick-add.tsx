import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

import { OwnerPicker } from "./owner-picker"

type Priority = "low" | "normal" | "high" | "urgent"

type ContextTask = {
  id: string
  assignee_user_id: string
  title: string
  due_at: string | null
  status: "open" | "in_progress" | "done" | "cancelled"
  priority: Priority
  completed_at: string | null
}

const PRIORITY_COLOR: Record<Priority, "grey" | "blue" | "orange" | "red"> = {
  low: "grey",
  normal: "blue",
  high: "orange",
  urgent: "red",
}

type Props = {
  /** Which entity field to pre-populate on the new task. */
  anchor: "customer_id" | "order_id" | "quote_id" | "organisation_id"
  anchorId: string
  title: string
  helpBody: string
}

/**
 * Shared "+ Task" widget body used by customer / order / quote detail
 * pages. Lists the active tasks anchored to the entity and provides a
 * quick-add form. Reuses the OwnerPicker component for assignee.
 */
export const TaskQuickAdd = ({ anchor, anchorId, title, helpBody }: Props) => {
  const [tasks, setTasks] = useState<ContextTask[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [assignee, setAssignee] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState("")
  const [body, setBody] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [priority, setPriority] = useState<Priority>("normal")

  const refresh = async () => {
    if (!anchorId) return
    setLoading(true)
    try {
      const res = await fetch(
        `/admin/tasks?${anchor}=${encodeURIComponent(anchorId)}&status=open,in_progress&limit=50`,
        { credentials: "include" }
      )
      const json = (await res.json()) as { tasks: ContextTask[] }
      setTasks(json.tasks ?? [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorId])

  const create = async () => {
    if (!assignee || !taskTitle.trim()) {
      toast.error("Assignee and title are required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/admin/tasks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [anchor]: anchorId,
          assignee_user_id: assignee,
          title: taskTitle.trim(),
          body: body.trim() || null,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
          priority,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Task created")
      setAssignee(null)
      setTaskTitle("")
      setBody("")
      setDueAt("")
      setPriority("normal")
      setOpen(false)
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Create failed")
    } finally {
      setSaving(false)
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
      await refresh()
    } catch (err: any) {
      toast.error(err?.message ?? "Update failed")
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <Text size="xsmall" className="text-ui-fg-muted">{helpBody}</Text>

      {loading ? (
        <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
      ) : tasks.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted italic">
          No active tasks here yet.
        </Text>
      ) : (
        <ul className="flex flex-col gap-y-1.5">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-x-2 rounded border border-ui-border-base bg-ui-bg-subtle px-2 py-1.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-x-1.5">
                  <Badge color={PRIORITY_COLOR[t.priority]}>{t.priority}</Badge>
                  <Text size="small" className="font-medium truncate">{t.title}</Text>
                </div>
                {t.due_at ? (
                  <Text
                    size="xsmall"
                    className={
                      new Date(t.due_at).getTime() < Date.now()
                        ? "text-ui-tag-red-text"
                        : "text-ui-fg-muted"
                    }
                  >
                    Due {new Date(t.due_at).toLocaleString()}
                  </Text>
                ) : null}
              </div>
              <Button variant="secondary" size="small" onClick={() => complete(t.id)}>
                Done
              </Button>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div className="flex flex-col gap-y-2 rounded border border-ui-border-base p-3">
          <div>
            <Label size="xsmall">Assignee</Label>
            <OwnerPicker
              value={assignee}
              onChange={setAssignee}
              placeholder="Pick assignee…"
              includeUnassigned={false}
              disabled={saving}
            />
          </div>
          <div>
            <Label size="xsmall">Title</Label>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={`What needs doing about this ${anchor.replace(/_id$/, "")}?`}
              disabled={saving}
            />
          </div>
          <div className="flex gap-x-2">
            <div className="flex-1">
              <Label size="xsmall">Due</Label>
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                disabled={saving}
              />
            </div>
            <div className="w-32">
              <Label size="xsmall">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
                disabled={saving}
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
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-x-2">
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={create}
              disabled={saving || !assignee || !taskTitle.trim()}
            >
              Create task
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" size="small" onClick={() => setOpen(true)}>
          + Task
        </Button>
      )}
    </div>
  )
}
