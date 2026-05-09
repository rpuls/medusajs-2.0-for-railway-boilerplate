import { Button, Container, Heading, Input, Text } from "@medusajs/ui"
import { useCallback, useMemo, useState } from "react"

import {
  applyDefaultCollectionIdToParsedCsv,
  buildBatchCreatesFromParsedCsv,
  chunkCreates,
  computeSpreadsheetPreview,
  detectDncWorkwearCatalog,
  detectFashionBizVariantCatalog,
  detectGoldCatalogFormat,
  detectHoneybeeCatalog,
  detectRamoCatalog,
  expandDncWorkwearCatalogToTemplate,
  expandFashionBizCatalogToTemplate,
  expandGoldCatalogToTemplate,
  expandHoneybeeCatalogToTemplate,
  expandRamoCatalogToTemplate,
  normalizeSpreadsheetForImport,
  PRODUCT_BATCH_CHUNK_SIZE,
  slugifyCollectionHandle,
  SPREADSHEET_IMPORT_FORMAT_OPTIONS,
  type SpreadsheetImportFormat,
} from "../../lib/spreadsheet-sync-import"
import {
  applyCategoryIdsToCreates,
  resolveCategoryPaths,
  type CategoryClient,
} from "../../lib/spreadsheet-sync-categories"
import type { TierMoneyMinor } from "../../lib/spreadsheet-money"
import { parseCsv } from "../../lib/csv-import"
import { sdk } from "../../lib/sdk"

const adminFetchPath = (path: string) => {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

type TierApplyResult = { variant_id: string; ok: boolean; message?: string }

/** Used only to preview wholesale expansion counts before the user pastes a real shipping profile id. */
const PREVIEW_ONLY_SHIPPING_PROFILE_ID = "sp__spreadsheet_sync_preview_only"

const SpreadsheetSyncPage = () => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [rawCsvText, setRawCsvText] = useState<string | null>(null)
  const [defaultShippingProfileId, setDefaultShippingProfileId] = useState("")
  const [defaultCollectionId, setDefaultCollectionId] = useState("")
  const [newCollectionTitle, setNewCollectionTitle] = useState("")
  const [newCollectionHandle, setNewCollectionHandle] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [importFormat, setImportFormat] = useState<SpreadsheetImportFormat>("auto")

  const [syncing, setSyncing] = useState(false)
  const [syncLog, setSyncLog] = useState<string[]>([])
  const [tierResults, setTierResults] = useState<TierApplyResult[] | null>(null)

  const normalized = useMemo(() => {
    if (!rawCsvText) {
      return null
    }
    const rawParsed = parseCsv(rawCsvText)
    return normalizeSpreadsheetForImport(rawParsed, {
      defaultShippingProfileId,
      format: importFormat,
    })
  }, [rawCsvText, defaultShippingProfileId, importFormat])

  const importHints = normalized?.hints ?? []

  const preview = useMemo(() => {
    if (!normalized) {
      return null
    }
    if (normalized.readyParsed) {
      return computeSpreadsheetPreview(normalized.readyParsed)
    }
    const wantsHoneybee =
      importFormat === "biz-honeybee" ||
      (importFormat === "auto" && detectHoneybeeCatalog(normalized.rawParsed))
    const wantsRamo =
      importFormat === "ramo" ||
      (importFormat === "auto" && detectRamoCatalog(normalized.rawParsed))
    const wantsFashionBiz =
      !wantsHoneybee &&
      !wantsRamo &&
      (importFormat === "fashionbiz" ||
        (importFormat === "auto" && detectFashionBizVariantCatalog(normalized.rawParsed)))
    const wantsGold =
      importFormat === "ascolour-gold" ||
      (importFormat === "auto" && detectGoldCatalogFormat(normalized.rawParsed))
    const wantsDnc =
      importFormat === "dnc-workwear" ||
      (importFormat === "auto" && detectDncWorkwearCatalog(normalized.rawParsed))
    const needsShippingOnly =
      !defaultShippingProfileId.trim() &&
      (wantsHoneybee || wantsRamo || wantsFashionBiz || wantsGold || wantsDnc)
    /** Wholesale rows are not expanded until shipping id is set — simulate expansion so product/tier counts match reality. */
    if (needsShippingOnly) {
      if (wantsHoneybee) {
        const expanded = expandHoneybeeCatalogToTemplate(
          normalized.rawParsed,
          PREVIEW_ONLY_SHIPPING_PROFILE_ID
        )
        const p = computeSpreadsheetPreview(expanded)
        return {
          ...p,
          variantCount: normalized.rawParsed.rows.length,
        }
      }
      if (wantsRamo) {
        const expanded = expandRamoCatalogToTemplate(
          normalized.rawParsed,
          PREVIEW_ONLY_SHIPPING_PROFILE_ID
        )
        const p = computeSpreadsheetPreview(expanded)
        return {
          ...p,
          variantCount: normalized.rawParsed.rows.length,
        }
      }
      if (wantsFashionBiz) {
        const expanded = expandFashionBizCatalogToTemplate(
          normalized.rawParsed,
          PREVIEW_ONLY_SHIPPING_PROFILE_ID
        )
        const p = computeSpreadsheetPreview(expanded)
        return {
          ...p,
          variantCount: normalized.rawParsed.rows.length,
        }
      }
      if (wantsGold) {
        const expanded = expandGoldCatalogToTemplate(
          normalized.rawParsed,
          PREVIEW_ONLY_SHIPPING_PROFILE_ID
        )
        const p = computeSpreadsheetPreview(expanded)
        return {
          ...p,
          variantCount: normalized.rawParsed.rows.length,
        }
      }
      if (wantsDnc) {
        const expanded = expandDncWorkwearCatalogToTemplate(
          normalized.rawParsed,
          PREVIEW_ONLY_SHIPPING_PROFILE_ID
        )
        const p = computeSpreadsheetPreview(expanded)
        return {
          ...p,
          variantCount: normalized.rawParsed.rows.length,
        }
      }
      return {
        productCount: 0,
        variantCount: normalized.rawParsed.rows.length,
        tierRuleCount: 0,
        validationErrors: [] as string[],
      }
    }
    return computeSpreadsheetPreview(normalized.rawParsed)
  }, [normalized, defaultShippingProfileId, importFormat])

  const readyParsed = normalized?.readyParsed ?? null

  const onPickFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setParseError(null)
    setSyncLog([])
    setTierResults(null)
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

  const canSync =
    !!readyParsed &&
    preview &&
    preview.validationErrors.length === 0 &&
    preview.productCount > 0 &&
    !syncing

  const onSync = useCallback(async () => {
    if (!rawCsvText) {
      return
    }

    const rawParsed = parseCsv(rawCsvText)
    const { readyParsed: toSync } = normalizeSpreadsheetForImport(rawParsed, {
      defaultShippingProfileId,
      format: importFormat,
    })
    if (!toSync) {
      return
    }

    setSyncing(true)
    setSyncLog([])
    setTierResults(null)

    const log: string[] = []

    let workingParsed = toSync

    try {
      const createTitle = newCollectionTitle.trim()
      if (createTitle) {
        const handle = newCollectionHandle.trim() || slugifyCollectionHandle(createTitle)
        log.push(`Creating collection "${createTitle}" (handle: ${handle})…`)
        const createRes = (await sdk.admin.productCollection.create({
          title: createTitle,
          handle,
        })) as { collection?: { id?: string } }
        const cid = createRes.collection?.id
        if (!cid) {
          log.push("Collection create returned no id — aborting.")
          setSyncLog(log)
          setSyncing(false)
          return
        }
        log.push(`Created collection ${cid}.`)
        workingParsed = applyDefaultCollectionIdToParsedCsv(workingParsed, cid)
      } else {
        const existing = defaultCollectionId.trim()
        if (existing) {
          log.push(`Using collection ${existing} for rows without Product Collection Id.`)
          workingParsed = applyDefaultCollectionIdToParsedCsv(workingParsed, existing)
        }
      }
    } catch (e) {
      log.push(`Collection step failed: ${e instanceof Error ? e.message : String(e)}`)
      setSyncLog(log)
      setSyncing(false)
      return
    }

    const { creates, tierBySku, errors, warnings, categoryPathsByHandle } =
      buildBatchCreatesFromParsedCsv(workingParsed)

    if (errors.length) {
      errors.forEach((e) => log.push(`Validation: ${e}`))
      setSyncLog(log)
      setSyncing(false)
      return
    }

    warnings.forEach((w) => log.push(`Note: ${w}`))

    if (!creates.length) {
      log.push("Nothing to create — no product groups found.")
      setSyncLog(log)
      setSyncing(false)
      return
    }

    if (categoryPathsByHandle.size) {
      const allPaths: string[][] = []
      const pathSeen = new Set<string>()
      for (const paths of categoryPathsByHandle.values()) {
        for (const p of paths) {
          const key = p.map((s) => s.toLowerCase()).join(" > ")
          if (!pathSeen.has(key)) {
            pathSeen.add(key)
            allPaths.push(p)
          }
        }
      }
      log.push(`Resolving ${allPaths.length} category path(s)…`)
      try {
        const categoryClient: CategoryClient = sdk.admin.productCategory as unknown as CategoryClient
        const { idByPathKey, createdLog } = await resolveCategoryPaths(categoryClient, allPaths)
        log.push(...createdLog)
        applyCategoryIdsToCreates(
          creates as Array<Record<string, unknown> & { handle?: string }>,
          categoryPathsByHandle,
          idByPathKey
        )
        log.push(`Categories resolved (${idByPathKey.size}/${allPaths.length} paths matched).`)
      } catch (e) {
        log.push(
          `Category resolution failed: ${e instanceof Error ? e.message : String(e)} — products will be created without categories.`
        )
      }
    }

    const tierPayload: Array<{ variant_id: string; tiers_minor: TierMoneyMinor }> = []

    try {
      const batches = chunkCreates(creates, PRODUCT_BATCH_CHUNK_SIZE)
      let batchIdx = 0
      for (const chunk of batches) {
        batchIdx++
        log.push(`Batch ${batchIdx}/${batches.length}: creating ${chunk.length} product(s)...`)

        const resp = (await sdk.admin.product.batch(
          { create: chunk as never },
          { fields: "handle,+variants.id,+variants.sku" }
        )) as {
          created?: Array<{ handle?: string; variants?: Array<{ id?: string; sku?: string | null }> }>
          products?: Array<{ handle?: string; variants?: Array<{ id?: string; sku?: string | null }> }>
        }

        const created = resp.created ?? resp.products ?? []
        for (const product of created) {
          const handle = product.handle ?? "(unknown handle)"
          const variants = product.variants ?? []
          log.push(`  Created "${handle}" (${variants.length} variant(s)).`)

          for (const v of variants) {
            const sku = (v.sku ?? "").trim()
            const tiers = sku ? tierBySku.get(sku) : undefined
            if (tiers && v.id) {
              tierPayload.push({ variant_id: v.id, tiers_minor: tiers })
            }
          }
        }
      }

      if (tierPayload.length) {
        log.push(`Applying AUD tier ladders for ${tierPayload.length} variant(s)...`)

        const tierChunks = chunkCreates(tierPayload, 40)
        const allTierResults: TierApplyResult[] = []

        let tc = 0
        for (const tchunk of tierChunks) {
          tc++
          const res = await fetch(adminFetchPath("/admin/spreadsheet-sync/apply-variant-tier-prices"), {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: tchunk }),
          })

          if (!res.ok) {
            const msg = await res.text()
            log.push(`Tier batch ${tc} failed: HTTP ${res.status} ${msg}`)
            continue
          }

          const body = (await res.json()) as { results?: TierApplyResult[] }
          const results = body.results ?? []
          allTierResults.push(...results)

          const failed = results.filter((r) => !r.ok)
          if (failed.length) {
            failed.forEach((f) =>
              log.push(`  Tier failed ${f.variant_id}: ${f.message ?? "unknown error"}`)
            )
          }
        }

        setTierResults(allTierResults)

        const okN = allTierResults.filter((r) => r.ok).length
        const bad = allTierResults.filter((r) => !r.ok).length
        log.push(`Tier pricing finished: ${okN} ok, ${bad} failed.`)
      } else {
        log.push(
          "No tier ladders to apply (explicit supplemental tier columns missing — derived AUD ladders use Variant Price AUD only)."
        )
      }

      log.push("Done.")
      setSyncLog(log)
    } catch (e) {
      log.push(`Sync failed: ${e instanceof Error ? e.message : String(e)}`)
      setSyncLog(log)
    } finally {
      setSyncing(false)
    }
  }, [
    rawCsvText,
    defaultShippingProfileId,
    defaultCollectionId,
    newCollectionTitle,
    newCollectionHandle,
    importFormat,
  ])

  const wholesaleNeedsShipping =
    !!normalized &&
    !defaultShippingProfileId.trim() &&
    ((importFormat === "auto" &&
      (detectHoneybeeCatalog(normalized.rawParsed) ||
        detectRamoCatalog(normalized.rawParsed) ||
        detectFashionBizVariantCatalog(normalized.rawParsed) ||
        detectGoldCatalogFormat(normalized.rawParsed) ||
        detectDncWorkwearCatalog(normalized.rawParsed))) ||
      importFormat === "fashionbiz" ||
      importFormat === "biz-honeybee" ||
      importFormat === "ramo" ||
      importFormat === "ascolour-gold" ||
      importFormat === "dnc-workwear")

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <Heading level="h1">Spreadsheet sync (new products)</Heading>
        <Text size="small" className="text-ui-fg-muted mt-1">
          <strong>Creates new products only</strong> via <code className="text-xs">sdk.admin.product.batch</code>{" "}
          (<code className="text-xs">create</code>). Existing rows are not upserted by <code className="text-xs">
            Product Id
          </code>{" "}
          or handle — duplicate handles follow Medusa/API rules. Bulk updates to existing products live under{" "}
          <a href="/app/spreadsheet-sync-update" className="text-ui-fg-interactive hover:underline">
            Spreadsheet sync (updates)
          </a>
          .
        </Text>
        <Text size="small" className="text-ui-fg-muted mt-2">
          Prefer the CSV from <strong>Products → Export products (import template)</strong>. Wholesale feeds such as AS
          Colour (<code className="text-xs">STYLECODE</code>, <code className="text-xs">PRODUCT_NAME</code>). When
          present, <code className="text-xs">ImageUrl_Standard</code> / <code className="text-xs">ImageFrontUrl</code> /{" "}
          <code className="text-xs">ImageBackUrl</code> / <code className="text-xs">ImageSideUrl</code> map to product
          metadata for extra PDP views. DNC Workwear (<code className="text-xs">ProductCode</code> /{" "}
          <code className="text-xs">Description</code> / <code className="text-xs">Description2–3</code>), and biz-style variant grids map automatically once you set a default shipping profile. Optional AUD tier pricing uses the Pricing Module after create.
        </Text>
      </div>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-3 px-6 py-4">
          <Text weight="plus" size="small">
            1. Upload CSV
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
          <Text weight="plus" size="small">
            Source format
          </Text>
          <select
            value={importFormat}
            onChange={(e) => setImportFormat(e.target.value as SpreadsheetImportFormat)}
            className="block w-full max-w-md rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-1.5 text-sm text-ui-fg-base"
          >
            {SPREADSHEET_IMPORT_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Text size="small" className="text-ui-fg-muted">
            Auto-detect handles AS Colour Gold, FashionBiz / Biz / Syzmik variant grids, and DNC
            Workwear by header signature. Pick a specific format when a new supplier&apos;s CSV
            doesn&apos;t auto-detect (e.g. DNC variants whose URLs don&apos;t mention dncworkwear).
          </Text>
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <Text weight="plus" size="small">
            Default shipping profile id
          </Text>
          <Input
            placeholder="e.g. sp_01..."
            value={defaultShippingProfileId}
            onChange={(e) => setDefaultShippingProfileId(e.target.value)}
            className="max-w-md"
          />
          <Text size="small" className="text-ui-fg-muted">
            Required for wholesale CSVs that omit <code className="text-xs">Shipping Profile Id</code>. Copy from{" "}
            <strong>Settings → Locations &amp; shipping → Shipping profiles</strong>.
          </Text>
          {defaultShippingProfileId.trim().toLowerCase().startsWith("sc_") ? (
            <Text size="small" className="text-ui-fg-warning">
              Values starting with <code className="text-xs">sc_</code> are usually <strong>sales channel</strong> IDs.
              Shipping profiles almost always start with <code className="text-xs">sp_</code>. Open{" "}
              <strong>Shipping profiles</strong> and copy the profile id from there — not from Sales channels.
            </Text>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <Text weight="plus" size="small">
            Collection (optional)
          </Text>
          <Input
            placeholder="Existing collection id (e.g. pcol_01...)"
            value={defaultCollectionId}
            onChange={(e) => setDefaultCollectionId(e.target.value)}
            className="max-w-md"
          />
          <Text size="small" className="text-ui-fg-muted">
            Products are assigned via <code className="text-xs">Product Collection Id</code> on each row. Paste an id from{" "}
            <strong>Products → Collections</strong> to fill rows that leave it empty.
          </Text>
          <Text size="small" className="text-ui-fg-muted">
            Or create a new collection when you sync:
          </Text>
          <Input
            placeholder="New collection title (creates collection before products)"
            value={newCollectionTitle}
            onChange={(e) => setNewCollectionTitle(e.target.value)}
            className="max-w-md"
          />
          <Input
            placeholder="Handle (optional — derived from title if empty)"
            value={newCollectionHandle}
            onChange={(e) => setNewCollectionHandle(e.target.value)}
            className="max-w-md"
          />
          {newCollectionTitle.trim() ? (
            <Text size="small" className="text-ui-fg-warning">
              <strong>New collection title</strong> is set — sync will create that collection first and assign imported
              products to it (the existing collection id field above is ignored).
            </Text>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <Text weight="plus" size="small">
            2. Preview
          </Text>
          {!rawCsvText ? (
            <Text size="small" className="text-ui-fg-muted">
              No file loaded yet.
            </Text>
          ) : (
            <div className="flex flex-col gap-3">
              {importHints.map((hint, i) => (
                <div
                  key={i}
                  className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2 text-sm text-ui-fg-subtle"
                >
                  {hint}
                </div>
              ))}
              {wholesaleNeedsShipping ? (
                <Text size="small" className="text-ui-fg-warning">
                  Paste <strong>Default shipping profile id</strong> above to enable sync. Until then, products are not
                  created — the preview counts below assume that id will be set (same expansion as after you paste it).
                  Gold: handles like <code className="text-xs">ascolour-…</code>; wholesale grids:{" "}
                  <code className="text-xs">biz-collection-…</code>; DNC: <code className="text-xs">dnc-…</code>.
                </Text>
              ) : null}
              {preview ? (
                <div className="flex flex-col gap-2">
                  <Text size="small">
                    Products (distinct handles): <strong>{preview.productCount}</strong>
                  </Text>
                  <Text size="small">
                    Variant rows: <strong>{preview.variantCount}</strong>
                  </Text>
                  <Text size="small">
                    Tier pricing rules (explicit tier columns or derived from Variant Price AUD):{" "}
                    <strong>{preview.tierRuleCount}</strong>
                  </Text>
                  {preview.validationErrors.length ? (
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
                  ) : readyParsed ? (
                    <Text size="small" className="text-ui-fg-success">
                      Looks valid — click Confirm sync to create new products in Medusa.
                    </Text>
                  ) : wholesaleNeedsShipping && preview.productCount > 0 ? (
                    <Text size="small" className="text-ui-fg-muted">
                      Preview counts are ready — paste shipping profile id to unlock Confirm sync.
                    </Text>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={onSync} disabled={!canSync} isLoading={syncing}>
              3. Confirm sync
            </Button>
            {!canSync && readyParsed && preview?.validationErrors.length === 0 && preview.productCount === 0 ? (
              <Text size="small" className="text-ui-fg-muted">
                No rows to sync.
              </Text>
            ) : null}
            {!canSync && wholesaleNeedsShipping ? (
              <Text size="small" className="text-ui-fg-muted">
                Add shipping profile id — sync stays disabled until Medusa can assign a profile to each product.
              </Text>
            ) : null}
          </div>
        </div>

        {syncLog.length > 0 ? (
          <div className="flex flex-col gap-2 px-6 py-4">
            <Text weight="plus" size="small">
              Result log
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              From your last <strong>Confirm sync</strong> only. Preview warnings above reflect the current file;
              this block stays until you sync again or pick a new file.
            </Text>
            <pre className="max-h-96 overflow-auto rounded-md bg-ui-bg-subtle p-3 font-mono text-xs text-ui-fg-base whitespace-pre-wrap">
              {syncLog.join("\n")}
            </pre>
            {tierResults?.length ? (
              <Text size="small" className="text-ui-fg-muted">
                Tier rows processed: {tierResults.length}. Failed: {tierResults.filter((r) => !r.ok).length}.
              </Text>
            ) : null}
          </div>
        ) : null}
      </Container>
    </div>
  )
}

// `defineRouteConfig` removed — this page is now embedded as a tab
// inside the consolidated `/app/product-data` route. Direct URL still
// works for deep links / bookmarks, just no sidebar entry.

export default SpreadsheetSyncPage
