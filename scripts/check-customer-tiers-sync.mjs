#!/usr/bin/env node
/**
 * Verifies that the storefront's mirror of `customer-tiers.ts` agrees with
 * the canonical backend version. Compares TIERS (slug, name, multiplier, rank)
 * + TIER_SLUGS by parsing both files with regex.
 *
 * Usage:
 *   node scripts/check-customer-tiers-sync.mjs
 *
 * Exits non-zero on mismatch. Wire into CI to catch drift the next time
 * someone updates one file and forgets the other.
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..")

const BACKEND_PATH = resolve(repoRoot, "backend/src/lib/customer-tiers.ts")
const STOREFRONT_PATH = resolve(repoRoot, "storefront/src/lib/customer-tiers.ts")

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
 * Extract a `const NAME = ["a", "b", ...] as const` style string array.
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
 * Extract the TIERS array as an array of {slug, name, multiplier, rank}.
 * Tolerant of whitespace + trailing commas.
 */
function extractTiers(source) {
  const re = /const\s+TIERS\s*:\s*[^=]+=\s*\[([\s\S]*?)\]\s*as\s+const/m
  const m = source.match(re)
  if (!m) return null

  // Match each tier object literal.
  const rowRe = /\{\s*slug\s*:\s*["']([^"']+)["']\s*,\s*name\s*:\s*["']([^"']+)["']\s*,\s*multiplier\s*:\s*([\d.]+)\s*,\s*rank\s*:\s*(\d+)\s*,?\s*\}/g
  const rows = []
  let rm
  while ((rm = rowRe.exec(m[1])) !== null) {
    rows.push({
      slug: rm[1],
      name: rm[2],
      multiplier: Number(rm[3]),
      rank: Number(rm[4]),
    })
  }
  return rows.length ? rows : null
}

function compare(label, a, b) {
  const aJson = JSON.stringify(a)
  const bJson = JSON.stringify(b)
  if (aJson !== bJson) {
    fail(`${label} differs:\n  backend:    ${aJson}\n  storefront: ${bJson}`)
  }
}

const backend = readFile(BACKEND_PATH, "backend")
const storefront = readFile(STOREFRONT_PATH, "storefront")

if (backend && storefront) {
  const backendSlugs = extractStringArray(backend, "TIER_SLUGS")
  const storefrontSlugs = extractStringArray(storefront, "TIER_SLUGS")
  if (!backendSlugs || !storefrontSlugs) {
    fail("Could not parse TIER_SLUGS on one of the files.")
  } else {
    compare("TIER_SLUGS", backendSlugs, storefrontSlugs)
  }

  const backendTiers = extractTiers(backend)
  const storefrontTiers = extractTiers(storefront)
  if (!backendTiers || !storefrontTiers) {
    fail("Could not parse TIERS on one of the files.")
  } else {
    compare("TIERS", backendTiers, storefrontTiers)

    // Sanity: rank monotonically increases, multipliers monotonically increase,
    // slugs match TIER_SLUGS order. Catch local drift even when both files agree.
    if (backendTiers.length !== (backendSlugs?.length ?? 0)) {
      fail(`TIERS length (${backendTiers.length}) != TIER_SLUGS length (${backendSlugs?.length})`)
    }
    for (let i = 0; i < backendTiers.length; i += 1) {
      const t = backendTiers[i]
      if (t.rank !== i + 1) fail(`TIERS[${i}].rank should be ${i + 1}, got ${t.rank}`)
      if (backendSlugs && t.slug !== backendSlugs[i]) {
        fail(`TIERS[${i}].slug "${t.slug}" doesn't match TIER_SLUGS[${i}] "${backendSlugs[i]}"`)
      }
      if (i > 0 && t.multiplier <= backendTiers[i - 1].multiplier) {
        fail(`TIERS[${i}].multiplier (${t.multiplier}) must be greater than TIERS[${i - 1}].multiplier (${backendTiers[i - 1].multiplier})`)
      }
    }
  }
}

if (failures.length === 0) {
  console.log("✓ customer-tiers.ts files are in sync")
  process.exit(0)
} else {
  console.error("✗ customer-tiers.ts files are OUT OF SYNC:\n")
  for (const f of failures) {
    console.error(`  - ${f}\n`)
  }
  console.error(
    "Edit both files together (backend canonical → storefront mirror) and re-run."
  )
  process.exit(1)
}
