/**
 * Resolves CSV-supplied product tag VALUES (e.g. "accessories", "socks", "healthwear") into Medusa
 * product-tag IDs. `sdk.admin.product.batch({ create })` only accepts tag references as `{ id }`, so this
 * helper looks up existing tags by value (case-insensitive) and creates the missing ones before the
 * page applies them onto the create payload. Mirrors `spreadsheet-sync-categories.ts`.
 *
 * Kept SDK-agnostic via a minimal interface so the resolution logic stays unit-testable.
 */

export type TagRecord = {
  id: string
  value: string
}

export type TagClient = {
  list(query: { limit?: number; offset?: number; fields?: string }): Promise<{
    product_tags: TagRecord[]
    count: number
    limit: number
    offset: number
  }>
  create(body: { value: string }): Promise<{ product_tag: TagRecord }>
}

/** Stable, case-insensitive key for a tag value. */
export function tagValueKey(value: string): string {
  return value.trim().toLowerCase()
}

/** Pull every product tag from Medusa, paging through `list`. */
async function fetchAllTags(client: TagClient): Promise<TagRecord[]> {
  const PAGE = 200
  const all: TagRecord[] = []
  let offset = 0
  while (true) {
    const resp = await client.list({ limit: PAGE, offset, fields: "id,value" })
    all.push(...resp.product_tags)
    offset += resp.product_tags.length
    if (resp.product_tags.length < PAGE || offset >= resp.count) {
      break
    }
  }
  return all
}

/**
 * Resolve a flat list of tag values into Medusa product-tag IDs, auto-creating any that don't exist.
 * - De-dupes case-insensitively (first-seen casing wins for creates).
 * - Returns a Map keyed by lowercase value → id (callers should look up via the same lowercase form).
 * - Errors on individual create attempts are logged but don't abort the whole resolution.
 */
export async function resolveTagValues(
  client: TagClient,
  values: ReadonlyArray<string>
): Promise<{
  idByLowerValue: Map<string, string>
  createdLog: string[]
}> {
  const createdLog: string[] = []
  const idByLowerValue = new Map<string, string>()
  if (!values.length) {
    return { idByLowerValue, createdLog }
  }

  /** De-dupe case-insensitively, preserve first-seen casing for any create calls. */
  const wantedByLower = new Map<string, string>()
  for (const v of values) {
    const trimmed = v.trim()
    if (!trimmed) {
      continue
    }
    const k = tagValueKey(trimmed)
    if (!wantedByLower.has(k)) {
      wantedByLower.set(k, trimmed)
    }
  }

  /** Snapshot existing tags once — Medusa stores `value` as plain text, no dedupe on insert (we own that). */
  const existing = await fetchAllTags(client)
  const existingByLower = new Map<string, string>()
  for (const tag of existing) {
    existingByLower.set(tagValueKey(tag.value), tag.id)
  }

  for (const [lower, original] of wantedByLower) {
    const existingId = existingByLower.get(lower)
    if (existingId) {
      idByLowerValue.set(lower, existingId)
      continue
    }
    try {
      const created = await client.create({ value: original })
      const id = created.product_tag.id
      idByLowerValue.set(lower, id)
      createdLog.push(`Created tag "${original}" (id ${id}).`)
    } catch (e) {
      createdLog.push(
        `Failed to create tag "${original}": ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }

  return { idByLowerValue, createdLog }
}

/**
 * Mutate create-batch entries in place: replace any value-based tag plumbing with `tags: [{ id }, …]`
 * derived from the resolved value→id map. Skips creates whose handle has no tag values.
 */
export function applyTagIdsToCreates(
  creates: Array<Record<string, unknown> & { handle?: string }>,
  tagValuesByHandle: Map<string, string[]>,
  idByLowerValue: Map<string, string>
): void {
  for (const create of creates) {
    const handle = create.handle
    if (!handle) {
      continue
    }
    const values = tagValuesByHandle.get(handle)
    if (!values || values.length === 0) {
      continue
    }
    const ids: Array<{ id: string }> = []
    const seen = new Set<string>()
    for (const v of values) {
      const id = idByLowerValue.get(tagValueKey(v))
      if (id && !seen.has(id)) {
        seen.add(id)
        ids.push({ id })
      }
    }
    if (ids.length) {
      create.tags = ids
    }
  }
}
