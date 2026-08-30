import { defineProductSearchIndex } from '@rokmohar/medusa-plugin-meilisearch/indexes'

/**
 * Declares the `products` search index.
 *
 * Everything in this directory is loaded before the app boots and handed to
 * the Search Module, which owns the index from there: `medusa db:migrate`
 * creates it in Meilisearch, the module seeds it on first boot, and catalog
 * events keep it current. There is no indexing code to run and no startup
 * sync job to wait for.
 *
 * The factory default indexes published products with the standard schema
 * (id, title, handle, thumbnail, description, collection, categories, tags,
 * variants and so on), which already covers what the storefront's search
 * results render. Extend it with `fields: search.define({ ... })` and
 * `graph_fields` if a store adds attributes it wants searchable.
 */
export default defineProductSearchIndex()
