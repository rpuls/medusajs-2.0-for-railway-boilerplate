import { model } from "@medusajs/framework/utils"

/**
 * One row per storefront search submission. Powers the "Internal site
 * search" report on the admin Reports page — top queries, zero-result
 * queries (the gold: products customers want that you don't surface).
 *
 * Storage cost is small: we throttle to one row per (query, country,
 * customer) per minute on the storefront write path so refresh-bots
 * don't pollute the dataset.
 */
const SearchEvent = model
  .define("search_event", {
    id: model.id({ prefix: "se" }).primaryKey(),
    query: model.text(),
    /** Lower-cased trimmed query for grouping and de-duplication. */
    query_normalized: model.text(),
    results_count: model.number(),
    country_code: model.text().nullable(),
    customer_id: model.text().nullable(),
  })
  .indexes([
    { on: ["query_normalized"] },
    { on: ["customer_id"] },
  ])

export default SearchEvent
