import {
  Button,
  Checkbox,
  Container,
  Heading,
  Input,
  Select,
  Table,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import { sdk } from "../../lib/sdk"

/** Minimal fields for list + variant count (+variants loads ids only via expansion). */
const LIST_FIELDS =
  "id,title,handle,thumbnail,status,+variants.id" as const
const BATCH_DELETE_SIZE = 50

const PAGE_SIZES = [25, 50, 100, 200] as const

type ProductRow = {
  id: string
  title: string | null
  handle: string | null
  thumbnail: string | null
  status?: string | null
  variants?: Array<{ id: string }> | null
}

const chunkIds = (ids: string[], size: number): string[][] => {
  const out: string[][] = []
  for (let i = 0; i < ids.length; i += size) {
    out.push(ids.slice(i, i + size))
  }
  return out
}

const ProductBulkDeletePage = () => {
  const prompt = usePrompt()

  const [products, setProducts] = useState<ProductRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(50)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>())
  const [deleting, setDeleting] = useState(false)
  const [refreshNonce, setRefreshNonce] = useState(0)
  /** Log from last delete run for debugging/support. */
  const [deleteLog, setDeleteLog] = useState<string[]>([])

  /** Draft in the search field; debounced into `searchQuery` for list requests. */
  const [searchDraft, setSearchDraft] = useState("")
  /** Trimmed query sent to `sdk.admin.product.list` as `q` (Admin API). */
  const [searchQuery, setSearchQuery] = useState("")

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize) || 1)
  const pageIndex = Math.floor(offset / pageSize)
  const visibleStart = totalCount === 0 ? 0 : offset + 1
  const visibleEnd =
    totalCount === 0 ? 0 : Math.min(offset + products.length, totalCount)

  const headerChecked = useMemo((): boolean | "indeterminate" => {
    if (products.length === 0) {
      return false
    }
    const selectedOnPage = products.filter((p) => selectedIds.has(p.id))
    if (selectedOnPage.length === 0) {
      return false
    }
    if (selectedOnPage.length === products.length) {
      return true
    }
    return "indeterminate"
  }, [products, selectedIds])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchDraft.trim()
      setSearchQuery((prev) => (prev === next ? prev : next))
    }, 350)
    return () => window.clearTimeout(handle)
  }, [searchDraft])

  useEffect(() => {
    setOffset(0)
  }, [searchQuery])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [offset, pageSize, searchQuery])

  const clearSearch = useCallback(() => {
    setSearchDraft("")
    setSearchQuery("")
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const res = await sdk.admin.product.list({
          limit: pageSize,
          offset,
          fields: LIST_FIELDS,
          order: "-created_at",
          ...(searchQuery ? { q: searchQuery } : {}),
        })

        if (cancelled) {
          return
        }

        const rows = (res.products ?? []) as ProductRow[]
        const count = res.count ?? rows.length

        if (rows.length === 0 && offset > 0) {
          setOffset(Math.max(0, offset - pageSize))
          return
        }

        setProducts(rows)
        setTotalCount(count)
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error ? e.message : "Could not load products."
          setLoadError(msg)
          toast.error(msg)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [offset, pageSize, refreshNonce, searchQuery])

  const toggleAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        for (const p of products) {
          if (checked) {
            next.add(p.id)
          } else {
            next.delete(p.id)
          }
        }
        return next
      })
    },
    [products]
  )

  const toggleOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const canPrev = offset > 0 && !loading
  const canNext =
    !loading &&
    totalCount > 0 &&
    offset + products.length < totalCount

  const onDeleteSelected = useCallback(async () => {
    const ids = [...selectedIds]
    if (ids.length === 0 || deleting) {
      return
    }

    const confirmed = await prompt({
      variant: "danger",
      title: "Permanently delete products",
      description: `You are about to delete ${ids.length} product${ids.length === 1 ? "" : "s"}. Variants and related catalogue data will be removed. This cannot be undone.`,
      verificationText: "DELETE",
      verificationInstruction: "Type DELETE to confirm.",
      confirmText: "Delete products",
      cancelText: "Cancel",
    })

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setDeleteLog([])

    const log: string[] = []
    const batches = chunkIds(ids, BATCH_DELETE_SIZE)
    const succeededIds: string[] = []

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]!
        log.push(`Batch ${i + 1}/${batches.length}: deleting ${batch.length} id(s)...`)
        try {
          await sdk.admin.product.batch({ delete: batch })
          succeededIds.push(...batch)
          log.push(`  OK (${batch.length} deleted).`)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          log.push(`  Failed: ${msg}`)
          toast.error(msg)
          if (succeededIds.length > 0) {
            toast.warning("Some batches failed — see result log.")
            setSelectedIds((prev) => {
              const next = new Set(prev)
              for (const id of succeededIds) {
                next.delete(id)
              }
              return next
            })
          }
          break
        }
      }

      setDeleteLog(log)

      if (
        succeededIds.length === ids.length &&
        batches.length > 0
      ) {
        toast.success(
          `Deleted ${ids.length} product${ids.length === 1 ? "" : "s"}.`
        )
        setSelectedIds(new Set())
      }

      setRefreshNonce((n) => n + 1)
    } finally {
      setDeleting(false)
    }
  }, [prompt, selectedIds, deleting])

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-2">
        <Heading level="h1">Product bulk delete</Heading>
        <Text size="small" className="text-ui-fg-muted max-w-xl">
          Select products on each page using the checkboxes below, then confirm
          deletion. Selection is cleared when you change page, page size, or search.
          Search uses the same query as the main Products list. Deletion uses the
          Admin batch API.
        </Text>
      </div>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <div className="flex min-w-0 max-w-md flex-1 flex-col gap-2">
            <Text size="small" weight="plus">
              Search
            </Text>
            <Input
              type="search"
              placeholder="Title, handle, description…"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
            {searchQuery ? (
              <Text size="xsmall" className="text-ui-fg-muted">
                Filtering by: &quot;{searchQuery}&quot;
              </Text>
            ) : null}
          </div>
          {searchDraft.trim() || searchQuery ? (
            <Button variant="secondary" size="small" onClick={clearSearch}>
              Clear search
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="danger"
              disabled={selectedIds.size === 0 || loading || deleting}
              isLoading={deleting}
              onClick={() => {
                void onDeleteSelected()
              }}
            >
              Delete selected
            </Button>
            <Text size="small" className="text-ui-fg-muted">
              {selectedIds.size === 0
                ? "No products selected on this page."
                : `${selectedIds.size} selected on this page.`}
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Text size="small" weight="plus">
                Per page
              </Text>
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
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {PAGE_SIZES.map((sz) => (
                    <Select.Item key={sz} value={`${sz}`}>
                      {sz}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <Text size="small" className="text-ui-fg-muted">
              Showing {visibleStart}-{visibleEnd} of {totalCount}{" "}
              {loading ? "(loading)" : ""}
            </Text>
          </div>
        </div>

        {loadError ? (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-tag-red-icon">
              {loadError}
            </Text>
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
                        onCheckedChange={(c) =>
                          toggleAllOnPage(c === true)
                        }
                        disabled={products.length === 0 || loading}
                      />
                    </Table.HeaderCell>
                    <Table.HeaderCell>Product</Table.HeaderCell>
                    <Table.HeaderCell className="hidden md:table-cell">
                      Handle
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[100px] text-right">
                      Variants
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-[110px]">
                      Status
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {loading && products.length === 0 ? (
                    <Table.Row>
                      <Table.Cell />
                      <Table.Cell>
                        <Text size="small" className="text-ui-fg-muted">
                          Loading…
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell" />
                      <Table.Cell />
                      <Table.Cell />
                    </Table.Row>
                  ) : products.length === 0 ? (
                    <Table.Row>
                      <Table.Cell />
                      <Table.Cell>
                        <Text size="small" className="text-ui-fg-muted">
                          {searchQuery
                            ? "No products match your search."
                            : "No products to show."}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell" />
                      <Table.Cell />
                      <Table.Cell />
                    </Table.Row>
                  ) : (
                    products.map((p) => {
                      const variantCount = Array.isArray(p.variants)
                        ? p.variants.length
                        : 0
                      return (
                        <Table.Row key={p.id}>
                          <Table.Cell className="align-middle">
                            <Checkbox
                              checked={selectedIds.has(p.id)}
                              onCheckedChange={(c) =>
                                toggleOne(p.id, c === true)
                              }
                              disabled={loading}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-3">
                              {p.thumbnail ? (
                                <img
                                  src={p.thumbnail}
                                  alt=""
                                  className="size-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="size-10 shrink-0 rounded-md bg-ui-bg-subtle" />
                              )}
                              <Text size="small" weight="plus">
                                {p.title ?? "(no title)"}
                              </Text>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="hidden md:table-cell">
                            <Text
                              size="small"
                              className="truncate font-mono text-ui-fg-muted"
                              title={p.handle ?? undefined}
                            >
                              {p.handle ?? "—"}
                            </Text>
                          </Table.Cell>
                          <Table.Cell className="text-right">
                            <Text size="small">{variantCount}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="small" className="capitalize">
                              {p.status ?? "—"}
                            </Text>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })
                  )}
                </Table.Body>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <Text size="small" className="text-ui-fg-muted">
                Page {pageIndex + 1} of {pageCount}
              </Text>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="small"
                  disabled={!canPrev}
                  onClick={() => setOffset(Math.max(0, offset - pageSize))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={!canNext}
                  onClick={() => setOffset(offset + pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>

      {deleteLog.length > 0 ? (
        <Container className="p-0">
          <div className="flex flex-col gap-2 px-6 py-4">
            <Text weight="plus" size="small">
              Result log
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              From your last delete attempt only.
            </Text>
            <pre className="max-h-96 overflow-auto rounded-md bg-ui-bg-subtle p-3 font-mono text-xs text-ui-fg-base whitespace-pre-wrap">
              {deleteLog.join("\n")}
            </pre>
          </div>
        </Container>
      ) : null}
    </div>
  )
}

// `defineRouteConfig` removed — this page is now embedded as a tab
// inside the consolidated `/app/product-data` route. Direct URL still
// works for deep links / bookmarks, just no sidebar entry.

export default ProductBulkDeletePage
