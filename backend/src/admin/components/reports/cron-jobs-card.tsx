import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"
import { HelpTooltip } from "./help-tooltip"
import { LastUpdated } from "./last-updated"

type Job = {
  name: string
  schedule: string
  description?: string
  next_fire: string | null
  human_schedule: string
}

type Response = {
  jobs: Job[]
  note?: string
}

const formatRelative = (iso: string | null): string => {
  if (!iso) return "—"
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return "—"
  const diff = ms - Date.now()
  if (diff < 60_000) return "in <1m"
  if (diff < 3_600_000) return `in ${Math.round(diff / 60_000)}m`
  if (diff < 86_400_000) return `in ${Math.round(diff / 3_600_000)}h`
  return `in ${Math.round(diff / 86_400_000)}d`
}

export const CronJobsCard = () => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadedAt, setLoadedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/admin/reports/cron-jobs`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((j) => {
        if (cancelled) return
        setData(j as Response)
        setLoadedAt(Date.now())
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Container className="flex flex-col gap-y-2 p-4">
      <div className="flex items-center justify-between">
        <Heading level="h2" className="text-base font-semibold flex items-center">
          Scheduled jobs
          <HelpTooltip
            text={{
              title: "Scheduled jobs",
              body: "The cron registry — every background task scheduled to run on its own. Reads src/jobs/ at request-time and shows the next-fire estimate based on the cron schedule string.",
              bullets: [
                "Use this to catch silent failures: if a digest didn't arrive last month, this is the first place to look.",
                "Next-fire times are computed locally from the cron schedule, not pulled from job-history (Railway doesn't expose run history). Treat them as estimates.",
                "If a job is missing here, the cron decorator probably wasn't registered correctly — check the job file's exports.",
                "All times in UTC. The crontab on each line shows the schedule in standard cron syntax.",
              ],
            }}
          />
        </Heading>
        <LastUpdated loadedAt={loadedAt} />
      </div>
      <Text size="xsmall" className="text-ui-fg-subtle">
        Cron registry. Catches "the digest didn't send last month" before
        anyone notices.
      </Text>
      {loading ? (
        <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
      ) : !data || data.jobs.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No scheduled jobs found in src/jobs/
          {data?.note ? ` (${data.note})` : ""}.
        </Text>
      ) : (
        <table className="w-full text-xs mt-1">
          <thead className="text-left text-ui-fg-subtle">
            <tr className="border-b border-ui-border-base">
              <th className="px-2 py-1 font-medium">Job</th>
              <th className="px-2 py-1 font-medium">Schedule</th>
              <th className="px-2 py-1 font-medium text-right">Next fire</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs.map((j) => (
              <tr
                key={j.name}
                className="border-b border-ui-border-base"
              >
                <td className="px-2 py-1 font-mono text-[11px] font-medium">
                  {j.name}
                </td>
                <td className="px-2 py-1 text-ui-fg-muted">
                  {j.human_schedule}
                </td>
                <td
                  className="px-2 py-1 tabular-nums text-right"
                  style={
                    j.next_fire
                      ? undefined
                      : { color: PALETTE.amber600 }
                  }
                >
                  {j.next_fire ? formatRelative(j.next_fire) : "unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Container>
  )
}
