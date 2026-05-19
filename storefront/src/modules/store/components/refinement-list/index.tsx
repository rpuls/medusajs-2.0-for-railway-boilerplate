"use client"

import { ChevronUpDown, XMark } from "@medusajs/icons"
import { Button, Input, Text, clx } from "@medusajs/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react"

import SortProducts, { SortOptions } from "./sort-products"
import { CatalogFacetOptions, ProductFilters } from "./types"

function FacetSelect({
  placeholder,
  value,
  onChange,
  children,
}: {
  placeholder: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <div
      className={clx(
        "relative flex items-center text-base-regular border border-ui-border-base bg-ui-bg-subtle rounded-md hover:bg-ui-bg-field-hover",
        !value ? "text-ui-fg-muted" : undefined
      )}
    >
      <select
        value={value}
        onChange={onChange}
        className="appearance-none flex-1 bg-transparent border-none px-4 py-2.5 transition-colors duration-150 outline-none"
      >
        <option disabled value="">
          {placeholder}
        </option>
        {children}
      </select>
      <span className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
        <ChevronUpDown />
      </span>
    </div>
  )
}

type RefinementListProps = {
  sortBy: SortOptions
  filters?: ProductFilters
  /** When set (store page), brand/type/tag use dropdowns populated server-side */
  facetOptions?: CatalogFacetOptions
  search?: boolean
  "data-testid"?: string
}

function countActiveFilters(filters: ProductFilters | undefined): number {
  if (!filters) return 0
  let n = 0
  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") n += 1
  if (filters.brand?.trim()) n += 1
  if (filters.fabric?.trim()) n += 1
  if (filters.typeId?.trim()) n += 1
  if (filters.tagId?.trim()) n += 1
  return n
}

const RefinementList = ({
  sortBy,
  filters,
  facetOptions,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [minPriceInput, setMinPriceInput] = useState(
    typeof filters?.minPrice === "number" ? String(filters.minPrice) : ""
  )
  const [maxPriceInput, setMaxPriceInput] = useState(
    typeof filters?.maxPrice === "number" ? String(filters.maxPrice) : ""
  )
  const [brandInput, setBrandInput] = useState(filters?.brand ?? "")
  const [fabricInput, setFabricInput] = useState(filters?.fabric ?? "")
  const [typeIdInput, setTypeIdInput] = useState(filters?.typeId ?? "")
  const [tagIdInput, setTagIdInput] = useState(filters?.tagId ?? "")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeFilterCount = countActiveFilters(filters)

  // Lock body scroll while drawer is open so the page underneath doesn't shift.
  useEffect(() => {
    if (typeof document === "undefined") return
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  useEffect(() => {
    setMinPriceInput(typeof filters?.minPrice === "number" ? String(filters.minPrice) : "")
    setMaxPriceInput(typeof filters?.maxPrice === "number" ? String(filters.maxPrice) : "")
    setBrandInput(filters?.brand ?? "")
    setFabricInput(filters?.fabric ?? "")
    setTypeIdInput(filters?.typeId ?? "")
    setTagIdInput(filters?.tagId ?? "")
  }, [
    filters?.minPrice,
    filters?.maxPrice,
    filters?.brand,
    filters?.fabric,
    filters?.typeId,
    filters?.tagId,
  ])

  const brandChoices = useMemo(() => {
    if (!facetOptions) {
      return []
    }
    const base = facetOptions.brands
    const b = filters?.brand?.trim()
    if (b && !base.some((x) => x.id === b)) {
      return [...base, { id: b, label: b }]
    }
    return base
  }, [facetOptions, filters?.brand])

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([name, value]) => {
        if (value === undefined || value === "") {
          params.delete(name)
        } else {
          params.set(name, value)
        }
      })

      // Reset to first page when sorting/filtering changes.
      params.delete("page")

      return params.toString()
    },
    [searchParams]
  )

  const setSortQueryParam = (name: string, value: string) => {
    const query = createQueryString({ [name]: value })
    router.push(`${pathname}?${query}`)
  }

  const applyFilters = () => {
    const minPrice = minPriceInput.trim()
    const maxPrice = maxPriceInput.trim()

    const normalizedMinPrice =
      minPrice && Number.isFinite(Number(minPrice)) && Number(minPrice) >= 0
        ? String(Math.floor(Number(minPrice)))
        : undefined
    const normalizedMaxPrice =
      maxPrice && Number.isFinite(Number(maxPrice)) && Number(maxPrice) >= 0
        ? String(Math.floor(Number(maxPrice)))
        : undefined
    const normalizedBrand = brandInput.trim() || undefined
    const normalizedFabric = fabricInput.trim() || undefined
    const normalizedTypeId = typeIdInput.trim() || undefined
    const normalizedTagId = tagIdInput.trim() || undefined

    const query = createQueryString({
      minPrice: normalizedMinPrice,
      maxPrice: normalizedMaxPrice,
      brand: normalizedBrand,
      fabric: normalizedFabric,
      typeId: normalizedTypeId,
      tagId: normalizedTagId,
      tag: undefined,
    })

    router.push(`${pathname}?${query}`)
    setDrawerOpen(false)
  }

  const clearFilters = () => {
    setMinPriceInput("")
    setMaxPriceInput("")
    setBrandInput("")
    setFabricInput("")
    setTypeIdInput("")
    setTagIdInput("")

    const query = createQueryString({
      minPrice: undefined,
      maxPrice: undefined,
      brand: undefined,
      fabric: undefined,
      typeId: undefined,
      tagId: undefined,
      tag: undefined,
    })

    router.push(`${pathname}?${query}`)
    setDrawerOpen(false)
  }

  const filterForm = (
    <div className="flex flex-col gap-3">
      <Text className="txt-compact-small-plus text-ui-fg-muted">Filter by</Text>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          min={0}
          placeholder="Min price"
          value={minPriceInput}
          onChange={(event) => setMinPriceInput(event.target.value)}
        />
        <Input
          type="number"
          min={0}
          placeholder="Max price"
          value={maxPriceInput}
          onChange={(event) => setMaxPriceInput(event.target.value)}
        />
      </div>

      {facetOptions ? (
        <>
          <div className="flex flex-col gap-1.5">
            <Text className="txt-compact-small text-ui-fg-muted">Brand</Text>
            <FacetSelect
              value={brandInput}
              onChange={(event) => setBrandInput(event.target.value)}
              placeholder="All brands"
            >
              {brandChoices.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </FacetSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Text className="txt-compact-small text-ui-fg-muted">Type</Text>
            <FacetSelect
              value={typeIdInput}
              onChange={(event) => setTypeIdInput(event.target.value)}
              placeholder="All types"
            >
              {facetOptions.types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </FacetSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Text className="txt-compact-small text-ui-fg-muted">Tag</Text>
            <FacetSelect
              value={tagIdInput}
              onChange={(event) => setTagIdInput(event.target.value)}
              placeholder="All tags"
            >
              {facetOptions.tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </FacetSelect>
          </div>
        </>
      ) : (
        <Input
          type="text"
          placeholder="Brand (e.g. AS Colour)"
          value={brandInput}
          onChange={(event) => setBrandInput(event.target.value)}
        />
      )}

      <Input
        type="text"
        placeholder="Fabric (e.g. cotton)"
        value={fabricInput}
        onChange={(event) => setFabricInput(event.target.value)}
      />

      <div className="flex gap-2 pt-1">
        <Button type="button" size="small" onClick={applyFilters}>
          Apply
        </Button>
        <Button type="button" size="small" variant="secondary" onClick={clearFilters}>
          Clear
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile + tablet portrait: trigger row + slide-up drawer */}
      <div className="small:hidden sticky top-20 z-30 mb-4 flex items-center justify-between gap-2 rounded-lg border border-ui-border-base bg-white px-3 py-3 shadow-sm">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-field-hover"
          data-testid="filters-open-button"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {activeFilterCount > 0 ? (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-secondary)] px-1.5 text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <div className="flex-1 min-w-0">
          <SortProducts
            sortBy={sortBy}
            setQueryParams={setSortQueryParam}
            data-testid={dataTestId}
            variant="inline-mobile"
          />
        </div>
      </div>

      {drawerOpen ? (
        <div className="small:hidden fixed inset-0 z-50 flex flex-col">
          <button
            type="button"
            aria-label="Close filters"
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="flex items-center justify-between border-b border-ui-border-base px-5 py-4">
              <h2 className="text-lg font-semibold text-ui-fg-base">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-ui-fg-subtle hover:bg-ui-bg-subtle"
              >
                <XMark className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex flex-col gap-8 overflow-y-auto px-5 py-5">
              <SortProducts
                sortBy={sortBy}
                setQueryParams={setSortQueryParam}
                data-testid={dataTestId}
              />
              {filterForm}
            </div>
          </div>
        </div>
      ) : null}

      {/* Desktop: inline sidebar (existing layout) */}
      <div className="hidden small:flex small:flex-col gap-12 py-4 mb-8 small:px-0 small:min-w-[250px] small:ml-[1.675rem]">
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setSortQueryParam}
          data-testid={dataTestId}
        />
        {filterForm}
      </div>
    </>
  )
}

export default RefinementList
