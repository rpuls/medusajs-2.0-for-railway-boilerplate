import { Button, Checkbox, Container, Heading, Text } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

import {
  applySpreadsheetHeaderAliases,
  chunkCreates,
} from "../../lib/spreadsheet-sync-import"
import {
  buildBatchUpdatesFromParsedCsv,
  buildVariantGarmentDataByProductId,
  computeProductUpdateColumnCandidates,
  computeProductUpdatePreview,
  findVariantRowForCsvSku,
  parsedCsvHasVariantGarmentSourceRows,
  PRODUCT_UPDATE_BATCH_CHUNK_SIZE,
  productUpdateBatchChunkSize,
  spreadsheetHeadersIgnoringPatchable,
  VARIANT_GARMENT_METADATA_CSV_KEY,
  type VariantGarmentCsvRow,
} from "../../lib/spreadsheet-sync-update-import"
import {
  resolveBrandValues,
  resolveBrandIdForValue,
  type BrandClient,
} from "../../lib/spreadsheet-sync-brands"
import { parseCsv } from "../../lib/csv-import"
import { sdk } from "../../lib/sdk"

const adminFetchPath = (path: string) => {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

const mergeVariantGarmentMetadata = (
  existing: Record<string, unknown> | undefined,
  csv: VariantGarmentCsvRow
): Record<string, unknown> => {
  const garment_images = {
    front: csv.front,
    back: csv.back,
    all: [csv.front, csv.back].filter(Boolean),
  }
  return {
    ...(existing ?? {}),
    ...(csv.color ? { garment_color: csv.color } : {}),
    garment_images,
  }
}

const SpreadsheetSyncUpdatePage = () => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [rawCsvText, setRawCsvText] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const [syncing, setSyncing] = useState(false)
  const [syncLog, setSyncLog] = useState<string[]>([])

  /** Which patchable CSV columns to send to Medusa (subset of analysed candidates). */
  const [enabledList, setEnabledList] = useState<string[]>([])
  /** Product IDs the staff has unchecked in the per-product preview list. Skipped before batch. */
  const [skippedProductIds, setSkippedProductIds] = useState<Set<string>>(new Set())

  const fileAnalysis = useMemo(() => {
    if (!rawCsvText) {
      return null
    }
    let parsed = parseCsv(rawCsvText)
    parsed = applySpreadsheetHeaderAliases(parsed)
    const preview = computeProductUpdatePreview(parsed)
    const extraHeaders = spreadsheetHeadersIgnoringPatchable(parsed)
    const candidates =
      preview.validationErrors.length === 0 ? computeProductUpdateColumnCandidates(parsed) : []
    return { parsed, preview, candidates, extraHeaders }
  }, [rawCsvText])

  const candidatesSig =
    fileAnalysis && fileAnalysis.preview.validationErrors.length === 0
      ? fileAnalysis.candidates.map((c) => c.csvKey).sort().join("\0")
      : ""

  useEffect(() => {
    if (!fileAnalysis || fileAnalysis.preview.validationErrors.length > 0) {
      setEnabledList([])
      return
    }
    setEnabledList(fileAnalysis.candidates.map((c) => c.csvKey))
  }, [rawCsvText, candidatesSig])

  const enabledCsvKeys = useMemo(() => new Set(enabledList), [enabledList])

  const buildOutcome = useMemo(() => {
    if (!fileAnalysis || fileAnalysis.preview.validationErrors.length > 0) {
      return {
        updates: [] as Record<string, unknown>[],
        buildErrors: [] as string[],
        variantGarmentByProduct: new Map<
          string,
          Map<string, VariantGarmentCsvRow>
        >(),
        brandValueByProductId: new Map<string, string>(),
      }
    }
    const { updates, errors, brandValueByProductId } = buildBatchUpdatesFromParsedCsv(
      fileAnalysis.parsed,
      { enabledCsvKeys }
    )
    const vg = buildVariantGarmentDataByProductId(fileAnalysis.parsed, enabledCsvKeys)
    return {
      updates,
      buildErrors: [...errors, ...vg.errors],
      variantGarmentByProduct: vg.byProduct,
      brandValueByProductId,
    }
  }, [fileAnalysis, enabledCsvKeys])

  /**
   * Per-product preview rows for the update flow. Grouped by `Product Id` (not handle, since
   * update mode matches against existing rows by id). No warning-driven auto-uncheck here —
   * update warnings live at the batch level, not per-product.
   */
  const previewProductsForUpdate = useMemo(() => {
    if (!fileAnalysis || fileAnalysis.preview.validationErrors.length > 0) return []
    const map = new Map<
      string,
      { handle: string; title: string; brand: string | null; rowCount: number }
    >()
    const order: string[] = []
    for (const row of fileAnalysis.parsed.rows) {
      const id = (row["product id"] ?? "").trim()
      if (!id) continue
      const existing = map.get(id)
      if (existing) {
        existing.rowCount += 1
      } else {
        order.push(id)
        map.set(id, {
          handle: (row["product handle"] ?? "").trim(),
          title: (row["product title"] ?? "").trim() || id,
          brand:
            ((row["product brand"] ?? row["product supplier"] ?? "") as string).trim() || null,
          rowCount: 1,
        })
      }
    }
    return order.map((id) => ({ id, ...map.get(id)! }))
  }, [fileAnalysis])

  useEffect(() => {
    setSkippedProductIds(new Set())
  }, [rawCsvText, previewProductsForUpdate.length])

  const toggleSkipUpdate = useCallback((id: string) => {
    setSkippedProductIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const includedUpdateCount = previewProductsForUpdate.length - skippedProductIds.size

  const toggleColumn = useCallback((csvKey: string, next: boolean) => {
    setEnabledList((prev) => {
      const has = prev.includes(csvKey)
      if (next && !has) {
        return [...prev, csvKey]
      }
      if (!next && has) {
        return prev.filter((k) => k !== csvKey)
      }
      return prev
    })
  }, [])

  const onPickFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setParseError(null)
    setSyncLog([])
    setRawCsvText(null)
    setFileName(file?.name ?? null)

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      setRawCsvText(text)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to read file")
    }
  }, [])

  const preview = fileAnalysis?.preview ?? null
  const buildErrors = buildOutcome.buildErrors
  const updates = buildOutcome.updates
  const variantGarmentByProduct = buildOutcome.variantGarmentByProduct
  const candidates = fileAnalysis?.candidates ?? []
  const extraHeaders = fileAnalysis?.extraHeaders ?? []

  const allChecked =
    candidates.length > 0 && candidates.every((c) => enabledList.includes(c.csvKey))
  const noneChecked = enabledList.length === 0

  const hasVariantGarmentWork = variantGarmentByProduct.size > 0

  const variantGarmentUncheckedWarning =
    !!fileAnalysis &&
    fileAnalysis.preview.validationErrors.length === 0 &&
    parsedCsvHasVariantGarmentSourceRows(fileAnalysis.parsed) &&
    !enabledList.includes(VARIANT_GARMENT_METADATA_CSV_KEY)

  const canSync =
    !!fileAnalysis &&
    preview &&
    preview.validationErrors.length === 0 &&
    buildErrors.length === 0 &&
    (updates.length > 0 || hasVariantGarmentWork) &&
    enabledList.length > 0 &&
    includedUpdateCount > 0 &&
    !syncing

  const onSync = useCallback(async () => {
    if (!rawCsvText) {
      return
    }

    let parsed = parseCsv(rawCsvText)
    parsed = applySpreadsheetHeaderAliases(parsed)
    const pre = computeProductUpdatePreview(parsed)
    if (pre.validationErrors.length > 0) {
      return
    }
    const enabled = new Set(enabledList)
    const {
      updates: allToUpdate,
      errors,
      brandValueByProductId,
    } = buildBatchUpdatesFromParsedCsv(parsed, {
      enabledCsvKeys: enabled,
    })
    const vg = buildVariantGarmentDataByProductId(parsed, enabled)
    if (errors.length > 0 || vg.errors.length > 0) {
      return
    }
    /**
     * Strip out products the staff unchecked in the preview list. Same semantics as the create
     * flow: skipped products are filtered out before the batch update call so no metadata,
     * variants, or brand links change for them.
     */
    const toUpdate = (allToUpdate as Array<Record<string, unknown> & { id?: string }>).filter(
      (u) => !skippedProductIds.has(String(u.id ?? ""))
    )
    /** Also drop variant garment work and brand updates for skipped products. */
    for (const id of [...vg.byProduct.keys()]) {
      if (skippedProductIds.has(id)) vg.byProduct.delete(id)
    }
    for (const id of [...brandValueByProductId.keys()]) {
      if (skippedProductIds.has(id)) brandValueByProductId.delete(id)
    }
    if (toUpdate.length === 0 && vg.byProduct.size === 0 && brandValueByProductId.size === 0) {
      return
    }

    setSyncing(true)
    setSyncLog([])

    const log: string[] = []

    const formatBatchFailure = (e: unknown): string => {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg === "Failed to fetch" || msg === "Load failed") {
        return (
          `${msg} — usually the browser lost the HTTP response (offline blip, wrong API base URL, or ` +
          `the server/proxy stopped the request while importing remote images). Image/thumbnail sync uses smaller batches; ` +
          `if this persists, increase proxy timeouts (Fly/nginx) or sync fewer products at once.`
        )
      }
      return msg
    }

    const isRetryableBatchError = (e: unknown): boolean => {
      const msg = e instanceof Error ? e.message : String(e)
      return msg === "Failed to fetch" || msg === "Load failed" || msg.includes("NetworkError")
    }

    try {
      const chunkSize = productUpdateBatchChunkSize(enabledList)
      if (toUpdate.length > 0) {
        const batches = chunkCreates(toUpdate, chunkSize)
        log.push(
          `Product batch size: ${chunkSize} product(s) per request` +
            (chunkSize < PRODUCT_UPDATE_BATCH_CHUNK_SIZE
              ? " (reduced for thumbnail / gallery / variant image columns)."
              : ".")
        )

        type BatchProductResp = {
          updated?: Array<{ id?: string; handle?: string; title?: string }>
          products?: Array<{ id?: string; handle?: string; title?: string }>
        }

        let batchIdx = 0
        for (const chunk of batches) {
          batchIdx++
          log.push(`Batch ${batchIdx}/${batches.length}: updating ${chunk.length} product(s)...`)

          const maxAttempts = 3
          let resp: BatchProductResp | undefined
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              resp = (await sdk.admin.product.batch(
                { update: chunk as never },
                { fields: "id,handle,title" }
              )) as BatchProductResp
              break
            } catch (e) {
              if (!isRetryableBatchError(e) || attempt === maxAttempts) {
                throw e
              }
              const msg = e instanceof Error ? e.message : String(e)
              log.push(`  Request failed (${msg}). Retrying (${attempt}/${maxAttempts}) in 2s…`)
              setSyncLog([...log])
              await new Promise((r) => setTimeout(r, 2000))
            }
          }

          if (!resp) {
            throw new Error("Product batch returned no response after retries.")
          }

          const updated = resp.updated ?? resp.products ?? []
          for (const p of updated) {
            const id = p.id ?? "(unknown id)"
            const handle = p.handle ?? ""
            log.push(`  Updated ${id}${handle ? ` (${handle})` : ""}.`)
          }

          if (!updated.length) {
            log.push(`  (No products returned in batch response — check Admin API logs.)`)
          }
        }
      } else {
        log.push("Skipping product batch — no product-level field updates selected.")
      }

      const variantEntries = [...vg.byProduct.entries()]
      if (variantEntries.length > 0) {
        log.push(
          `Variant garment metadata (PDP): ${variantEntries.length} product(s), merging metadata from CSV Image 1/2 per Variant SKU…`
        )
        let vIdx = 0
        for (const [productId, skuMap] of variantEntries) {
          vIdx++
          log.push(`  Variants ${vIdx}/${variantEntries.length}: product ${productId} (${skuMap.size} SKU row(s) in file)…`)

          const maxAttempts = 3
          type RetrieveResp = { product?: { variants?: Array<{ id: string; sku?: string | null; metadata?: Record<string, unknown> }> } }
          let retrieved: RetrieveResp | undefined
          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              retrieved = (await sdk.admin.product.retrieve(productId, {
                fields: "id,variants.id,variants.sku,variants.metadata",
              })) as RetrieveResp
              break
            } catch (e) {
              if (!isRetryableBatchError(e) || attempt === maxAttempts) {
                throw e
              }
              const msg = e instanceof Error ? e.message : String(e)
              log.push(`    Retrieve failed (${msg}). Retrying (${attempt}/${maxAttempts}) in 2s…`)
              setSyncLog([...log])
              await new Promise((r) => setTimeout(r, 2000))
            }
          }

          const variants = retrieved?.product?.variants ?? []
          const batchUpdates: Array<{ id: string; metadata: Record<string, unknown> }> = []
          const missingSkus: string[] = []

          for (const [sku, csvRow] of skuMap) {
            const v = findVariantRowForCsvSku(variants, sku)
            if (!v) {
              missingSkus.push(sku)
              continue
            }
            batchUpdates.push({
              id: v.id,
              metadata: mergeVariantGarmentMetadata(v.metadata, csvRow),
            })
          }

          if (missingSkus.length > 0) {
            log.push(
              `    Warning: ${missingSkus.length} SKU(s) from CSV not found on product — skipped: ${missingSkus.slice(0, 8).join(", ")}${missingSkus.length > 8 ? " …" : ""}`
            )
          }

          if (batchUpdates.length === 0) {
            log.push(`    No matching variants to update for this product.`)
            continue
          }

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              await sdk.admin.product.batchVariants(
                productId,
                { update: batchUpdates as never },
                { fields: "id,sku" }
              )
              break
            } catch (e) {
              if (!isRetryableBatchError(e) || attempt === maxAttempts) {
                throw e
              }
              const msg = e instanceof Error ? e.message : String(e)
              log.push(`    batchVariants failed (${msg}). Retrying (${attempt}/${maxAttempts}) in 2s…`)
              setSyncLog([...log])
              await new Promise((r) => setTimeout(r, 2000))
            }
          }

          log.push(`    Updated garment metadata on ${batchUpdates.length} variant(s).`)
          setSyncLog([...log])
        }
      }

      if (brandValueByProductId.size > 0) {
        const distinctValues: string[] = []
        const seen = new Set<string>()
        for (const v of brandValueByProductId.values()) {
          const k = v.trim().toLowerCase()
          if (k && !seen.has(k)) {
            seen.add(k)
            distinctValues.push(v)
          }
        }
        log.push(`Resolving ${distinctValues.length} product brand(s)…`)
        try {
          const brandClient: BrandClient = {
            list: ({ limit, offset }) =>
              fetch(
                adminFetchPath(`/admin/brands?limit=${limit ?? 200}&offset=${offset ?? 0}`),
                { credentials: "include" }
              ).then((r) => r.json()),
            create: (body) =>
              fetch(adminFetchPath("/admin/brands"), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              }).then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                return r.json()
              }),
          }
          const resolution = await resolveBrandValues(brandClient, distinctValues)
          resolution.createdLog.forEach((m) => log.push(m))
          let okN = 0
          let failN = 0
          for (const [productId, cell] of brandValueByProductId) {
            const brandId = resolveBrandIdForValue(cell, resolution)
            if (!brandId) {
              failN++
              continue
            }
            try {
              const r = await fetch(adminFetchPath(`/admin/products/${productId}/brand`), {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brand_id: brandId }),
              })
              if (r.ok) okN++
              else failN++
            } catch {
              failN++
            }
          }
          log.push(`Brand links: ${okN} attached, ${failN} failed.`)
        } catch (e) {
          log.push(
            `Brand resolution failed: ${e instanceof Error ? e.message : String(e)} — brand links not applied.`
          )
        }
      }

      log.push("Done.")
      setSyncLog(log)
    } catch (e) {
      log.push(`Sync failed: ${formatBatchFailure(e)}`)
      setSyncLog(log)
    } finally {
      setSyncing(false)
    }
  }, [rawCsvText, enabledList, skippedProductIds])

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <Heading level="h1" className="flex items-center">
          Spreadsheet sync (updates)
          <HelpTooltip
            text={{
              title: "Spreadsheet sync (updates)",
              body: "Patch existing products and variants from a CSV. Only updates the columns you tick — every other column on every row is ignored. Matches by Product Id (prod_…) so a typo or rename in the title can't accidentally hit the wrong product.",
              bullets: [
                "Workflow: upload → review preview → tick the columns you want patched → Confirm sync.",
                "Product-level columns: value taken from the first row per Product Id. Variant-level columns (PDP images): value taken from each individual row matched by SKU.",
                "Variant garment images live under variant metadata.garment_images, NOT in the variant Media panel — that one only shows files uploaded to Medusa.",
                "Never use this tab to create new products — it skips rows whose Product Id doesn't already exist.",
              ],
            }}
          />
        </Heading>
        <Text size="small" className="text-ui-fg-muted mt-1">
          <strong>Updates existing products only</strong>: product fields use{" "}
          <code className="text-xs">sdk.admin.product.batch</code> (<code className="text-xs">update</code>); per-variant
          PDP photos use <code className="text-xs">variant garment images (PDP metadata)</code> →{" "}
          <code className="text-xs">sdk.admin.product.batchVariants</code> (merges{" "}
          <code className="text-xs">metadata.garment_images</code> from every row, matched by Variant SKU). Each row must
          include <code className="text-xs">Product Id</code> (<code className="text-xs">prod_…</code>). For product-level
          columns, values come from the <strong>first row</strong> per Product Id. The Admin variant{" "}
          <strong>Media</strong> panel only shows files uploaded into Medusa; garment URLs from your CSV live under variant{" "}
          <strong>Metadata</strong> (and drive the storefront gallery). To create new products, use{" "}
          <a href="/app/spreadsheet-sync" className="text-ui-fg-interactive hover:underline">
            Spreadsheet sync (new)
          </a>
          .
        </Text>
      </div>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-3 px-6 py-4">
          <Text weight="plus" size="small" className="flex items-center">
            1. Upload CSV
            <HelpTooltip
              text={{
                title: "Upload CSV",
                body: "Pick the CSV holding the product/variant patches. Each row must include a Product Id (prod_…) — that's how the importer matches rows to existing products.",
                bullets: [
                  "Easiest source: export Products → 'Export products' from Medusa, edit the columns you want to change in Excel/Sheets, save as CSV, upload here.",
                  "Variant-level updates (per-colour PDP images) need every row to also include Variant SKU.",
                  "Empty cells are ignored — they don't blank-out the existing field. To remove a value, you'd need a separate workflow.",
                ],
              }}
            />
          </Text>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onPickFile}
            className="block w-full max-w-md cursor-pointer text-sm text-ui-fg-base file:mr-4 file:rounded-md file:border file:border-ui-border-base file:bg-ui-bg-field file:px-3 file:py-1.5 file:text-sm file:text-ui-fg-base hover:file:bg-ui-bg-field-hover"
          />
          {fileName ? (
            <Text size="small" className="text-ui-fg-muted">
              Selected: {fileName}
            </Text>
          ) : null}
          {parseError ? (
            <Text size="small" className="text-ui-fg-error">
              {parseError}
            </Text>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <Text weight="plus" size="small" className="flex items-center">
            2. Preview
            <HelpTooltip
              text={{
                title: "Preview",
                body: "Dry-run check before any database writes happen. Shows what will be patched and any rows that would be skipped or rejected.",
                bullets: [
                  "Distinct Product Ids = how many products will receive at least one update.",
                  "Variant rows in file = total CSV rows; only relevant if you're patching per-variant fields.",
                  "Validation errors block the Confirm sync button. Common gotchas: missing Product Id column, missing Variant SKU when variant fields are ticked.",
                  "If 'Variant garment images — PDP metadata' is unticked but your CSV has per-row image URLs, you'll see a warning — leaving that off means each colour's image stays unset on the storefront.",
                ],
              }}
            />
          </Text>
          {!rawCsvText ? (
            <Text size="small" className="text-ui-fg-muted">
              No file loaded yet.
            </Text>
          ) : preview ? (
            <div className="flex flex-col gap-2">
              <Text size="small">
                Products (distinct ids): <strong>{preview.productCount}</strong>
                {previewProductsForUpdate.length > 0 ? (
                  <span className="text-ui-fg-muted">
                    {" "}
                    · selected to patch: <strong>{includedUpdateCount}</strong>
                  </span>
                ) : null}
              </Text>
              <Text size="small">
                Variant rows in file: <strong>{preview.variantRowCount}</strong>
              </Text>
              <Text size="small" className="text-ui-fg-muted">
                Rows with the same Product Id should agree on product-level columns; the first row per id wins.
              </Text>

              {previewProductsForUpdate.length > 0 && preview.validationErrors.length === 0 ? (
                <div className="mt-3 rounded-md border border-ui-border-base">
                  <div className="flex items-center justify-between gap-2 border-b border-ui-border-base bg-ui-bg-subtle px-3 py-2">
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Choose which products to patch. Unchecking skips all updates for that product (including brand + variant images).
                    </Text>
                    <div className="flex items-center gap-1">
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() => setSkippedProductIds(new Set())}
                      >
                        Select all
                      </Button>
                      <Button
                        size="small"
                        variant="transparent"
                        onClick={() =>
                          setSkippedProductIds(
                            new Set(previewProductsForUpdate.map((p) => p.id))
                          )
                        }
                      >
                        Deselect all
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto overscroll-contain">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-ui-bg-base">
                        <tr className="border-b border-ui-border-base text-left text-ui-fg-subtle text-xs">
                          <th className="px-3 py-1 w-8"></th>
                          <th className="px-3 py-1">Product Id</th>
                          <th className="px-3 py-1">Handle</th>
                          <th className="px-3 py-1">Title</th>
                          <th className="px-3 py-1">Brand</th>
                          <th className="px-3 py-1 text-right">Rows</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewProductsForUpdate.map((p) => {
                          const checked = !skippedProductIds.has(p.id)
                          return (
                            <tr
                              key={p.id}
                              className={`border-b last:border-b-0 border-ui-border-base ${
                                checked ? "" : "opacity-60"
                              }`}
                            >
                              <td className="px-3 py-1.5">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => toggleSkipUpdate(p.id)}
                                />
                              </td>
                              <td className="px-3 py-1.5 font-mono text-xs truncate max-w-[180px]">
                                {p.id}
                              </td>
                              <td className="px-3 py-1.5 font-mono text-xs truncate max-w-[160px]">
                                {p.handle || <span className="text-ui-fg-muted">—</span>}
                              </td>
                              <td className="px-3 py-1.5 truncate max-w-[220px]">{p.title}</td>
                              <td className="px-3 py-1.5 truncate max-w-[140px]">
                                {p.brand ?? <span className="text-ui-fg-muted">—</span>}
                              </td>
                              <td className="px-3 py-1.5 text-right">{p.rowCount}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {variantGarmentUncheckedWarning ? (
                <div className="rounded-md border border-ui-border-strong bg-ui-bg-subtle p-3">
                  <Text size="small" weight="plus">
                    Per-variant PDP images are not selected
                  </Text>
                  <Text size="small" className="text-ui-fg-muted mt-1">
                    Your CSV has Variant SKU + Product Image URLs on rows, but{" "}
                    <strong>Variant garment images — PDP metadata</strong> is unchecked. Only checking{" "}
                    <em>Product gallery images</em> updates the shared product gallery from the first row per product — it
                    does <strong>not</strong> write each colour&apos;s URLs onto variants for the storefront. Enable the PDP
                    metadata column (and sync again) so each SKU gets <code className="text-xs">metadata.garment_images</code>
                    .
                  </Text>
                </div>
              ) : null}

              {fileAnalysis && fileAnalysis.parsed.emptyHeaderColumns.length > 0 ? (
                <div className="rounded-md border border-ui-border-base bg-ui-bg-base-pressed p-3">
                  <Text size="small" weight="plus">
                    Header text missing on {fileAnalysis.parsed.emptyHeaderColumns.length === 1 ? "column" : "columns"}{" "}
                    {fileAnalysis.parsed.emptyHeaderColumns.join(", ")}
                  </Text>
                  <Text size="small" className="text-ui-fg-muted mt-1">
                    The importer reads columns by header name, so this column&apos;s data won&apos;t feed any field. If
                    column 26 is barcodes, add the header <code className="text-xs">Variant Barcode</code> to your
                    spreadsheet and re-upload.
                  </Text>
                </div>
              ) : null}

              {preview.validationErrors.length > 0 ? (
                <div className="rounded-md border border-ui-border-error bg-ui-bg-error p-3">
                  <Text size="small" weight="plus" className="text-ui-fg-error">
                    Fix before syncing ({preview.validationErrors.length}{" "}
                    {preview.validationErrors.length === 1 ? "issue" : "issues"}):
                  </Text>
                  <ul className="mt-2 max-h-[min(70vh,28rem)] list-disc overflow-y-auto overscroll-contain pl-5 text-sm text-ui-fg-error">
                    {preview.validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.validationErrors.length === 0 ? (
                <div className="mt-2 flex flex-col gap-3 rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Text weight="plus" size="small" className="flex items-center">
                      Columns to update
                      <HelpTooltip
                        text={{
                          title: "Columns to update",
                          body: "Pick which CSV columns get applied as patches. Anything you don't tick is ignored — even if it's in the CSV. This is the safety mechanism that lets you re-use the same source CSV for different patch passes.",
                          bullets: [
                            "Most product-level columns read from the FIRST row per Product Id. So if rows 1, 2, 3 all share a Product Id but disagree on title, row 1 wins.",
                            "'Variant garment images — PDP metadata' is the exception: it reads EVERY row (matching by Variant SKU) so each colour can have its own image set.",
                            "If you only want to update one column, untick the rest — every column you tick adds an extra write to the batch and a chance for a row-level error.",
                          ],
                        }}
                      />
                    </Text>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        disabled={candidates.length === 0}
                        onClick={() => setEnabledList(candidates.map((c) => c.csvKey))}
                      >
                        Select all
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        disabled={noneChecked}
                        onClick={() => setEnabledList([])}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  <Text size="small" className="text-ui-fg-muted">
                    Most columns list only when the <strong>first row</strong> per Product Id has data.{" "}
                    <strong>Variant garment images (PDP metadata)</strong> uses <strong>every row</strong> (Variant SKU +
                    Image 1/2 URLs). Sync sends only checked fields.
                  </Text>
                  {candidates.length === 0 ? (
                    <Text size="small" className="text-ui-fg-muted">
                      No recognised product-level patch columns containing data yet (beyond Product Id).
                    </Text>
                  ) : (
                    <ul className="flex max-h-56 flex-col gap-2 overflow-auto">
                      {candidates.map((c) => (
                        <li key={c.csvKey} className="flex items-start gap-2">
                          <Checkbox
                            id={`upd-col-${c.csvKey}`}
                            checked={enabledList.includes(c.csvKey)}
                            onCheckedChange={(v) => toggleColumn(c.csvKey, v === true)}
                          />
                          <label
                            htmlFor={`upd-col-${c.csvKey}`}
                            className="cursor-pointer select-none text-sm leading-tight text-ui-fg-base"
                          >
                            <strong>{c.label}</strong>
                            <span className="ml-2 font-mono text-xs text-ui-fg-muted">{c.csvKey}</span>
                            <span className="ml-2 text-xs text-ui-fg-muted">
                              ({c.affectedProductCount} product
                              {c.affectedProductCount === 1 ? "" : "s"})
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                  {extraHeaders.length > 0 ? (
                    <Text size="small" className="text-ui-fg-muted">
                      Other columns detected (ignored for updates):{" "}
                      <code className="text-xs">{extraHeaders.slice(0, 24).join(", ")}</code>
                      {extraHeaders.length > 24 ? " …" : null}
                    </Text>
                  ) : null}
                </div>
              ) : null}

              {buildErrors.length > 0 ? (
                <div className="rounded-md border border-ui-border-error bg-ui-bg-error p-3">
                  <Text size="small" weight="plus" className="text-ui-fg-error">
                    Fix before syncing:
                  </Text>
                  <ul className="mt-2 max-h-48 list-disc overflow-auto pl-5 text-sm text-ui-fg-error">
                    {buildErrors.slice(0, 40).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {buildErrors.length > 40 ? <li>…and {buildErrors.length - 40} more</li> : null}
                  </ul>
                </div>
              ) : null}

              {preview.validationErrors.length === 0 && buildErrors.length === 0 &&
              (updates.length > 0 || hasVariantGarmentWork) ? (
                <Text size="small" className="text-ui-fg-success">
                  Ready — {updates.length} product-level update(s), {variantGarmentByProduct.size} product(s) with variant
                  garment rows; {enabledList.length} column{enabledList.length === 1 ? "" : "s"} selected
                  {!allChecked ? " (subset)" : ""}.
                </Text>
              ) : null}

              {preview.validationErrors.length === 0 && buildErrors.length === 0 && updates.length === 0 &&
              !hasVariantGarmentWork ? (
                <Text size="small" className="text-ui-fg-muted">
                  {noneChecked || candidates.length === 0
                    ? "Select patch columns above and ensure rows have matching values."
                    : "No updates to apply for the current selection (check row data)."}
                </Text>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <Button onClick={onSync} disabled={!canSync} isLoading={syncing}>
            3. Confirm sync
          </Button>
        </div>

        {syncLog.length > 0 ? (
          <div className="flex flex-col gap-2 px-6 py-4">
            <Text weight="plus" size="small">
              Result log
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              From your last <strong>Confirm sync</strong> only.
            </Text>
            <pre className="max-h-96 overflow-auto rounded-md bg-ui-bg-subtle p-3 font-mono text-xs text-ui-fg-base whitespace-pre-wrap">
              {syncLog.join("\n")}
            </pre>
          </div>
        ) : null}
      </Container>
    </div>
  )
}

// `defineRouteConfig` removed — this page is now embedded as a tab
// inside the consolidated `/app/product-data` route. Direct URL still
// works for deep links / bookmarks, just no sidebar entry.

export default SpreadsheetSyncUpdatePage
