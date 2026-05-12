#!/usr/bin/env node
/**
 * Verifies that the storefront's mirror of `production-stage.ts` agrees with
 * the canonical backend version. Compares the data shapes (stage list, labels,
 * customer milestones, milestone mapping, email triggers) by parsing both
 * files with regex — purposefully NOT a full TS evaluator, so storefront-only
 * helpers (`milestoneIndex`, `readProductionStageMetadata`) are ignored.
 *
 * Usage:
 *   node scripts/check-production-stage-sync.mjs
 *
 * Exits non-zero on mismatch. Wire into CI to catch drift the next time
 * someone updates one file and forgets the other.
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..")

const BACKEND_PATH = resolve(repoRoot, "backend/src/lib/production-stage.ts")
const STOREFRONT_PATH = resolve(
  repoRoot,
  "storefront/src/modules/order/lib/production-stage.ts"
)

const failures = []

function fail(msg) {
  failures.push(msg)
}

function readFile(path, label) {
  try {
    return readFileSync(path, "utf8")
  } catch (err) {
    fail(`${label}: cannot read ${path} — ${err.message}`)
    return null
  }
}

/**
 * Extract a `const NAME = [ "a", "b", ... ] as const` style array. Returns the
 * array of string values, or null if the declaration isn't found.
 */
function extractStringArray(source, name) {
  const re = new RegExp(
    `const\\s+${name}\\s*(?::[^=]+)?\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*(?:as\\s+const)?`,
    "m"
  )
  const m = source.match(re)
  if (!m) return null
  return m[1]
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => v.replace(/^["']|["']$/g, ""))
    .filter((v) => v.length > 0)
}

/**
 * Extract a `const NAME[: T] = { key: "value", ... }` object. Returns
 * { key: value } object or null.
 */
function extractStringRecord(source, name) {
  const re = new RegExp(
    `const\\s+${name}\\s*(?::[^=]+)?\\s*=\\s*\\{([\\s\\S]*?)^\\}`,
    "m"
  )
  const m = source.match(re)
  if (!m) return null
  const body = m[1]
  const out = {}
  // Match `key: "value"` lines, where key is identifier or quoted string.
  const lineRe = /(?:["']?([\w-]+)["']?)\s*:\s*["']([^"']+)["']/g
  let lm
  while ((lm = lineRe.exec(body)) !== null) {
    out[lm[1]] = lm[2]
  }
  return out
}

/**
 * Extract a `new Set<...>([...])` literal's string members.
 */
function extractSetMembers(source, name) {
  const re = new RegExp(
    `const\\s+${name}\\s*(?::[^=]+)?\\s*=\\s*new\\s+Set[^[]*\\[([\\s\\S]*?)\\]`,
    "m"
  )
  const m = source.match(re)
  if (!m) return null
  return m[1]
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => v.replace(/^["']|["']$/g, ""))
    .filter((v) => v.length > 0)
}

/** Extract the case → milestone map from `customerMilestoneForStage`. */
function extractMilestoneMap(source) {
  const fnRe = /function\s+customerMilestoneForStage[\s\S]*?\{([\s\S]*?)^\}/m
  const fnMatch = source.match(fnRe)
  if (!fnMatch) return null
  const body = fnMatch[1]
  // Pattern: `case "stage":` (one or more in a row) `return "milestone"`
  const blockRe = /((?:case\s+["']([^"']+)["']\s*:\s*)+)\s*return\s+["']([^"']+)["']/g
  const map = {}
  let bm
  while ((bm = blockRe.exec(body)) !== null) {
    const cases = bm[1].match(/case\s+["']([^"']+)["']/g) ?? []
    const milestone = bm[3]
    for (const c of cases) {
      const stage = c.match(/["']([^"']+)["']/)[1]
      map[stage] = milestone
    }
  }
  return map
}

function compare(label, a, b) {
  const aJson = JSON.stringify(a)
  const bJson = JSON.stringify(b)
  if (aJson !== bJson) {
    fail(
      `${label} differs:\n  backend:    ${aJson}\n  storefront: ${bJson}`
    )
  }
}

const backend = readFile(BACKEND_PATH, "backend")
const storefront = readFile(STOREFRONT_PATH, "storefront")

if (backend && storefront) {
  // Stage list
  const backendStages = extractStringArray(backend, "PRODUCTION_STAGES")
  const storefrontStages = extractStringArray(storefront, "PRODUCTION_STAGES")
  if (!backendStages || !storefrontStages) {
    fail("Could not parse PRODUCTION_STAGES on one of the files.")
  } else {
    compare("PRODUCTION_STAGES", backendStages, storefrontStages)
  }

  // Stage labels
  const backendLabels = extractStringRecord(backend, "PRODUCTION_STAGE_LABEL")
  const storefrontLabels = extractStringRecord(storefront, "PRODUCTION_STAGE_LABEL")
  if (!backendLabels || !storefrontLabels) {
    fail("Could not parse PRODUCTION_STAGE_LABEL on one of the files.")
  } else {
    compare("PRODUCTION_STAGE_LABEL", backendLabels, storefrontLabels)
  }

  // Customer milestones
  const backendMs = extractStringArray(backend, "CUSTOMER_MILESTONES")
  const storefrontMs = extractStringArray(storefront, "CUSTOMER_MILESTONES")
  if (!backendMs || !storefrontMs) {
    fail("Could not parse CUSTOMER_MILESTONES on one of the files.")
  } else {
    compare("CUSTOMER_MILESTONES", backendMs, storefrontMs)
  }

  // Milestone labels
  const backendMl = extractStringRecord(backend, "CUSTOMER_MILESTONE_LABEL")
  const storefrontMl = extractStringRecord(storefront, "CUSTOMER_MILESTONE_LABEL")
  if (!backendMl || !storefrontMl) {
    fail("Could not parse CUSTOMER_MILESTONE_LABEL on one of the files.")
  } else {
    compare("CUSTOMER_MILESTONE_LABEL", backendMl, storefrontMl)
  }

  // Email-triggering stages
  const backendEmail = extractSetMembers(backend, "STAGES_THAT_EMAIL")
  if (backendEmail) backendEmail.sort()
  if (backendEmail && backendStages) {
    const stageSet = new Set(backendStages)
    const stray = backendEmail.filter((s) => !stageSet.has(s))
    if (stray.length) {
      fail(`STAGES_THAT_EMAIL contains stages not in PRODUCTION_STAGES: ${stray.join(", ")}`)
    }
  }

  // Per-track arrays + labels — must match across the two files
  for (const arrName of ["ARTWORK_STAGES", "BLANKS_STAGES", "DOWNSTREAM_STAGES"]) {
    const b = extractStringArray(backend, arrName)
    const s = extractStringArray(storefront, arrName)
    if (!b || !s) fail(`Could not parse ${arrName} on one of the files.`)
    else compare(arrName, b, s)
  }
  for (const labelName of [
    "ARTWORK_STAGE_LABEL",
    "BLANKS_STAGE_LABEL",
    "DOWNSTREAM_STAGE_LABEL",
  ]) {
    const b = extractStringRecord(backend, labelName)
    const s = extractStringRecord(storefront, labelName)
    if (!b || !s) fail(`Could not parse ${labelName} on one of the files.`)
    else compare(labelName, b, s)
  }

  // Milestone mapping
  const backendMap = extractMilestoneMap(backend)
  const storefrontMap = extractMilestoneMap(storefront)
  if (!backendMap || !storefrontMap) {
    fail("Could not parse customerMilestoneForStage on one of the files.")
  } else {
    compare("customerMilestoneForStage map", backendMap, storefrontMap)
  }
}

if (failures.length === 0) {
  console.log("✓ production-stage.ts files are in sync")
  process.exit(0)
} else {
  console.error("✗ production-stage.ts files are OUT OF SYNC:\n")
  for (const f of failures) {
    console.error(`  - ${f}\n`)
  }
  console.error(
    "Edit both files together (backend canonical → storefront mirror) and re-run."
  )
  process.exit(1)
}
