'use client'

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

type FilterPriceProps = {
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const FilterPrice = ({
  setQueryParams,
  "data-testid": dataTestId,
}: FilterPriceProps) => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const selectedPriceRange = searchParams.get("price") || ""

  const priceRanges = useMemo(() => [
    { value: "", label: t("filters.allPrices") },
    { value: "0-25", label: t("filters.under25") },
    { value: "25-50", label: t("filters.price25to50") },
    { value: "50-100", label: t("filters.price50to100") },
    { value: "100-200", label: t("filters.price100to200") },
    { value: "200+", label: t("filters.price200Plus") },
  ], [t])

  const handleChange = (value: string) => {
    if (value === selectedPriceRange) {
      // If clicking the same option, deselect it (unless it's "All Prices" which is already the default)
      if (value === "") {
        // "All Prices" is already selected, do nothing
        return
      }
      // Deselect specific price range by setting to "All Prices"
      setQueryParams("price", "")
    } else {
      // Select the new option
      setQueryParams("price", value)
    }
  }

  return (
    <FilterRadioGroup
      title={t("filters.price")}
      items={priceRanges}
      value={selectedPriceRange}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default FilterPrice



