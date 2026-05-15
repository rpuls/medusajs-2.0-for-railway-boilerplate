import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowDownTray } from "@medusajs/icons"
import { HelpTooltip } from "../../components/reports/help-tooltip"
import {
  Badge,
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type FashionBizBrand = {
  slug: string
  label: string
}

const BRANDS: FashionBizBrand[] = [
  { slug: "biz-collection", label: "Biz Collection" },
  { slug: "biz-care", label: "Biz Care" },
  { slug: "biz-corporates", label: "Biz Corporates" },
  { slug: "syzmik", label: "Syzmik" },
]

type CatalogProduct = {
  slug: string
  code: string
  name: string
  brand: string
  handle: string
  already_imported: boolean
}

type ImportResult = {
  imported: string[]
  skipped: string[]
  errors: Array<{ slug: string; error: string }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const adminUrl = (path: string) => {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

const PAGE_SIZES = [25, 50, 100] as const

// ─── Component ────────────────────────────────────────────────────────────────

const FashionBizImportPage = () => {
  const [activeBrand, setActiveBrand] = useState(BRANDS[0].slug)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [total, setTotal] = useState(0)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  const [searchDraft, setSearchDraft] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedSlugs, setSelectedSlugs] = useState(() => new Set<string>())
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const pageIndex = Math.floor(offset / pageSize)
  const visibleStart = total === 0 ? 0 : offset + 1
  const visibleEnd = total === 0 ? 0 : Math.min(offset + products.length, total)

  // Debounce search
  useEffect(() => {
    const h = window.setTimeout(() => {
      const next = searchDraft.trim()
      setSearchQuery((prev) => (prev === next ? prev : next))
    }, 350)
    return () => window.clearTimeout(h)
  }, [searchDraft])

  // Reset to page 0 on search change
  useEffect(() => { setOffset(0) }, [searchQuery])

  // Clear selection on page/search change
  useEffect(() => { setSelectedSlugs(new Set()) }, [offset, pageSize, searchQuery, activeBrand])

  // Clear search + selection on brand change
  const switchBrand = useCallback((slug: string) => {
    setActiveBrand(slug)
    setSearchDraft("")
    setSearchQuery("")
    setOffset(0)
    setImportResult(null)
  }, [])

  // Load catalog from backend
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const params = new URLSearchParams({
          brand: activeBrand,
          limit: String(pageSize),
          offset: String(offset),
          ...(searchQuery ? { search: searchQuery } : {}),
        })
        const res = await fetch(adminUrl(`/admin/fashionbiz/catalog?${params}`), {
          credentials: "include",
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as any)?.error ?? `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (!cancelled) {
          setProducts(data.products ?? [])
          setTotal(data.total ?? 0)
          // Auto-uncheck already-imported on fresh load
          setSelectedSlugs((prev) => {
            const next = new Set(prev)
            for (const p of (data.products ?? []) as CatalogProduct[]) {
              if (p.already_imported) next.delete(p.slug)
            }
            return next
          })
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message ?? "Failed to load catalog"
          setLoadError(msg)
          toast.error(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [activeBrand, offset, pageSize, searchQuery, refreshNonce])

  // Selection helpers
  const headerChecked = useMemo((): boolean | "indeterminate" => {
    if (!products.length) return false
    const onPage = products.filter((p) => selectedSlugs.has(p.slug))
    if (!onPage.length) return false
    if (onPage.length === products.length) return true
    return "indeterminate"
  }, [products, selectedSlugs])

  const toggleAllOnPage = useCallback((checked: boolean) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      for (const p of products) {
        if (checked) next.add(p.slug)
        else next.delete(p.slug)
      }
      return next
    })
  }, [products])

  const toggleOne = useCallback((slug: string, checked: boolean) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (checked) next.add(slug)
      else next.delete(slug)
      return next
    })
  }, [])

  const selectAllNew = useCallback(() => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      for (const p of products) {
        if (!p.already_imported) next.add(p.slug)
      }
      return next
    })
  }, [products])

  const deselectImported = useCallback(() => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      for (const p of products) {
        if (p.already_imported) next.delete(p.slug)
      }
      return next
    })
  }, [products])

  const deselectAll = useCallback(() => setSelectedSlugs(new Set()), [])

  // Import selected products
  const onImport = useCallback(async () => {
    const slugs = [...selectedSlugs]
    if (!slugs.length || importing) return

    setImporting(true)
    setImportResult(null)
    try {
      const res = await fetch(adminUrl("/admin/fashionbiz/import"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand: activeBrand, slugs }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error((body as any)?.error ?? `HTTP ${res.status}`)
      }
      const result = body as ImportResult
      setImportResult(result)

      if (result.imported.length > 0) {
        toast.success(`Imported ${result.imported.length} product${result.imported.length === 1 ? "" : "s"}`)
      }
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} product${result.errors.length === 1 ? "" : "s"} failed — see results below`)
      }

      setSelectedSlugs(new Set())
      setRefreshNonce((n) => n + 1)
    } catch (err: any) {
      toast.error(err?.message ?? "Import failed")
    } finally {
      setImporting(false)
    }
  }, [selectedSlugs, importing, activeBrand])

  const canPrev = offset > 0 && !loading
  const canNext = !loading && total > 0 && offset + products.length < total

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Heading level="h1" className="flex items-center">
          FashionBiz Product Import
          <HelpTooltip
            text={{
              title: "FashionBiz Product Import",
              body: "Pulls the live FashionBiz catalogue (Biz Collection, Biz Care, Biz Corporates, Syzmik) and imports selected styles into Medusa. Switch brand tabs to browse each range separately.",
              bullets: [
                "New = not yet imported. Imported (greyed) = already exists — safe to leave unchecked.",
                "Pricing uses the 1-99 wholesale tier × FASHIONBIZ_COST_ADJUSTMENT (set to 1.15 in production to match actual distributor billing).",
                "Stock refreshes nightly at 04:00 UTC via the FashionBiz Warehouse stock location.",
                "Idempotent: re-importing an existing handle is a no-op — use the spreadsheet update flow to patch existing products.",
              ],
            }}
          />
        </Heading>
        <Text size="small" className="text-ui-fg-muted max-w-xl">
          Browse the live FashionBiz catalogue, select the products you want, and click Import.
          Products already in Medusa are shown greyed — deselect them or leave them unchecked.
        </Text>
      </div>

      {/* Brand tabs */}
      <div className="flex gap-2 flex-wrap">
        {BRANDS.map((b) => (
          <button
            key={b.slug}
            type="button"
            onClick={() => switchBrand(b.slug)}
            className={[
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeBrand === b.slug
                ? "bg-ui-button-inverted text-ui-fg-on-inverted"
                : "bg-ui-bg-subtle text-ui-fg-base hover:bg-ui-bg-subtle-hover",
            ].join(" ")}
          >
            {b.label}
          </button>
        ))}
      </div>

      <Container className="divide-y p-0">
        {/* Search + actions row */}
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <div className="flex min-w-0 max-w-sm flex-1 flex-col gap-1">
            <Text size="small" weight="plus">Search</Text>
            <Input
              type="search"
              placeholder="Product code or name…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </div>
          {(searchDraft || searchQuery) ? (
            <Button variant="secondary" size="small" onClick={() => { setSearchDraft(""); setSearchQuery("") }}>
              Clear search
            </Button>
          ) : null}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              disabled={selectedSlugs.size === 0 || loading || importing}
              isLoading={importing}
              onClick={() => void onImport()}
            >
              Import {selectedSlugs.size > 0 ? `${selectedSlugs.size} ` : ""}Selected
            </Button>
            <Button variant="secondary" size="small" disabled={loading} onClick={selectAllNew}>
              Select new
            </Button>
            <Button variant="secondary" size="small" disabled={loading} onClick={deselectImported}>
              Deselect imported
            </Button>
            <Button variant="secondary" size="small" disabled={loading} onClick={deselectAll}>
              Deselect all
            </Button>
            {selectedSlugs.size > 0 && (
              <Text size="small" className="text-ui-fg-muted">
                {selectedSlugs.size} selected
              </Text>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Text size="small" weight="plus">Per page</Text>
              <Select
                value={`${pageSize}`}
                size="small"
                onValueChange={(v) => {
                  const n = Number(v) as (typeof PAGE_SIZES)[number]
                  if ((PAGE_SIZES as readonly number[]).includes(n)) {
                    setPageSize(n as (typeof PAGE_SIZES)[number])
                    setOffset(0)
                  }
                }}
              >
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  {PAGE_SIZES.map((sz) => (
                    <Select.Item key={sz} value={`${sz}`}>{sz}</Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <Text size="small" className="text-ui-fg-muted">
              {total === 0 && !loading
                ? "No products found"
                : `Showing ${visibleStart}–${visibleEnd} of ${total}${loading ? " (loading)" : ""}`}
            </Text>
          </div>
        </div>

        {/* Table */}
        {loadError ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-tag-red-icon">{loadError}</Text>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-6 py-2">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="w-[44px]">
                      <Checkbox
                        checked={headerChecked}
                        onCheckedChange={(c) => toggleAllOnPage(c === true)}
                        disabled={products.length === 0 || loading}
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[110px]">Code</Table.HeaderCell>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell className="w-[140px]">Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {loading && products.length === 0 ? (
                    <Table.Row>
                      <Table.Cell /><Table.Cell colSpan={3}>
                        <Text size="small" className="text-ui-fg-muted">Loading catalog…</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : products.length === 0 ? (
                    <Table.Row>
                      <Table.Cell /><Table.Cell colSpan={3}>
                        <Text size="small" className="text-ui-fg-muted">
                          {searchQuery ? "No products match your search." : "No products found."}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    products.map((p) => (
                      <Table.Row
                        key={p.slug}
                        className={p.already_imported ? "opacity-50" : ""}
                      >
                        <Table.Cell className="align-middle">
                          <Checkbox
                            checked={selectedSlugs.has(p.slug)}
                            onCheckedChange={(c) => toggleOne(p.slug, c === true)}
                            disabled={loading}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small" className="font-mono">{p.code}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="small" weight="plus">{p.name}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {p.already_imported ? (
                            <Badge color="green" size="xsmall">Imported</Badge>
                          ) : (
                            <Badge color="blue" size="xsmall">New</Badge>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <Text size="small" className="text-ui-fg-muted">
                Page {pageIndex + 1} of {pageCount}
              </Text>
              <div className="flex gap-2">
                <Button variant="secondary" size="small" disabled={!canPrev}
                  onClick={() => setOffset(Math.max(0, offset - pageSize))}>
                  Previous
                </Button>
                <Button variant="secondary" size="small" disabled={!canNext}
                  onClick={() => setOffset(offset + pageSize)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>

      {/* Import results */}
      {importResult && (
        <Container className="p-0">
          <div className="flex flex-col gap-3 px-6 py-4">
            <Text weight="plus" size="small">Import results</Text>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge color="green">{importResult.imported.length} imported</Badge>
              </div>
              {importResult.skipped.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge color="grey">{importResult.skipped.length} already existed</Badge>
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge color="red">{importResult.errors.length} failed</Badge>
                </div>
              )}
            </div>
            {importResult.imported.length > 0 && (
              <div>
                <Text size="xsmall" className="text-ui-fg-muted mb-1">Imported:</Text>
                <Text size="xsmall" className="font-mono text-ui-fg-subtle">
                  {importResult.imported.join(", ")}
                </Text>
              </div>
            )}
            {importResult.errors.length > 0 && (
              <div>
                <Text size="xsmall" className="text-ui-fg-muted mb-1">Errors:</Text>
                <div className="flex flex-col gap-1">
                  {importResult.errors.map((e) => (
                    <Text key={e.slug} size="xsmall" className="text-ui-tag-red-icon font-mono">
                      {e.slug}: {e.error}
                    </Text>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      )}
    </div>
  )
}

export default FashionBizImportPage
