import { buildSearchSql } from "./build-search-sql"
import { tokenize } from "./tokenize"

/**
 * Cap on candidate variant IDs returned from the smart search before Medusa's
 * default handler paginates them. 1000 covers ~50 pages at the dashboard's
 * 20-row default — plenty for staff exploration, and bounded so a pathological
 * single-letter token can't pull every variant into memory.
 */
const DEFAULT_CANDIDATE_LIMIT = 1000

/**
 * Knex-compatible connection interface used by the search.
 * Typed loosely because the container resolves a Knex instance configured by
 * Medusa core, and we only need `raw()` here.
 */
type PgConnection = {
  raw(sql: string, bindings?: Record<string, unknown>): Promise<{ rows: Array<{ variant_id: string }> }>
}

export interface SmartSearchOptions {
  limit?: number
}

/**
 * Tokenise `q` on whitespace, then return every variant ID whose search blob
 * matches every token (AND semantics). Returns an empty array for a query
 * that yields no tokens.
 */
export async function smartSearchVariantIds(
  pg: PgConnection,
  q: string,
  options: SmartSearchOptions = {}
): Promise<string[]> {
  const tokens = tokenize(q)
  if (tokens.length === 0) {
    return []
  }
  const limit = options.limit ?? DEFAULT_CANDIDATE_LIMIT
  const { text, bindings } = buildSearchSql(tokens, limit)
  const result = await pg.raw(text, bindings)
  return result.rows.map((row) => row.variant_id)
}

export { buildSearchSql, tokenize, DEFAULT_CANDIDATE_LIMIT }
