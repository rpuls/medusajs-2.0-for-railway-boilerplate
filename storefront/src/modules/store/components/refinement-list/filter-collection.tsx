'use client'

import { useSearchParams } from "next/navigation"
import FilterCheckboxGroup from "@modules/common/components/filter-checkbox-group"
import { HttpTypes } from "@medusajs/types"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

type FilterCollectionProps = {
  collections: HttpTypes.StoreCollection[]
  setQueryParamsArray: (name: string, values: string[]) => void
  "data-testid"?: string
}

const FilterCollection = ({
  collections,
  setQueryParamsArray,
  "data-testid": dataTestId,
}: FilterCollectionProps) => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  // Get all collection values from URL (can be multiple)
  const selectedCollectionIds = searchParams.getAll("collection").filter(Boolean)

  const handleChange = (value: string, checked: boolean) => {
    if (value === "") {
      // "All Collections" - clear all selections
      setQueryParamsArray("collection", [])
      return
    }

    let newValues: string[]
    if (checked) {
      // Add to selection
      newValues = [...selectedCollectionIds, value]
    } else {
      // Remove from selection
      newValues = selectedCollectionIds.filter((id) => id !== value)
    }

    setQueryParamsArray("collection", newValues)
  }

  const items = [
    ...collections.map((collection) => ({
      value: collection.id,
      label: collection.title || collection.handle,
    })),
  ]

  return (
    <FilterCheckboxGroup
      title={t("filters.collection")}
      items={items}
      selectedValues={selectedCollectionIds}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default FilterCollection



