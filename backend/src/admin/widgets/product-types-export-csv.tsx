import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { FetchError } from "@medusajs/js-sdk"
import { Button, Container, Text } from "@medusajs/ui"
import { useCallback, useRef, useState, type ChangeEvent } from "react"

import { buildCsv, downloadCsv, fetchAllProductTypes } from "../lib/csv-export"
import { extractNamesFromRows, parseCsv } from "../lib/csv-import"
import { sdk } from "../lib/sdk"

const isDuplicateClientError = (e: unknown): boolean => {
  if (!(e instanceof FetchError) || e.status === undefined) {
    return false
  }
  return e.status === 400 || e.status === 409 || e.status === 422
}

const ProductTypesExportCsv = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSummary, setImportSummary] = useState<string | null>(null)

  const onExport = useCallback(async () => {
    setExportError(null)
    setExportLoading(true)
    try {
      const rows = await fetchAllProductTypes((q) => sdk.admin.productType.list(q))
      const sorted = [...rows].sort((a, b) =>
        a.value.localeCompare(b.value, undefined, { sensitivity: "base" })
      )
      const csv = buildCsv(
        ["type_id", "type_name"],
        sorted.map((r) => [r.id, r.value])
      )
      downloadCsv("product-types.csv", csv)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed")
    } finally {
      setExportLoading(false)
    }
  }, [])

  const onPickImportFile = useCallback(() => {
    setImportError(null)
    setImportSummary(null)
    fileInputRef.current?.click()
  }, [])

  const onImportFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) {
      return
    }
    setImportError(null)
    setImportSummary(null)
    setImportLoading(true)
    try {
      const text = await file.text()
      const parsed = parseCsv(text)
      const { names, error: parseErr } = extractNamesFromRows(parsed, "type_name")
      if (parseErr) {
        setImportError(parseErr)
        return
      }
      const existing = await fetchAllProductTypes((q) => sdk.admin.productType.list(q))
      const existingLower = new Set(existing.map((t) => t.value.toLowerCase()))
      let created = 0
      let skipped = 0
      let failed = 0
      for (const name of names) {
        const lower = name.toLowerCase()
        if (existingLower.has(lower)) {
          skipped++
          continue
        }
        try {
          await sdk.admin.productType.create({ value: name })
          existingLower.add(lower)
          created++
        } catch (err) {
          if (isDuplicateClientError(err)) {
            existingLower.add(lower)
            skipped++
          } else {
            failed++
          }
        }
      }
      setImportSummary(
        `Import finished: ${created} created, ${skipped} skipped (already exists or duplicate), ${failed} failed. Refresh the page if the list does not update.`
      )
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImportLoading(false)
    }
  }, [])

  return (
    <Container className="mb-4 divide-y p-0">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onImportFile}
      />
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text size="small" weight="plus" className="text-ui-fg-base">
            Export
          </Text>
          <Text size="small" className="text-ui-fg-muted">
            Download all product types as CSV (id and name).
          </Text>
        </div>
        <Button size="small" variant="secondary" disabled={exportLoading} onClick={onExport}>
          {exportLoading ? "Exporting…" : "Export types (CSV)"}
        </Button>
      </div>
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text size="small" weight="plus" className="text-ui-fg-base">
            Import
          </Text>
          <Text size="small" className="text-ui-fg-muted">
            Add new types from CSV (same columns as export; only new names are created).
          </Text>
        </div>
        <Button size="small" variant="secondary" disabled={importLoading} onClick={onPickImportFile}>
          {importLoading ? "Importing…" : "Import types (CSV)"}
        </Button>
      </div>
      {exportError ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-error">
            {exportError}
          </Text>
        </div>
      ) : null}
      {importError ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-error">
            {importError}
          </Text>
        </div>
      ) : null}
      {importSummary ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            {importSummary}
          </Text>
        </div>
      ) : null}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_type.list.before",
})

export default withWidgetBoundary(ProductTypesExportCsv, "product-types-export-csv")
