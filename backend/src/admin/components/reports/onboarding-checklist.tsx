import { Container, Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid, CircleDottedLine } from "@medusajs/icons"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"
import { HelpTooltip } from "./help-tooltip"

/**
 * Self-service onboarding checklist for new admin users. Polls a few
 * existing endpoints to detect what's set up and what's pending.
 *
 * One-shot dismissible (per-user, localStorage). Once dismissed it
 * stays gone unless the user re-opens via a "Show onboarding" link in
 * the settings menu — but for now it just hides forever once dismissed.
 */
const STORAGE_DISMISSED = "sc:onboarding_dismissed"

type CheckResult = {
  key: string
  label: string
  done: boolean
  detail?: string
  href?: string
}

const useOnboardingChecks = () => {
  const [checks, setChecks] = useState<CheckResult[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const results: CheckResult[] = []

      // 1. GA4 — derive from the system-health response
      try {
        const r = await fetch(`/admin/reports/system-health`, {
          credentials: "include",
        })
        if (r.ok) {
          const j = await r.json()
          const google = (j?.services as any[])?.find(
            (s) => s.service === "Google APIs"
          )
          results.push({
            key: "ga4",
            label: "GA4 + Search Console connected",
            done:
              google?.status === "ok" || google?.status === "degraded",
            detail:
              google?.status === "unset"
                ? "Set GOOGLE_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID + GSC_SITE_URL on the backend"
                : undefined,
          })
        }
      } catch {
        /* ignore */
      }

      // 2. Email digest recipient
      try {
        const r = await fetch(`/admin/reports/monthly-digest`, {
          credentials: "include",
        })
        if (r.ok) {
          const j = await r.json()
          const recipients = (j?.configured_recipients as string[]) ?? []
          results.push({
            key: "digest_recipient",
            label: "Monthly digest recipient set",
            done: recipients.length > 0,
            detail:
              recipients.length === 0
                ? "Set MONTHLY_DIGEST_RECIPIENTS=info@scprints.com.au on the backend"
                : `Configured: ${recipients.join(", ")}`,
          })
        }
      } catch {
        /* ignore */
      }

      // 3. At least one threshold alert
      try {
        const r = await fetch(`/admin/reports/alerts`, {
          credentials: "include",
        })
        if (r.ok) {
          const j = await r.json()
          const alerts = (j?.alerts as any[]) ?? []
          results.push({
            key: "first_alert",
            label: "First threshold alert configured",
            done: alerts.length > 0,
            detail:
              alerts.length === 0
                ? "Try: SLA breach > 25% (7d), recipient = your email"
                : `${alerts.length} alert${alerts.length === 1 ? "" : "s"} configured`,
          })
        }
      } catch {
        /* ignore */
      }

      // 4. At least one annotation
      try {
        const r = await fetch(`/admin/reports/annotations`, {
          credentials: "include",
        })
        if (r.ok) {
          const j = await r.json()
          const ann = (j?.annotations as any[]) ?? []
          results.push({
            key: "first_annotation",
            label: "First chart annotation added",
            done: ann.length > 0,
            detail:
              ann.length === 0
                ? "Pin a notable date so future-you reads patterns instead of unexplained spikes"
                : undefined,
          })
        }
      } catch {
        /* ignore */
      }

      // 5. Cron jobs healthy
      try {
        const r = await fetch(`/admin/reports/cron-jobs`, {
          credentials: "include",
        })
        if (r.ok) {
          const j = await r.json()
          const jobs = (j?.jobs as any[]) ?? []
          results.push({
            key: "cron_loaded",
            label: "Scheduled jobs registered",
            done: jobs.length >= 4, // we have 4 crons by default
            detail:
              jobs.length === 0
                ? "Backend boot didn't load any cron jobs — check src/jobs/"
                : `${jobs.length} jobs registered`,
          })
        }
      } catch {
        /* ignore */
      }

      if (!cancelled) setChecks(results)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  return checks
}

export const OnboardingChecklist = () => {
  const [dismissed, setDismissed] = useState<boolean>(false)
  const checks = useOnboardingChecks()

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      if (localStorage.getItem(STORAGE_DISMISSED) === "true") {
        setDismissed(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  if (dismissed || !checks) return null
  const doneCount = checks.filter((c) => c.done).length
  const totalCount = checks.length
  // If everything is done, hide automatically (operator doesn't need
  // to see "5/5 complete" on every page load).
  if (totalCount > 0 && doneCount === totalCount) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_DISMISSED, "true")
    } catch {
      /* ignore */
    }
  }

  return (
    <Container className="flex flex-col gap-y-2 p-4">
      <div className="flex items-start justify-between">
        <div>
          <Heading level="h2" className="text-base font-semibold flex items-center">
            Setup checklist · {doneCount}/{totalCount}
            <HelpTooltip
              text={{
                title: "Setup checklist",
                body: "A short list of quick wins to make the Reports + automation stack actually pay off. Auto-hides once everything's green so it doesn't sit there forever.",
                bullets: [
                  "Each item polls an existing config endpoint to detect whether it's already set up — no manual ticking needed.",
                  "Items typically include: GA4 wired up, GSC site URL set, monthly digest recipients configured, threshold alerts created, vectorization variant set.",
                  "Dismiss state is local (per-browser localStorage), so each admin user sees their own progress.",
                  "Once dismissed it stays gone — there's no built-in way to re-open it. If you need to bring it back, clear the 'sc:onboarding_dismissed' key in browser storage.",
                ],
              }}
            />
          </Heading>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Quick wins to get the most out of the Reports + automation
            features. Auto-hides once everything's green.
          </Text>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-xs underline text-ui-fg-muted hover:text-ui-fg-base"
        >
          Hide for now
        </button>
      </div>
      <ul className="flex flex-col gap-y-1 mt-1">
        {checks.map((c) => (
          <li
            key={c.key}
            className="flex items-start gap-x-2 px-2 py-1.5 rounded"
            style={{
              background: c.done
                ? "rgba(5,150,105,0.04)"
                : "rgba(217,119,6,0.04)",
            }}
          >
            <span
              className="mt-0.5"
              style={{
                color: c.done ? PALETTE.emerald600 : PALETTE.amber600,
              }}
            >
              {c.done ? <CheckCircleSolid /> : <CircleDottedLine />}
            </span>
            <div className="flex-1 min-w-0">
              <Text
                size="small"
                className={c.done ? "text-ui-fg-muted line-through" : "font-medium"}
              >
                {c.label}
              </Text>
              {c.detail ? (
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {c.detail}
                </Text>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Container>
  )
}
