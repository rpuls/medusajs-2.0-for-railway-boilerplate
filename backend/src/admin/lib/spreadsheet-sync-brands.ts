/**
 * Resolves CSV-supplied product BRAND values (e.g. "Biz Collection", "BIZ", "DNC Workwear") into
 * brand IDs from the Brand module. Brands aren't first-class on Medusa's batch product API, so we
 * attach them via a Module Link after the products are created. This helper does the lookup
 * + auto-create step; callers consume `brandIdByHandle` when wiring the link batch.
 *
 * Mirrors the structure of `spreadsheet-sync-tags.ts` (case-insensitive lookup, snapshot existing,
 * auto-create the rest) but adds a secondary `external_code` lookup so a cell of "BIZ" resolves
 * to the brand whose external_code is "BIZ" without requiring the staff to spell out "Biz Collection".
 *
 * Kept SDK-agnostic via a minimal interface so the resolution logic stays unit-testable.
 */

import { brandValueKey, slugifyBrandHandle } from "../../lib/brand-handle"

export type BrandRecord = {
  id: string
  name: string
  handle: string
  external_code: string | null
}

export type BrandClient = {
  list(query: {
    limit?: number
    offset?: number
  }): Promise<{ brands: BrandRecord[]; count: number; limit: number; offset: number }>
  create(body: {
    name: string
    handle?: string
    external_code?: string | null
  }): Promise<{ brand: BrandRecord }>
}

async function fetchAllBrands(client: BrandClient): Promise<BrandRecord[]> {
  const PAGE = 200
  const all: BrandRecord[] = []
  let offset = 0
  while (true) {
    const resp = await client.list({ limit: PAGE, offset })
    all.push(...resp.brands)
    offset += resp.brands.length
    if (resp.brands.length < PAGE || offset >= resp.count) break
  }
  return all
}

export type BrandResolution = {
  /** Lower-cased brand name → brand id. */
  idByLowerName: Map<string, string>
  /** Lower-cased external_code → brand id. Secondary lookup so cells like "BIZ" / "asc" resolve. */
  idByExternalCode: Map<string, string>
  /** Human-readable log of created/skipped brands. */
  createdLog: string[]
}

/**
 * Snapshot existing brands, then for every input value that doesn't resolve via name OR
 * external_code, create a new brand. New brands get `parent_id = null` and the cell value
 * as `name` — staff can re-parent / set a code afterwards via the admin Brands page.
 *
 * Resolution priority used by the caller (per cell):
 *   1. idByLowerName.get(brandValueKey(cell))
 *   2. idByExternalCode.get(brandValueKey(cell))
 *   3. miss → auto-created during this call, then resolved via idByLowerName
 */
export async function resolveBrandValues(
  client: BrandClient,
  values: ReadonlyArray<string>
): Promise<BrandResolution> {
  const createdLog: string[] = []
  const idByLowerName = new Map<string, string>()
  const idByExternalCode = new Map<string, string>()
  if (!values.length) {
    return { idByLowerName, idByExternalCode, createdLog }
  }

  const wantedByLower = new Map<string, string>()
  for (const v of values) {
    const trimmed = v.trim()
    if (!trimmed) continue
    const k = brandValueKey(trimmed)
    if (!wantedByLower.has(k)) wantedByLower.set(k, trimmed)
  }

  const existing = await fetchAllBrands(client)
  for (const b of existing) {
    idByLowerName.set(brandValueKey(b.name), b.id)
    if (b.external_code) {
      idByExternalCode.set(brandValueKey(b.external_code), b.id)
    }
  }

  for (const [lower, original] of wantedByLower) {
    if (idByLowerName.has(lower)) continue
    if (idByExternalCode.has(lower)) {
      idByLowerName.set(lower, idByExternalCode.get(lower)!)
      continue
    }
    try {
      const created = await client.create({
        name: original,
        handle: slugifyBrandHandle(original),
      })
      const id = created.brand.id
      idByLowerName.set(lower, id)
      createdLog.push(
        `Auto-created brand "${original}" (id ${id}). Set its parent / external code in admin if needed.`
      )
    } catch (e) {
      createdLog.push(
        `Failed to create brand "${original}": ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }

  return { idByLowerName, idByExternalCode, createdLog }
}

/**
 * Resolve a single cell value to a brand ID using the precomputed maps. Returns null if the
 * value is empty or unresolvable.
 */
export function resolveBrandIdForValue(
  value: string | null | undefined,
  resolution: BrandResolution
): string | null {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return null
  const k = brandValueKey(trimmed)
  return (
    resolution.idByLowerName.get(k) ??
    resolution.idByExternalCode.get(k) ??
    null
  )
}
