/**
 * Classifies an inventory_item as "orphan" based on its link rows in
 * `product_variant_inventory_item`. An inventory_item is an orphan when
 * NO live link row points to a live variant.
 *
 * A link row "saves" an inventory_item from being orphaned only if:
 *   - link.deleted_at IS NULL, AND
 *   - the referenced product_variant exists, AND
 *   - that product_variant's deleted_at IS NULL
 *
 * The link table and the product_variant table live in different Medusa
 * modules with no FK cascade between them, so deleting a product_variant
 * leaves its link rows behind pointing at a now-missing variant. Those
 * "stranded" links must not count as proof the inventory_item is still
 * in use — that was the bug behind the silent no-op of the original
 * orphan-cleanup script.
 */
export type InventoryLinkProbe = {
  /** product_variant_inventory_item.deleted_at */
  link_deleted_at: Date | string | null
  /** Whether a product_variant row exists for link.variant_id */
  variant_exists: boolean
  /** product_variant.deleted_at (null if variant missing or live) */
  variant_deleted_at: Date | string | null
}

export function isLiveLinkToLiveVariant(link: InventoryLinkProbe): boolean {
  return (
    link.link_deleted_at === null &&
    link.variant_exists &&
    link.variant_deleted_at === null
  )
}

export function isOrphanInventoryItem(links: InventoryLinkProbe[]): boolean {
  return !links.some(isLiveLinkToLiveVariant)
}
