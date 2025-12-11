'use client'

import { useSearchParams } from "next/navigation"
import FilterCheckboxGroup from "@modules/common/components/filter-checkbox-group"
import { useTranslation } from "@lib/i18n/hooks/use-translation"
import { Brand } from "@lib/data/brands"

type FilterBrandProps = {
  brands: Brand[]
  setQueryParamsArray: (name: string, values: string[]) => void
  "data-testid"?: string
}

const FilterBrand = ({
  brands,
  setQueryParamsArray,
  "data-testid": dataTestId,
}: FilterBrandProps) => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  // Get all brand values from URL (can be multiple)
  const selectedBrandIds = searchParams.getAll("brand").filter(Boolean)

  const handleChange = (value: string, checked: boolean) => {
    let newValues: string[]
    if (checked) {
      // Add to selection
      newValues = [...selectedBrandIds, value]
    } else {
      // Remove from selection
      newValues = selectedBrandIds.filter((id) => id !== value)
    }

    setQueryParamsArray("brand", newValues)
  }

  // Debug logging (remove in production)
  if (typeof window !== 'undefined') {
    console.log('[FilterBrand] Brands received:', brands?.length || 0, brands)
  }

  const items = [
    ...(brands || []).map((brand) => ({
      value: brand.id,
      label: brand.name,
    })),
  ]

  // Don't render if no brands
  if (!items || items.length === 0) {
    return null
  }

  return (
    <FilterCheckboxGroup
      title={t("filters.brand")}
      items={items}
      selectedValues={selectedBrandIds}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default FilterBrand

