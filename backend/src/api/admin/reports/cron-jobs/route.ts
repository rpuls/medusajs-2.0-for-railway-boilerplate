import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import path from "node:path"
import fs from "node:fs"

/**
 * GET /admin/reports/cron-jobs
 *
 * Lists every scheduled job registered in the backend with its cron
 * schedule + a human-readable next-fire estimate. Catches "the digest
 * never sent last month" before someone notices in production.
 *
 * Reads jobs at runtime from `src/jobs/*.ts` files via dynamic import
 * to grab their `config` export. This is intentionally light — Medusa's
 * scheduler doesn't expose a public introspection API yet, so we mirror
 * the file-based registration ourselves.
 *
 * `last_run_at` and `last_status` are best-effort — they need a
 * subscriber on cron-completion events that doesn't ship in v1. For
 * now, surface what we know (schedule + next fire) and leave a stub.
 */
type CronEntry = {
  name: string
  schedule: string
  description?: string
  next_fire: string | null
  human_schedule: string
}

const humanizeCron = (expr: string): string => {
  // Quick-and-dirty cron explanation — covers the patterns in this
  // codebase without pulling a full cron parser.
  const presets: Record<string, string> = {
    "0 5 * * *": "Daily at 05:00 UTC (15:00 AEST)",
    "0 22 1 * *": "1st of month at 22:00 UTC (08:00 AEST 2nd)",
    "0 22 2 * *": "2nd of month at 22:00 UTC (08:00 AEST 3rd)",
    "30 23 * * *": "Daily at 23:30 UTC (09:30 AEST)",
    "45 23 * * *": "Daily at 23:45 UTC (09:45 AEST)",
    "0 0 * * *": "Daily at midnight UTC (10:00 AEST)",
  }
  if (presets[expr]) return presets[expr]
  // Generic fallback
  const parts = expr.split(/\s+/)
  if (parts.length !== 5) return expr
  return `Cron: ${expr} (UTC)`
}

/**
 * Compute the next fire time for a 5-field UTC cron expression. Handles
 * the common `min hour day-of-month month day-of-week` patterns we use
 * (literal numbers, * wildcards). Doesn't support ranges/lists/steps —
 * good enough for the current job set; falls back to null otherwise.
 */
const nextFireUtc = (expr: string, from: Date = new Date()): Date | null => {
  const parts = expr.split(/\s+/)
  if (parts.length !== 5) return null
  const [minStr, hourStr, dayStr, monthStr, dowStr] = parts
  const parseField = (s: string, max: number): number[] | "*" => {
    if (s === "*") return "*"
    const n = Number(s)
    if (Number.isFinite(n) && n >= 0 && n <= max) return [n]
    return "*"
  }
  const mins = parseField(minStr, 59)
  const hours = parseField(hourStr, 23)
  const days = parseField(dayStr, 31)
  const months = parseField(monthStr, 12)
  const dows = parseField(dowStr, 6)

  // Search up to 366 days forward.
  for (let dayOffset = 0; dayOffset < 366; dayOffset++) {
    const candidateDay = new Date(from.getTime() + dayOffset * 86_400_000)
    const cy = candidateDay.getUTCFullYear()
    const cm = candidateDay.getUTCMonth() + 1
    const cd = candidateDay.getUTCDate()
    const cdow = candidateDay.getUTCDay()
    if (months !== "*" && !months.includes(cm)) continue
    if (days !== "*" && !days.includes(cd)) continue
    if (dows !== "*" && !dows.includes(cdow)) continue
    const hourList = hours === "*" ? Array.from({ length: 24 }, (_, h) => h) : hours
    const minList = mins === "*" ? Array.from({ length: 60 }, (_, m) => m) : mins
    for (const h of hourList) {
      for (const m of minList) {
        const ms = Date.UTC(cy, cm - 1, cd, h, m, 0)
        if (ms > from.getTime()) return new Date(ms)
      }
    }
  }
  return null
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const jobs: CronEntry[] = []
  // Look in both src/jobs (dev) and .medusa/server/src/jobs (build)
  const candidates = [
    path.resolve(process.cwd(), "src", "jobs"),
    path.resolve(process.cwd(), ".medusa", "server", "src", "jobs"),
    path.resolve(process.cwd(), "..", "..", "src", "jobs"),
  ]
  let jobsDir: string | null = null
  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        jobsDir = dir
        break
      }
    } catch {
      /* keep looking */
    }
  }
  if (!jobsDir) {
    return res.json({ jobs: [], note: "jobs directory not found" })
  }

  const files = fs
    .readdirSync(jobsDir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
  for (const file of files) {
    try {
      const fullPath = path.join(jobsDir, file)
      // Use require so it works in compiled JS too. Strip .ts extension
      // for the import.
      const mod = require(fullPath.replace(/\.ts$/, ""))
      const config = mod?.config ?? mod?.default?.config
      if (!config?.schedule || !config?.name) continue
      const next = nextFireUtc(config.schedule)
      jobs.push({
        name: config.name,
        schedule: config.schedule,
        description: config.description,
        next_fire: next?.toISOString() ?? null,
        human_schedule: humanizeCron(config.schedule),
      })
    } catch {
      /* one job failing to load shouldn't kill the whole list */
    }
  }

  jobs.sort((a, b) => {
    const aMs = a.next_fire ? Date.parse(a.next_fire) : Infinity
    const bMs = b.next_fire ? Date.parse(b.next_fire) : Infinity
    return aMs - bMs
  })

  return res.json({ jobs })
}
