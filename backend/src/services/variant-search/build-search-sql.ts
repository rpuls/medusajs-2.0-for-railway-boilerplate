import { escapeForLike } from "./tokenize"

/**
 * Build the parameterised SQL that returns variant IDs matching every token
 * in `tokens` against a per-variant search blob.
 *
 * The blob concatenates:
 *   - product title / handle / subtitle / description
 *   - product_type.value (e.g. "T-Shirts")
 *   - linked brand name + handle (via the product↔brand link table)
 *   - variant title + SKU
 *   - aggregated option values (color, size, fit, ...)
 *   - aggregated product tags
 *
 * Every value is lowercased once on the variant side so the per-token LIKE
 * comparison is case-insensitive without ILIKE.
 *
 * Tokens are AND'd together — every token must appear in the blob — which is
 * what gives "staple black" the discriminating behaviour single-substring
 * search can't.
 *
 * `ESCAPE E'\\'` forces the LIKE pattern to treat backslash as the escape
 * character regardless of the server's standard_conforming_strings setting,
 * matching the escapes produced by `escapeForLike`.
 */
export function buildSearchSql(
  tokens: string[],
  limit: number
): { text: string; bindings: Record<string, string | number> } {
  if (tokens.length === 0) {
    throw new Error("buildSearchSql requires at least one token")
  }
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error(`buildSearchSql requires a positive integer limit, got ${limit}`)
  }

  const tokenClauses = tokens
    .map((_, i) => `search_text LIKE :token${i} ESCAPE E'\\\\'`)
    .join(" AND ")

  const text = `
    WITH variant_search AS (
      SELECT
        pv.id AS variant_id,
        LOWER(
          COALESCE(p.title, '') || ' ' ||
          COALESCE(p.handle, '') || ' ' ||
          COALESCE(p.subtitle, '') || ' ' ||
          COALESCE(p.description, '') || ' ' ||
          COALESCE(pt.value, '') || ' ' ||
          COALESCE(b.name, '') || ' ' ||
          COALESCE(b.handle, '') || ' ' ||
          COALESCE(pv.title, '') || ' ' ||
          COALESCE(pv.sku, '') || ' ' ||
          COALESCE(opt_agg.values, '') || ' ' ||
          COALESCE(tag_agg.values, '')
        ) AS search_text
      FROM product_variant pv
      JOIN product p ON p.id = pv.product_id AND p.deleted_at IS NULL
      LEFT JOIN product_type pt ON pt.id = p.type_id AND pt.deleted_at IS NULL
      LEFT JOIN product_product_brand_brand pbb
        ON pbb.product_id = p.id AND pbb.deleted_at IS NULL
      LEFT JOIN brand b ON b.id = pbb.brand_id AND b.deleted_at IS NULL
      LEFT JOIN (
        SELECT pvo.variant_id, string_agg(pov.value, ' ') AS values
        FROM product_variant_option pvo
        JOIN product_option_value pov
          ON pov.id = pvo.option_value_id AND pov.deleted_at IS NULL
        GROUP BY pvo.variant_id
      ) opt_agg ON opt_agg.variant_id = pv.id
      LEFT JOIN (
        SELECT ptg.product_id, string_agg(t.value, ' ') AS values
        FROM product_tags ptg
        JOIN product_tag t ON t.id = ptg.product_tag_id AND t.deleted_at IS NULL
        GROUP BY ptg.product_id
      ) tag_agg ON tag_agg.product_id = p.id
      WHERE pv.deleted_at IS NULL
    )
    SELECT variant_id FROM variant_search
    WHERE ${tokenClauses}
    ORDER BY variant_id
    LIMIT :limit
  `

  const bindings: Record<string, string | number> = { limit }
  tokens.forEach((token, i) => {
    bindings[`token${i}`] = `%${escapeForLike(token)}%`
  })

  return { text, bindings }
}
