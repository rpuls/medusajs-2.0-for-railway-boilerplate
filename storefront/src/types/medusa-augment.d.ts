/**
 * Augments the Medusa store-side product params with fields the API actually
 * accepts but that the SDK preview types don't model:
 *   - `handle`: filter products by URL handle
 *   - `q`: full-text search
 *   - `collection_id` / `tag_id`: filter by collection/tag (string or array)
 *   - `is_giftcard`: gift-card filter
 *
 * Once @medusajs/types stops being on the `preview` channel and these fields
 * land upstream, this file can be deleted.
 */

// Module augmentation didn't take because the relevant interface lives in an
// unpublished sub-path of @medusajs/types (`dist/http/product/common`) that
// isn't reachable via a public export. Once @medusajs/types ships these fields
// upstream (or exposes a subpath we can target), this file can be reinstated
// to declare-merge them. In the meantime, the few call sites cast inline.
