'use client'

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { Chip } from '@mui/material'
import { Close } from '@mui/icons-material'
import { HttpTypes } from "@medusajs/types"
import { useTranslation } from "@lib/i18n/hooks/use-translation"
import { Brand } from "@lib/data/brands"

type ActiveFiltersProps = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  brands?: Brand[]
  selectedCollectionIds?: string[]
  selectedCategoryIds?: string[]
  selectedBrandIds?: string[]
  selectedPriceRange?: string
}

const ActiveFilters = ({
  collections,
  categories,
  brands = [],
  selectedCollectionIds = [],
  selectedCategoryIds = [],
  selectedBrandIds = [],
  selectedPriceRange,
}: ActiveFiltersProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const priceRanges = useMemo(() => [
    { value: "0-25", label: t("filters.under25") },
    { value: "25-50", label: t("filters.price25to50") },
    { value: "50-100", label: t("filters.price50to100") },
    { value: "100-200", label: t("filters.price100to200") },
    { value: "200+", label: t("filters.price200Plus") },
  ], [t])

  const createQueryString = useCallback(
    (name: string, values: string[]) => {
      const params = new URLSearchParams(searchParams)
      // Remove all existing values for this parameter
      params.delete(name)
      // Add new values
      if (values.length > 0) {
        values.forEach((v) => {
          if (v) {
            params.append(name, v)
          }
        })
      }
      // Reset to page 1 when filters change
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  const removeCollection = (collectionId: string) => {
    const newCollectionIds = selectedCollectionIds.filter((id) => id !== collectionId)
    const query = createQueryString("collection", newCollectionIds)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  const removeCategory = (categoryId: string) => {
    const newCategoryIds = selectedCategoryIds.filter((id) => id !== categoryId)
    const query = createQueryString("category", newCategoryIds)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  const removeBrand = (brandId: string) => {
    const newBrandIds = selectedBrandIds.filter((id) => id !== brandId)
    const query = createQueryString("brand", newBrandIds)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  const removePrice = () => {
    const params = new URLSearchParams(searchParams)
    params.delete("price")
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const activeFilters = []

  // Add collection filters
  selectedCollectionIds.forEach((collectionId) => {
    const collection = collections.find((c) => c.id === collectionId)
    if (collection) {
      activeFilters.push({
        type: "collection" as const,
        id: collectionId,
        label: collection.title || collection.handle || "Collection",
        onRemove: () => removeCollection(collectionId),
      })
    }
  })

  // Add category filters
  selectedCategoryIds.forEach((categoryId) => {
    const category = categories.find((c) => c.id === categoryId)
    if (category) {
      activeFilters.push({
        type: "category" as const,
        id: categoryId,
        label: category.name || category.handle || "Category",
        onRemove: () => removeCategory(categoryId),
      })
    }
  })

  // Add brand filters
  selectedBrandIds.forEach((brandId) => {
    const brand = brands.find((b) => b.id === brandId)
    if (brand) {
      activeFilters.push({
        type: "brand" as const,
        id: brandId,
        label: brand.name || t("filters.brand"),
        onRemove: () => removeBrand(brandId),
      })
    }
  })

  // Add price filter
  if (selectedPriceRange) {
    const priceLabel = priceRanges.find((p) => p.value === selectedPriceRange)?.label || "Price"
    activeFilters.push({
      type: "price" as const,
      id: "price",
      label: priceLabel,
      onRemove: removePrice,
    })
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Chip
          key={`${filter.type}-${filter.id}`}
          label={filter.label}
          onDelete={filter.onRemove}
          deleteIcon={<Close />}
          size="small"
          sx={{
            backgroundColor: '#f3f4f6',
            color: '#374151',
            '&:hover': {
              backgroundColor: '#e5e7eb',
            },
            '& .MuiChip-deleteIcon': {
              color: '#6b7280',
              fontSize: '1rem',
              '&:hover': {
                color: '#374151',
              },
            },
          }}
        />
      ))}
    </div>
  )
}

export default ActiveFilters
