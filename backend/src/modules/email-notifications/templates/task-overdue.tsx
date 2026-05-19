import { Section, Text, Button } from "@react-email/components"

import { Base, STYLES, NAVY } from "./base"

export const TASK_OVERDUE = "task-overdue"

export interface TaskOverdueEmailProps {
  task: {
    title: string
    body: string | null
    daysOverdue: number
    priority: "low" | "normal" | "high" | "urgent"
    dueAt: string | null
    anchor:
      | { kind: "customer"; id: string; label: string | null }
      | { kind: "order"; id: string; displayId: number | null; label: string | null }
      | { kind: "quote"; id: string; publicId: string | null }
      | { kind: "organisation"; id: string; name: string | null }
      | { kind: "none" }
    taskUrl: string | null
  }
  preview?: string
}

export const isTaskOverdueData = (data: any): data is TaskOverdueEmailProps =>
  typeof data?.task === "object" &&
  typeof data?.task?.title === "string" &&
  typeof data?.task?.daysOverdue === "number"

const PRIORITY_COLOR: Record<TaskOverdueEmailProps["task"]["priority"], string> = {
  low: "#6b7280",
  normal: "#2563eb",
  high: "#f97316",
  urgent: "#dc2626",
}

const anchorLine = (anchor: TaskOverdueEmailProps["task"]["anchor"]): string => {
  if (anchor.kind === "customer") return `Customer · ${anchor.label ?? anchor.id}`
  if (anchor.kind === "order")
    return `Order #${anchor.displayId ?? anchor.id.slice(-6)}${anchor.label ? ` · ${anchor.label}` : ""}`
  if (anchor.kind === "quote") return `Quote ${anchor.publicId ?? anchor.id}`
  if (anchor.kind === "organisation") return `Org · ${anchor.name ?? anchor.id}`
  return ""
}

export const TaskOverdueEmail = ({ task, preview }: TaskOverdueEmailProps) => {
  const previewText =
    preview ?? `Task "${task.title}" is ${task.daysOverdue} day(s) overdue.`
  const line = anchorLine(task.anchor)

  return (
    <Base preview={previewText}>
      <Text style={STYLES.eyebrow}>Heads up — overdue task</Text>
      <Text style={{ ...STYLES.h1, color: PRIORITY_COLOR[task.priority] }}>
        {task.title}
      </Text>

      <Text style={STYLES.body}>
        This task is{" "}
        <strong style={{ color: NAVY }}>{task.daysOverdue} day{task.daysOverdue === 1 ? "" : "s"} overdue</strong>
        {task.dueAt ? ` (was due ${new Date(task.dueAt).toLocaleString("en-AU")})` : ""}.
      </Text>

      {task.body ? (
        <Section
          style={{
            background: "#f9fafb",
            padding: "12px 16px",
            borderRadius: "8px",
            margin: "16px 0 0",
            borderLeft: `3px solid ${PRIORITY_COLOR[task.priority]}`,
          }}
        >
          <Text style={{ ...STYLES.body, margin: 0, whiteSpace: "pre-line" }}>
            {task.body}
          </Text>
        </Section>
      ) : null}

      {line ? (
        <Text style={{ ...STYLES.meta, margin: "16px 0 0" }}>
          <strong>About:</strong> {line}
        </Text>
      ) : null}

      {task.taskUrl ? (
        <Section style={{ margin: "24px 0 0" }}>
          <Button href={task.taskUrl} style={STYLES.buttonPrimary}>
            Open task &rarr;
          </Button>
        </Section>
      ) : null}

      <Text style={{ ...STYLES.meta, margin: "20px 0 0" }}>
        You&apos;re getting this because the overdue-tasks cron flagged a task
        assigned to you. Mark it Done in /app/tasks to stop the daily reminder.
      </Text>
    </Base>
  )
}

export default TaskOverdueEmail
