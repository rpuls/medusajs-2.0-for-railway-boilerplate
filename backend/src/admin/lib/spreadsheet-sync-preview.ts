/**
 * Shared helper for the spreadsheet-sync preview UI (both create and update flows).
 *
 * Groups a parsed CSV's rows by product handle and produces a per-product summary the preview
 * table renders as a checkbox list. Staff can uncheck a product to exclude it from the import;
 * the default check state is driven by whether the product has any non-fatal warnings (see
 * `warningsByHandle` in the create-flow result type).
 *
 * Kept pure (no React, no SDK) so it's trivially unit-testable.
 */

export type PreviewRowSource = {
  handle: string
  title?: string | null
  brand?: string | null
}

export type PreviewProduct = {
  handle: string
  title: string
  brand: string | null
  variantCount: number
  warnings: string[]
  defaultChecked: boolean
}

export type GroupRowsByProductOptions = {
  warningsByHandle?: ReadonlyMap<string, ReadonlyArray<string>>
}

/**
 * Group flat CSV rows by product handle, counting variants and bubbling the title + brand
 * cell from the first row. Order of products in the result matches first-seen order in the input.
 *
 * `defaultChecked` is `true` when the product has no warnings — staff can opt-in to skipping
 * clean products. Products with any warning start unchecked so the staff have to consciously
 * include them (per the design decision).
 */
export function groupRowsByProduct(
  rows: ReadonlyArray<PreviewRowSource>,
  options?: GroupRowsByProductOptions
): PreviewProduct[] {
  const order: string[] = []
  const map = new Map<string, { title: string; brand: string | null; variantCount: number }>()

  for (const row of rows) {
    const handle = row.handle?.trim()
    if (!handle) continue
    const existing = map.get(handle)
    if (existing) {
      existing.variantCount += 1
    } else {
      order.push(handle)
      map.set(handle, {
        title: row.title?.trim() || handle,
        brand: row.brand?.trim() || null,
        variantCount: 1,
      })
    }
  }

  const warningsByHandle = options?.warningsByHandle
  return order.map((handle) => {
    const entry = map.get(handle)!
    const warnings = (warningsByHandle?.get(handle) ?? []) as string[]
    return {
      handle,
      title: entry.title,
      brand: entry.brand,
      variantCount: entry.variantCount,
      warnings: [...warnings],
      defaultChecked: warnings.length === 0,
    }
  })
}

/**
 * Compute the initial set of handles that should be skipped (i.e. checkbox = unchecked).
 * Used by the preview UI to seed its `skippedHandles` state.
 */
export function initialSkippedHandles(products: ReadonlyArray<PreviewProduct>): Set<string> {
  const skipped = new Set<string>()
  for (const p of products) {
    if (!p.defaultChecked) skipped.add(p.handle)
  }
  return skipped
}
