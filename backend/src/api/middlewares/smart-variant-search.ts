import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { smartSearchVariantIds } from "../../services/variant-search"
import { tokenize } from "../../services/variant-search/tokenize"

/**
 * Sentinel ID returned to Medusa when smart search finds zero matches. ULID-
 * shaped so the validator accepts it but no real variant will ever collide.
 */
const NO_MATCH_SENTINEL = "variant_no_smart_search_match_00000000000"

function pickString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value
  }
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0]
  }
  return undefined
}

/**
 * Intercept `GET /admin/product-variants?q=...` when the query has two or more
 * tokens and rewrite it into an `id[]` filter built from a richer multi-field
 * AND search (product title/handle/description, brand, options, tags, type,
 * variant title/SKU).
 *
 * Single-token queries pass through to Medusa's default ILIKE handling so the
 * common "search by SKU" / "search by product title" path stays on the
 * existing fast path.
 *
 * Existing `id` filters are respected — callers that have already narrowed by
 * ID get the intersection they asked for, not an override.
 */
export async function smartVariantSearchMiddleware(
  req: MedusaRequest,
  _res: MedusaResponse,
  next: MedusaNextFunction
): Promise<void> {
  const query = req.query as Record<string, unknown>
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as {
    info: (msg: string) => void
    warn: (msg: string) => void
  }

  if (query.id !== undefined) {
    logger.info(`[smart-variant-search] skip: id already set`)
    return next()
  }

  const q = pickString(query.q)
  if (!q) {
    return next()
  }

  const tokens = tokenize(q)
  if (tokens.length < 2) {
    logger.info(
      `[smart-variant-search] passthrough single-token q="${q}" (tokens=${tokens.length})`
    )
    return next()
  }

  const pg = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as Parameters<
    typeof smartSearchVariantIds
  >[0]

  const startedAt = Date.now()
  let matchingIds: string[]
  try {
    matchingIds = await smartSearchVariantIds(pg, q)
  } catch (err) {
    logger.warn(
      `[smart-variant-search] SQL failure for q="${q}" (tokens=${JSON.stringify(
        tokens
      )}): ${(err as Error).message}`
    )
    // Surface the failure to staff via Medusa's error pipeline rather than
    // pretending we found nothing.
    throw err
  }
  const elapsedMs = Date.now() - startedAt
  logger.info(
    `[smart-variant-search] q="${q}" tokens=${JSON.stringify(tokens)} matches=${
      matchingIds.length
    } elapsed_ms=${elapsedMs}`
  )

  query.id = matchingIds.length > 0 ? matchingIds : [NO_MATCH_SENTINEL]
  delete query.q

  return next()
}
